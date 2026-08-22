"""Google Drive upload for media files (renderings, drawing sheets).

Why OAuth user credentials, not a service account
-------------------------------------------------
A service account **owns whatever it creates**, and its storage quota is zero. Uploading
to personal (@gmail.com) Drive therefore always fails with
`403 Service Accounts do not have storage quota` — *including inside a folder the user
shared with it*, since sharing grants write permission but does not transfer ownership
of new files. Verified directly against this project's account: simple and resumable
uploads both fail, and the target folder reports `driveId: None` (My Drive, not a Shared
Drive, which is the one case where service accounts do work).

So the primary path is an **OAuth user token**: the account owner consents once via
`scripts/google_oauth_setup.py`, the refresh token is stored, and uploads are owned by —
and billed to — that user. The service-account path is kept for a Workspace Shared Drive.

The Drive client is built lazily and cached: constructing it performs discovery and a
token exchange, which should not happen on import or per request.
"""
from __future__ import annotations

import io
import os
from dataclasses import dataclass
from functools import lru_cache

from google.auth.transport.requests import Request
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaIoBaseUpload

from app.config import Settings

# Full Drive scope: uploads need write access, and `drive.file` would restrict the
# service account to files it created — which excludes the shared destination folder.
SCOPES = ["https://www.googleapis.com/auth/drive"]


class DriveNotConfigured(RuntimeError):
    """Drive upload was requested but the server has no credentials/folder set."""


class DriveUploadError(RuntimeError):
    """Drive rejected an upload; message is safe to surface to an admin caller."""


@dataclass(frozen=True)
class UploadedFile:
    name: str
    file_id: str
    # Where the file can be viewed/fetched. When `google_drive_public` is on this is a
    # direct-content URL suitable for an <img src>; otherwise it is the Drive UI link.
    url: str
    mime_type: str
    size: int


@lru_cache(maxsize=2)
def _service(mode: str, cred_file: str):
    """Build a Drive client. Cached per (mode, file) — discovery is not free."""
    if mode == "oauth":
        creds = Credentials.from_authorized_user_file(cred_file, SCOPES)
        if not creds.valid:
            if not (creds.expired and creds.refresh_token):
                raise DriveNotConfigured(
                    f"The OAuth token in {cred_file} is invalid and has no refresh "
                    "token. Re-run scripts/google_oauth_setup.py."
                )
            creds.refresh(Request())
            # Persist the rotated access token so the next process start reuses it.
            with open(cred_file, "w") as fh:
                fh.write(creds.to_json())
    else:
        creds = service_account.Credentials.from_service_account_file(
            cred_file, scopes=SCOPES
        )
    return build("drive", "v3", credentials=creds, cache_discovery=False)


def _credentials(settings: Settings) -> tuple[str, str]:
    """Pick the credential mode. OAuth wins — it is the one that works on My Drive."""
    token = settings.google_oauth_token_file
    if token and os.path.exists(token):
        return "oauth", token
    if settings.google_service_account_file:
        return "service_account", settings.google_service_account_file
    raise DriveNotConfigured(
        "No Google credentials configured. Run scripts/google_oauth_setup.py and set "
        "GOOGLE_OAUTH_TOKEN_FILE (required for personal Drive), or set "
        "GOOGLE_SERVICE_ACCOUNT_FILE if the destination is a Workspace Shared Drive."
    )


def _require_config(settings: Settings) -> tuple[str, str, str]:
    mode, cred_file = _credentials(settings)
    if not settings.google_drive_folder_id:
        raise DriveNotConfigured(
            "GOOGLE_DRIVE_FOLDER_ID is not set — uploads need a destination folder."
        )
    return mode, cred_file, settings.google_drive_folder_id


def _unique_name(svc, folder_id: str, filename: str) -> str:
    """Return `filename`, or the first `name (n).ext` that is free in the folder.

    Drive happily stores several files with identical names in one folder — it keys on
    id, not name. That makes uploads silently non-idempotent: a retried or double-clicked
    request leaves two indistinguishable copies, and the stored URLs give no way to tell
    which is which. Resolving the collision here means a name identifies exactly one file.

    Deliberately a rename, not a rejection: an admin uploading `plan.jpg` for a second
    space should not be blocked because another space already used that name. What they
    must not get is two files both called `plan.jpg`.
    """
    stem, dot, ext = filename.rpartition(".")
    if not dot:  # no extension
        stem, ext = filename, ""

    try:
        existing = (
            svc.files()
            .list(
                q=f"'{folder_id}' in parents and trashed = false",
                fields="files(name)",
                pageSize=1000,
                supportsAllDrives=True,
                includeItemsFromAllDrives=True,
            )
            .execute()
        )
    except HttpError:
        # A listing failure must not block the upload — worst case we are back to the
        # old duplicate-name behaviour, which is better than refusing the file.
        return filename

    taken = {f.get("name", "") for f in existing.get("files", [])}
    if filename not in taken:
        return filename

    suffix = 2
    while True:
        candidate = f"{stem} ({suffix}){'.' + ext if ext else ''}"
        if candidate not in taken:
            return candidate
        suffix += 1


def upload_bytes(
    settings: Settings,
    *,
    filename: str,
    content: bytes,
    mime_type: str,
) -> UploadedFile:
    """Upload one file into the configured folder and return its identifiers.

    The name is made unique within the destination folder first — see `_unique_name`.
    """
    mode, cred_file, folder_id = _require_config(settings)
    svc = _service(mode, cred_file)
    filename = _unique_name(svc, folder_id, filename)

    media = MediaIoBaseUpload(
        io.BytesIO(content), mimetype=mime_type or "application/octet-stream",
        resumable=False,
    )
    try:
        created = (
            svc.files()
            .create(
                body={"name": filename, "parents": [folder_id]},
                media_body=media,
                fields="id,name,mimeType,size,webViewLink",
                # Required for destinations that live in a Shared Drive.
                supportsAllDrives=True,
            )
            .execute()
        )
    except HttpError as exc:
        hint = ""
        if mode == "service_account" and "storage quota" in (exc.reason or "").lower():
            hint = (
                " — this is the service-account dead end: it owns what it uploads and "
                "has zero quota, and sharing the folder does not change that. Run "
                "scripts/google_oauth_setup.py and set GOOGLE_OAUTH_TOKEN_FILE."
            )
        raise DriveUploadError(
            f"Drive rejected {filename!r}: {exc.status_code} {exc.reason}{hint}"
        ) from exc

    file_id = created["id"]
    url = created.get("webViewLink", f"https://drive.google.com/file/d/{file_id}/view")

    if settings.google_drive_public:
        try:
            svc.permissions().create(
                fileId=file_id,
                body={"role": "reader", "type": "anyone"},
                supportsAllDrives=True,
            ).execute()
            # Direct-content URL — what an <img src> needs; webViewLink renders the
            # Drive viewer chrome instead of the image itself.
            url = f"https://drive.google.com/uc?export=view&id={file_id}"
        except HttpError as exc:
            raise DriveUploadError(
                f"Uploaded {filename!r} but could not make it public: "
                f"{exc.status_code} {exc.reason}"
            ) from exc

    return UploadedFile(
        name=created.get("name", filename),
        file_id=file_id,
        url=url,
        mime_type=created.get("mimeType", mime_type),
        size=int(created.get("size") or len(content)),
    )

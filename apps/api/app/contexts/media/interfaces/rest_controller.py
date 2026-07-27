"""Media context REST controller — rendering / drawing-sheet image sets.

Hand-written rather than `make_crud_router`: media needs collection filters beyond
`?projectId=` and a DELETE, neither of which the generic factory exposes.
"""
from __future__ import annotations

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    Response,
    UploadFile,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.shared.drive import (
    DriveNotConfigured,
    DriveUploadError,
    UploadedFile,
    upload_bytes,
)
from app.shared.pdf import PdfRenderError, render_pdf_to_jpegs

from app.contexts.media.application.use_cases import MediaSetService
from app.contexts.media.infrastructure.project_refs_client import LocalProjectRefsClient
from app.contexts.media.infrastructure.repository_impl import (
    SqlAlchemyMediaSetRepository,
)
from app.contexts.media.interfaces import schemas as s
from app.contexts.project.infrastructure.repository_impl import (
    SqlAlchemyDomainRepository,
    SqlAlchemyProjectRepository,
    SqlAlchemySpaceRepository,
)
from app.shared.auth import require_admin, require_user
from app.shared.db import get_session
from app.shared.errors import NotFoundError, ValidationError

media_sets_router = APIRouter(prefix="/media-sets", tags=["media"])

# Shared query param: restrict a collection to one project (see shared/crud.py).
_PROJECT_Q = Query(
    None,
    alias="projectId",
    description="Restrict to one project. Omitted returns every project's rows.",
)


def _service(session: AsyncSession = Depends(get_session)) -> MediaSetService:
    return MediaSetService(
        SqlAlchemyMediaSetRepository(session),
        LocalProjectRefsClient(
            projects=SqlAlchemyProjectRepository(session),
            domains=SqlAlchemyDomainRepository(session),
            spaces=SqlAlchemySpaceRepository(session),
        ),
    )


@media_sets_router.get(
    "", response_model=list[s.MediaSetResponse], dependencies=[Depends(require_user)]
)
async def list_media_sets(
    service: MediaSetService = Depends(_service),
    project_id: str | None = _PROJECT_Q,
    kind: s.MediaKind | None = Query(None),
    domain_id: str | None = Query(None, alias="domainId"),
    space_id: str | None = Query(None, alias="spaceId"),
):
    sets = await service.list_filtered(project_id, kind, domain_id, space_id)
    return [s.MediaSetResponse.model_validate(m) for m in sets]


@media_sets_router.post(
    "", response_model=s.MediaSetResponse, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def create_media_set(
    body: s.MediaSetCreate, service: MediaSetService = Depends(_service)
):
    try:
        media_set = await service.create(body.model_dump(by_alias=False))
    except ValidationError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc
    return s.MediaSetResponse.model_validate(media_set)


@media_sets_router.get(
    "/{media_set_id}", response_model=s.MediaSetResponse,
    dependencies=[Depends(require_user)],
)
async def get_media_set(
    media_set_id: str, service: MediaSetService = Depends(_service)
):
    try:
        media_set = await service.get(media_set_id)
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return s.MediaSetResponse.model_validate(media_set)


@media_sets_router.patch(
    "/{media_set_id}", response_model=s.MediaSetResponse,
    dependencies=[Depends(require_admin)],
)
async def update_media_set(
    media_set_id: str,
    body: s.MediaSetUpdate,
    service: MediaSetService = Depends(_service),
):
    changes = body.model_dump(by_alias=False, exclude_unset=True)
    try:
        media_set = await service.update(media_set_id, changes)
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc
    return s.MediaSetResponse.model_validate(media_set)


@media_sets_router.delete(
    "/{media_set_id}", status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
async def delete_media_set(
    media_set_id: str, service: MediaSetService = Depends(_service)
):
    try:
        await service.delete(media_set_id)
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)



# --- Google Drive uploads --------------------------------------------------------
#
# Images for renderings and drawing sheets used to be paths under `public/images/`,
# which only works for files already in the repo. These endpoints accept the files
# themselves — several at a time — push them to Drive, and hand back URLs.
#
# Limits are enforced per file rather than trusting the client: an admin session is
# still a browser, and a stray multi-GB upload would be read straight into memory.
MAX_FILE_BYTES = 25 * 1024 * 1024
ALLOWED_PREFIXES = ("image/", "application/pdf")

uploads_router = APIRouter(prefix="/uploads", tags=["media"])


async def _read_and_upload(
    files: list[UploadFile], settings: Settings
) -> list[UploadedFile]:
    """Validate, read and push each file, mapping Drive failures onto HTTP errors."""
    if not files:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY, "No files were provided."
        )

    uploaded: list[UploadedFile] = []
    for f in files:
        mime = f.content_type or "application/octet-stream"
        if not mime.startswith(ALLOWED_PREFIXES):
            raise HTTPException(
                status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                f"{f.filename!r} is {mime}; only images and PDFs are accepted.",
            )
        content = await f.read()
        if len(content) > MAX_FILE_BYTES:
            raise HTTPException(
                status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                f"{f.filename!r} is {len(content) // 1024 // 1024} MB; the limit is "
                f"{MAX_FILE_BYTES // 1024 // 1024} MB per file.",
            )
        if not content:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_ENTITY, f"{f.filename!r} is empty."
            )
        name = f.filename or "untitled"

        # A PDF becomes one high-resolution JPEG per page. PDFs cannot render in an
        # <img>, so storing the original would leave the gallery with a download link
        # where a sheet should be. The source PDF is deliberately NOT kept — the point
        # of the upload is a viewable sheet.
        if mime == "application/pdf":
            stem = name[:-4] if name.lower().endswith(".pdf") else name
            try:
                pages = render_pdf_to_jpegs(
                    content,
                    stem=stem,
                    dpi=settings.pdf_render_dpi,
                    quality=settings.pdf_jpeg_quality,
                )
            except PdfRenderError as exc:
                raise HTTPException(
                    status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)
                ) from exc
            renditions = [(p.filename, p.content, "image/jpeg") for p in pages]
        else:
            renditions = [(name, content, mime)]

        try:
            for rendition_name, rendition_bytes, rendition_mime in renditions:
                uploaded.append(
                    upload_bytes(
                        settings,
                        filename=rendition_name,
                        content=rendition_bytes,
                        mime_type=rendition_mime,
                    )
                )
        except DriveNotConfigured as exc:
            # 501: the server, not the caller, is missing configuration.
            raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, str(exc)) from exc
        except DriveUploadError as exc:
            raise HTTPException(status.HTTP_502_BAD_GATEWAY, str(exc)) from exc
    return uploaded


@uploads_router.post(
    "", response_model=list[s.UploadedFileResponse],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def upload_files(
    files: list[UploadFile] = File(..., description="One or more images/PDFs."),
    settings: Settings = Depends(get_settings),
):
    """Upload files to Drive and return their URLs, without attaching them to a set."""
    return [
        s.UploadedFileResponse.model_validate(u, from_attributes=True)
        for u in await _read_and_upload(files, settings)
    ]


@media_sets_router.post(
    "/{media_set_id}/files", response_model=s.MediaSetResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def upload_media_set_files(
    media_set_id: str,
    files: list[UploadFile] = File(..., description="One or more images/PDFs."),
    service: MediaSetService = Depends(_service),
    settings: Settings = Depends(get_settings),
):
    """Upload files and append their URLs to this set's `images`, in order.

    The set is resolved *before* anything is uploaded, so a bad id fails fast instead of
    leaving orphaned files in Drive.
    """
    try:
        media_set = await service.get(media_set_id)
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc

    uploaded = await _read_and_upload(files, settings)
    images = [*media_set.images, *(u.url for u in uploaded)]
    try:
        updated = await service.update(media_set_id, {"images": images})
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc
    return s.MediaSetResponse.model_validate(updated)


routers = [media_sets_router, uploads_router]

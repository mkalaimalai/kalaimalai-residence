"""Supabase Admin API adapter — the only way to write `app_metadata`.

Why this exists at all: authorization reads `app_metadata.role` off the verified access
token (`app/shared/auth.py`). That claim is writable *only* with the service_role key.
`user_metadata`, which the user can set themselves with the public anon key, is
deliberately not trusted — using it would make `updateUser({data:{role:"admin"}})` a
complete privilege escalation.

So promoting someone is an out-of-band call to Supabase's admin endpoint, not a row
update. The `user_profiles.role` column mirrors the result for display; it never decides
anything.
"""
from __future__ import annotations

import httpx

from app.config import Settings


class AdminApiNotConfigured(RuntimeError):
    """A role write was requested but SUPABASE_SERVICE_ROLE_KEY / URL are not set."""


class AdminApiError(RuntimeError):
    """Supabase rejected the call; the message is safe to show an admin caller."""


def _require_config(settings: Settings) -> tuple[str, str]:
    if not settings.supabase_url:
        raise AdminApiNotConfigured(
            "SUPABASE_URL is not set, so the admin API host is unknown."
        )
    if not settings.supabase_service_role_key:
        raise AdminApiNotConfigured(
            "SUPABASE_SERVICE_ROLE_KEY is not set. Writing app_metadata.role needs the "
            "service_role key — the anon key cannot do it, by design."
        )
    return settings.supabase_url.rstrip("/"), settings.supabase_service_role_key


def set_app_role(settings: Settings, user_id: str, role: str) -> None:
    """Set `app_metadata.role` for one Supabase auth user.

    Supabase merges `app_metadata` rather than replacing it, so other keys survive.
    The new role only reaches the client on their next token refresh — an already-issued
    access token keeps the old claim until it expires (Supabase default: 1 hour).
    """
    base, key = _require_config(settings)
    try:
        res = httpx.put(
            f"{base}/auth/v1/admin/users/{user_id}",
            headers={
                "apikey": key,
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
            },
            json={"app_metadata": {"role": role}},
            timeout=10.0,
        )
    except httpx.HTTPError as exc:
        raise AdminApiError(f"Could not reach the Supabase admin API: {exc}") from exc

    if res.status_code == 404:
        raise AdminApiError(f"No Supabase auth user with id {user_id}.")
    if res.status_code >= 400:
        # Deliberately not echoing the body verbatim — it can carry request context we
        # would rather not surface, and the status plus our own framing is enough.
        raise AdminApiError(
            f"Supabase refused the role change ({res.status_code}). Check that "
            "SUPABASE_SERVICE_ROLE_KEY belongs to this project."
        )

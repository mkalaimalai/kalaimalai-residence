"""Identity context REST controller — the signed-in person's profile.

There is no `POST /auth/signup` or `POST /auth/login` here, and that is deliberate:
Supabase Auth issues credentials and sessions, the browser talks to it directly, and
this API only ever *verifies* the resulting token. Adding a password endpoint would mean
a second identity store and a hand-rolled implementation of the part Supabase already
does correctly.

Every route derives its subject from the verified token, never from the path or body —
so `/me` cannot be pointed at anyone else.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.contexts.identity.application.use_cases import UserProfileService
from app.contexts.identity.infrastructure.repository_impl import (
    SqlAlchemyUserProfileRepository,
)
from app.contexts.identity.infrastructure.supabase_admin import (
    AdminApiError,
    AdminApiNotConfigured,
    set_app_role,
    set_user_password,
)
from app.contexts.identity.interfaces import schemas as s
from app.shared.auth import AuthUser, require_admin, require_user
from app.shared.db import get_session
from app.shared.errors import ValidationError

me_router = APIRouter(prefix="/me", tags=["identity"])
users_router = APIRouter(prefix="/users", tags=["identity"])


def _service(session: AsyncSession = Depends(get_session)) -> UserProfileService:
    return UserProfileService(SqlAlchemyUserProfileRepository(session))


@me_router.post("", response_model=s.UserProfileResponse)
async def ensure_me(
    user: AuthUser = Depends(require_user),
    service: UserProfileService = Depends(_service),
):
    """Create-or-refresh the caller's profile. The frontend calls this after sign-up
    and after every sign-in, which is what backfills accounts that predate this table.
    Idempotent, so it is a 200 rather than a 201."""
    return s.UserProfileResponse.model_validate(await service.ensure(user))


@me_router.get("", response_model=s.UserProfileResponse)
async def get_me(
    user: AuthUser = Depends(require_user),
    service: UserProfileService = Depends(_service),
):
    return s.UserProfileResponse.model_validate(await service.ensure(user))


@me_router.patch("", response_model=s.UserProfileResponse)
async def update_me(
    body: s.UserProfileUpdate,
    user: AuthUser = Depends(require_user),
    service: UserProfileService = Depends(_service),
):
    try:
        profile = await service.update_display_name(user, body.display_name)
    except ValidationError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc
    return s.UserProfileResponse.model_validate(profile)


@me_router.patch("/password")
async def update_password(
    body: s.UserPasswordUpdate,
    user: AuthUser = Depends(require_user),
    service: UserProfileService = Depends(_service),
    settings: Settings = Depends(get_settings),
):
    try:
        await service.change_password(user, body.new_password)
    except ValidationError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc
    try:
        set_user_password(settings, user.id, body.new_password)
    except AdminApiNotConfigured as exc:
        raise HTTPException(
            status.HTTP_501_NOT_IMPLEMENTED, str(exc)
        ) from exc
    except AdminApiError as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, str(exc)) from exc
    return {"ok": True}


@users_router.get(
    "", response_model=list[s.UserProfileResponse], dependencies=[Depends(require_admin)]
)
async def list_users(service: UserProfileService = Depends(_service)):
    """Who has signed up."""
    return [s.UserProfileResponse.model_validate(p) for p in await service.list_all()]


@users_router.patch("/{user_id}/role", response_model=s.UserProfileResponse)
async def set_user_role(
    user_id: str,
    body: s.UserRoleUpdate,
    actor: AuthUser = Depends(require_admin),
    service: UserProfileService = Depends(_service),
    settings: Settings = Depends(get_settings),
):
    """Promote or demote a user.

    Writes `app_metadata.role` in Supabase — the authorization source — and mirrors it
    onto the profile row. The target keeps their old permissions until their access
    token refreshes (Supabase default: within the hour).
    """

    def writer(uid: str, role: str) -> None:
        set_app_role(settings, uid, role)

    try:
        profile = await service.set_role(actor, user_id, body.role, writer)
    except ValidationError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc
    except AdminApiNotConfigured as exc:
        # 501: the server is missing configuration, not the caller.
        raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, str(exc)) from exc
    except AdminApiError as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, str(exc)) from exc
    return s.UserProfileResponse.model_validate(profile)


routers = [me_router, users_router]

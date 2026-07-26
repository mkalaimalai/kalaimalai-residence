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

from app.contexts.identity.application.use_cases import UserProfileService
from app.contexts.identity.infrastructure.repository_impl import (
    SqlAlchemyUserProfileRepository,
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


@users_router.get(
    "", response_model=list[s.UserProfileResponse], dependencies=[Depends(require_admin)]
)
async def list_users(service: UserProfileService = Depends(_service)):
    """Who has signed up. Read-only on purpose: promoting someone means writing
    `app_metadata.role`, which requires the service_role key and is done from the
    Supabase dashboard or an admin script — not from a request this API can serve."""
    return [s.UserProfileResponse.model_validate(p) for p in await service.list_all()]


routers = [me_router, users_router]

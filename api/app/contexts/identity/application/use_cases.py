"""Identity context use cases.

The whole context is three operations, and each one takes the *verified* `AuthUser` as
its starting point rather than a client-supplied id. That is the point: there is no code
path here that lets a caller name someone else, so no endpoint can be tricked into
reading or writing another person's profile.
"""
from __future__ import annotations

from app.contexts.identity.domain import entities as e
from app.contexts.identity.domain.repository import UserProfileRepository
from app.shared.auth import AuthUser
from app.shared.errors import ValidationError

# A display name is a label, not prose. Long enough for a real name, short enough that
# it cannot be used to smuggle a wall of text into an admin listing.
MAX_DISPLAY_NAME = 80


class UserProfileService:
    def __init__(self, repo: UserProfileRepository) -> None:
        self._repo = repo

    async def ensure(self, user: AuthUser) -> e.UserProfile:
        """Return the caller's profile, creating it on first sight.

        Called right after sign-up and after every sign-in, so the row exists even for
        accounts created before this table did (or straight from the Supabase dashboard).
        Idempotent by construction.

        `role` is refreshed from the token on every call because the token is the source
        of truth — this keeps the mirror from drifting after an admin promotion.
        """
        existing = await self._repo.get(user.id)
        profile = e.UserProfile(
            id=user.id,
            email=user.email,
            # Preserve a name the user has already chosen; default to the local part of
            # their email so an admin listing is never a wall of blank cells.
            display_name=(
                existing.display_name
                if existing and existing.display_name
                else _default_name(user.email)
            ),
            role=user.role,
        )
        if existing:
            profile.created_at = existing.created_at
        return await self._repo.upsert(profile)

    async def update_display_name(self, user: AuthUser, name: str) -> e.UserProfile:
        """The only self-service write.

        Notably absent: `role`. It mirrors `app_metadata.role`, which only the
        service_role key can set — letting it be patched here would make self-promotion
        a one-line request.
        """
        name = name.strip()
        if not name:
            raise ValidationError("displayName cannot be empty")
        if len(name) > MAX_DISPLAY_NAME:
            raise ValidationError(
                f"displayName cannot exceed {MAX_DISPLAY_NAME} characters"
            )
        profile = await self.ensure(user)
        profile.display_name = name
        return await self._repo.upsert(profile)

    async def list_all(self) -> list[e.UserProfile]:
        """Admin-only listing — guarded at the route, not here."""
        return await self._repo.list_all()


def _default_name(email: str | None) -> str | None:
    return email.split("@", 1)[0] if email else None

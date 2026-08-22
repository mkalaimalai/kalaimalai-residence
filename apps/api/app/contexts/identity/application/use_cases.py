"""Identity context use cases.

The whole context is three operations, and each one takes the *verified* `AuthUser` as
its starting point rather than a client-supplied id. That is the point: there is no code
path here that lets a caller name someone else, so no endpoint can be tricked into
reading or writing another person's profile.
"""
from __future__ import annotations

from collections.abc import Callable

from app.contexts.identity.domain import entities as e
from app.contexts.identity.domain.repository import UserProfileRepository
from app.shared.auth import AuthUser
from app.shared.errors import ValidationError

# PORT for "make this role real in the identity provider". Injected rather than imported
# so the guard logic in `set_role` is testable without a network call, and so the
# Supabase dependency stays in the infrastructure layer where it belongs.
RoleWriter = Callable[[str, str], None]

# A display name is a label, not prose. Long enough for a real name, short enough that
# it cannot be used to smuggle a wall of text into an admin listing.
MAX_DISPLAY_NAME = 80
# Supabase's own floor is 6; asking for more here is cheap and the error
# is clearer coming from us than bouncing off the API.
MIN_PASSWORD = 8


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

    async def change_password(self, user: AuthUser, new_password: str) -> None:
        """Validate the new password before the controller pushes it to
        Supabase via the admin API."""
        new_password = new_password.strip()
        if len(new_password) < MIN_PASSWORD:
            raise ValidationError(
                f"Password must be at least {MIN_PASSWORD} characters"
            )

    async def list_all(self) -> list[e.UserProfile]:
        """Admin-only listing — guarded at the route, not here."""
        return await self._repo.list_all()

    async def set_role(
        self, actor: AuthUser, user_id: str, role: str, writer: RoleWriter
    ) -> e.UserProfile:
        """Change another user's role. Admin-only, guarded at the route.

        Order matters: `app_metadata` is written first, and the mirror row only after it
        succeeds. Doing it the other way round would leave the profile claiming a role
        the token will never carry — a listing that lies about who can do what.
        """
        if role not in e.ROLES:
            raise ValidationError(f"role must be one of {', '.join(e.ROLES)}")

        # Self-demotion is how an admin locks themselves out: the only way back is the
        # Supabase dashboard, and if they were the last admin, nobody can undo it from
        # the app at all. Changing *someone else's* role is unrestricted.
        if user_id == actor.id and role != e.ADMIN:
            raise ValidationError(
                "You cannot remove your own admin role — ask another admin to do it."
            )

        writer(user_id, role)

        existing = await self._repo.get(user_id)
        profile = e.UserProfile(
            id=user_id,
            email=existing.email if existing else None,
            display_name=existing.display_name if existing else None,
            role=role,
        )
        if existing:
            profile.created_at = existing.created_at
        return await self._repo.upsert(profile)


def _default_name(email: str | None) -> str | None:
    return email.split("@", 1)[0] if email else None

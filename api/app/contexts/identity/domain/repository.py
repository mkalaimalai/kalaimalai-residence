"""Repository PORT for the identity context.

Not a `CrudRepository`: profiles are never created by id from a client payload — they
are derived from a verified token — so the generic create/update surface would be a
wider door than this context wants.
"""
from __future__ import annotations

from app.contexts.identity.domain.entities import UserProfile


class UserProfileRepository:
    async def get(self, user_id: str) -> UserProfile | None: ...

    async def list_all(self) -> list[UserProfile]: ...

    async def upsert(self, profile: UserProfile) -> UserProfile: ...

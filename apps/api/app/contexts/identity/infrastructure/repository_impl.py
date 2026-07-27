"""SQLAlchemy adapter for the identity context repository port."""
from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.contexts.identity.domain import entities as e
from app.contexts.identity.domain.repository import UserProfileRepository
from app.contexts.identity.infrastructure import orm


def _to_entity(row: orm.UserProfileModel) -> e.UserProfile:
    return e.UserProfile(
        id=row.id,
        email=row.email,
        display_name=row.display_name,
        role=row.role,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


class SqlAlchemyUserProfileRepository(UserProfileRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get(self, user_id: str) -> e.UserProfile | None:
        row = await self._session.get(orm.UserProfileModel, user_id)
        return _to_entity(row) if row else None

    async def list_all(self) -> list[e.UserProfile]:
        stmt = select(orm.UserProfileModel).order_by(
            orm.UserProfileModel.created_at.desc()
        )
        result = await self._session.execute(stmt)
        return [_to_entity(row) for row in result.scalars().all()]

    async def upsert(self, profile: e.UserProfile) -> e.UserProfile:
        """Insert on first sight, otherwise patch the row in place.

        `created_at` is never overwritten — a returning user's signup date is a fact
        about them, not about this request.
        """
        row = await self._session.get(orm.UserProfileModel, profile.id)
        if row is None:
            row = orm.UserProfileModel(
                id=profile.id,
                email=profile.email,
                display_name=profile.display_name,
                role=profile.role,
                created_at=profile.created_at,
                updated_at=profile.updated_at,
            )
            self._session.add(row)
        else:
            row.email = profile.email
            row.display_name = profile.display_name
            row.role = profile.role
            row.updated_at = datetime.now(UTC)
        await self._session.commit()
        await self._session.refresh(row)
        return _to_entity(row)

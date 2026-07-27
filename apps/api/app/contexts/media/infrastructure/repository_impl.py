"""SQLAlchemy adapter for the media context repository port."""
from __future__ import annotations

from sqlalchemy import delete as sa_delete
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.contexts.media.domain import entities as e
from app.contexts.media.domain.repository import MediaSetRepository
from app.contexts.media.infrastructure import orm
from app.shared.crud import SqlAlchemyCrudRepository, make_mappers


class SqlAlchemyMediaSetRepository(
    SqlAlchemyCrudRepository[e.MediaSet], MediaSetRepository
):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, orm.MediaSetModel, e.MediaSet)
        self._session = session
        self._to_entity, _ = make_mappers(e.MediaSet)

    async def list_filtered(
        self,
        project_id: str | None = None,
        kind: str | None = None,
        domain_id: str | None = None,
        space_id: str | None = None,
    ) -> list[e.MediaSet]:
        model = orm.MediaSetModel
        stmt = select(model)
        for column, value in (
            (model.project_id, project_id),
            (model.kind, kind),
            (model.domain_id, domain_id),
            (model.space_id, space_id),
        ):
            if value is not None:
                stmt = stmt.where(column == value)
        stmt = stmt.order_by(model.sort_order, model.title)
        result = await self._session.execute(stmt)
        return [self._to_entity(row) for row in result.scalars().all()]

    async def delete(self, entity_id: str) -> bool:
        result = await self._session.execute(
            sa_delete(orm.MediaSetModel).where(orm.MediaSetModel.id == entity_id)
        )
        await self._session.commit()
        return result.rowcount > 0

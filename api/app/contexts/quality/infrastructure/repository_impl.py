"""SQLAlchemy adapters for the quality context repository ports."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.contexts.quality.domain import entities as e
from app.contexts.quality.domain.repository import (
    DecisionRepository,
    SnagRepository,
)
from app.contexts.quality.infrastructure import orm
from app.shared.crud import SqlAlchemyCrudRepository


class SqlAlchemySnagRepository(SqlAlchemyCrudRepository[e.Snag], SnagRepository):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, orm.SnagModel, e.Snag)


class SqlAlchemyDecisionRepository(
    SqlAlchemyCrudRepository[e.Decision], DecisionRepository
):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, orm.DecisionModel, e.Decision)

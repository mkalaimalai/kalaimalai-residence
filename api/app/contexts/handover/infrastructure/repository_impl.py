"""SQLAlchemy adapter for the handover context repository port."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.contexts.handover.domain import entities as e
from app.contexts.handover.domain.repository import WarrantyRepository
from app.contexts.handover.infrastructure import orm
from app.shared.crud import SqlAlchemyCrudRepository


class SqlAlchemyWarrantyRepository(
    SqlAlchemyCrudRepository[e.Warranty], WarrantyRepository
):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, orm.WarrantyModel, e.Warranty)

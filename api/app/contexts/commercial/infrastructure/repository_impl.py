"""SQLAlchemy adapters for the commercial context repository ports."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.contexts.commercial.domain import entities as e
from app.contexts.commercial.domain.repository import (
    BOQRepository,
    MaterialRepository,
    ProcurementRepository,
)
from app.contexts.commercial.infrastructure import orm
from app.shared.crud import SqlAlchemyCrudRepository


class SqlAlchemyBOQRepository(SqlAlchemyCrudRepository[e.BOQ], BOQRepository):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, orm.BOQModel, e.BOQ)


class SqlAlchemyProcurementRepository(
    SqlAlchemyCrudRepository[e.ProcurementItem], ProcurementRepository
):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, orm.ProcurementModel, e.ProcurementItem)


class SqlAlchemyMaterialRepository(
    SqlAlchemyCrudRepository[e.Material], MaterialRepository
):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, orm.MaterialModel, e.Material)

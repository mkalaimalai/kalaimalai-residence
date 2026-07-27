"""SQLAlchemy adapters for the commercial context repository ports."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.contexts.commercial.domain import entities as e
from app.contexts.commercial.domain.repository import (
    BOQLineItemRepository,
    BOQRepository,
    DeliveryRepository,
    MaterialRepository,
    ProcurementRepository,
    PurchaseOrderRepository,
    QuoteLineItemRepository,
    QuoteRepository,
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


class SqlAlchemyQuoteRepository(SqlAlchemyCrudRepository[e.Quote], QuoteRepository):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, orm.QuoteModel, e.Quote)


class SqlAlchemyQuoteLineItemRepository(
    SqlAlchemyCrudRepository[e.QuoteLineItem], QuoteLineItemRepository
):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, orm.QuoteLineItemModel, e.QuoteLineItem)


class SqlAlchemyPurchaseOrderRepository(
    SqlAlchemyCrudRepository[e.PurchaseOrder], PurchaseOrderRepository
):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, orm.PurchaseOrderModel, e.PurchaseOrder)


class SqlAlchemyDeliveryRepository(
    SqlAlchemyCrudRepository[e.Delivery], DeliveryRepository
):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, orm.DeliveryModel, e.Delivery)


class SqlAlchemyBOQLineItemRepository(
    SqlAlchemyCrudRepository[e.BOQLineItem], BOQLineItemRepository
):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, orm.BOQLineItemModel, e.BOQLineItem)

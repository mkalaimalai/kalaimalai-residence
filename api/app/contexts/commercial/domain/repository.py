"""Repository PORTS for the commercial context."""
from __future__ import annotations

from app.contexts.commercial.domain.entities import (
    BOQ,
    BOQLineItem,
    Delivery,
    Material,
    ProcurementItem,
    PurchaseOrder,
    Quote,
    QuoteLineItem,
)
from app.shared.crud import CrudRepository


class BOQRepository(CrudRepository[BOQ]):
    ...


class ProcurementRepository(CrudRepository[ProcurementItem]):
    ...


class MaterialRepository(CrudRepository[Material]):
    ...


class QuoteRepository(CrudRepository[Quote]):
    ...


class QuoteLineItemRepository(CrudRepository[QuoteLineItem]):
    ...


class PurchaseOrderRepository(CrudRepository[PurchaseOrder]):
    ...


class DeliveryRepository(CrudRepository[Delivery]):
    ...


class BOQLineItemRepository(CrudRepository[BOQLineItem]):
    ...

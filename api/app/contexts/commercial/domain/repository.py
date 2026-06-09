"""Repository PORTS for the commercial context."""
from __future__ import annotations

from app.contexts.commercial.domain.entities import BOQ, Material, ProcurementItem
from app.shared.crud import CrudRepository


class BOQRepository(CrudRepository[BOQ]):
    ...


class ProcurementRepository(CrudRepository[ProcurementItem]):
    ...


class MaterialRepository(CrudRepository[Material]):
    ...

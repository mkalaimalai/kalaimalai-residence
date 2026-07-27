"""Repository PORT for the handover context."""
from __future__ import annotations

from app.contexts.handover.domain.entities import Warranty
from app.shared.crud import CrudRepository


class WarrantyRepository(CrudRepository[Warranty]):
    ...

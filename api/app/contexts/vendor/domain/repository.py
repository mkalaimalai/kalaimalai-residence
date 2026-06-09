"""VendorRepository PORT — the hexagon boundary the domain depends on.

Implemented by an adapter in infrastructure/. The domain never imports SQLAlchemy.
"""
from __future__ import annotations

from abc import ABC, abstractmethod

from app.contexts.vendor.domain.entities import Vendor


class VendorRepository(ABC):
    @abstractmethod
    async def list_all(self) -> list[Vendor]: ...

    @abstractmethod
    async def get(self, vendor_id: str) -> Vendor | None: ...

    @abstractmethod
    async def exists(self, vendor_id: str) -> bool: ...

    @abstractmethod
    async def add(self, vendor: Vendor) -> Vendor: ...

    @abstractmethod
    async def update(self, vendor_id: str, changes: dict) -> Vendor | None: ...

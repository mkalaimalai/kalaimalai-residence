"""SqlAlchemyVendorRepository — the adapter implementing the VendorRepository port."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.contexts.vendor.domain.entities import Vendor
from app.contexts.vendor.domain.repository import VendorRepository
from app.contexts.vendor.infrastructure import mappers
from app.contexts.vendor.infrastructure.orm import VendorModel
from app.shared.sqlalchemy_repository import SqlAlchemyCrud


class SqlAlchemyVendorRepository(VendorRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._crud: SqlAlchemyCrud[VendorModel, Vendor] = SqlAlchemyCrud(
            session, VendorModel, mappers.to_entity, mappers.to_columns
        )

    async def list_all(self) -> list[Vendor]:
        return await self._crud.list_all()

    async def get(self, vendor_id: str) -> Vendor | None:
        return await self._crud.get(vendor_id)

    async def exists(self, vendor_id: str) -> bool:
        return await self._crud.exists(vendor_id)

    async def add(self, vendor: Vendor) -> Vendor:
        return await self._crud.add(vendor)

    async def update(self, vendor_id: str, changes: dict) -> Vendor | None:
        return await self._crud.update(vendor_id, changes)

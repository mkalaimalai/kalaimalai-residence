"""Vendor use cases — application services orchestrating the domain + ports."""
from __future__ import annotations

from app.contexts.vendor.application.commands import (
    CreateVendorCommand,
    UpdateVendorCommand,
)
from app.contexts.vendor.domain.entities import Vendor
from app.contexts.vendor.domain.repository import VendorRepository
from app.shared.errors import NotFoundError
from app.shared.ids import new_id


class ListVendors:
    def __init__(self, repo: VendorRepository) -> None:
        self._repo = repo

    async def __call__(self) -> list[Vendor]:
        return await self._repo.list_all()


class GetVendor:
    def __init__(self, repo: VendorRepository) -> None:
        self._repo = repo

    async def __call__(self, vendor_id: str) -> Vendor:
        vendor = await self._repo.get(vendor_id)
        if vendor is None:
            raise NotFoundError(f"vendor {vendor_id} not found")
        return vendor


class CreateVendor:
    def __init__(self, repo: VendorRepository) -> None:
        self._repo = repo

    async def __call__(self, cmd: CreateVendorCommand) -> Vendor:
        vendor = Vendor(
            id=new_id("vendor"),
            name=cmd.name,
            category=cmd.category,
            contact_person=cmd.contact_person,
            phone=cmd.phone,
            email=cmd.email,
            location=cmd.location,
            website=cmd.website,
            quote_url=cmd.quote_url,
            finalized=cmd.finalized,
            rating=cmd.rating,
            notes=cmd.notes,
        )
        return await self._repo.add(vendor)


class UpdateVendor:
    def __init__(self, repo: VendorRepository) -> None:
        self._repo = repo

    async def __call__(self, vendor_id: str, cmd: UpdateVendorCommand) -> Vendor:
        # Validate the rating invariant if it's being changed.
        if "rating" in cmd.changes:
            Vendor(
                id=vendor_id, name="", category="", contact_person="", phone="",
                email="", location="", website="", quote_url="", finalized=False,
                rating=cmd.changes["rating"], notes="",
            )
        updated = await self._repo.update(vendor_id, cmd.changes)
        if updated is None:
            raise NotFoundError(f"vendor {vendor_id} not found")
        return updated

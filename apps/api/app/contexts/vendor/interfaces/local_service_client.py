"""In-process adapter of VendorServiceClient — synchronous, swappable to HTTP later."""
from __future__ import annotations

from app.contexts.vendor.application.service_client import VendorServiceClient
from app.contexts.vendor.domain.repository import VendorRepository


class LocalVendorServiceClient(VendorServiceClient):
    """Calls the vendor repository in-process. When the monolith is split, replace
    with a RestVendorServiceClient hitting GET /vendors/{id} — no use-case changes."""

    def __init__(self, repo: VendorRepository) -> None:
        self._repo = repo

    async def exists(self, vendor_id: str) -> bool:
        if not vendor_id:
            return True  # "" means unset — not a dangling reference
        return await self._repo.exists(vendor_id)

    async def is_finalized(self, vendor_id: str) -> bool:
        vendor = await self._repo.get(vendor_id)
        return bool(vendor and vendor.finalized)

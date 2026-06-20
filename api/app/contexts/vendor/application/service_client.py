"""VendorServiceClient PORT — how OTHER contexts synchronously consult vendors.

Commercial/Quality/Handover depend on this abstraction (never on vendor tables).
An in-process adapter lives in interfaces/local_service_client.py today; it can be
swapped for a RestVendorServiceClient when the monolith is split, with no use-case
changes.
"""
from __future__ import annotations

from abc import ABC, abstractmethod


class VendorServiceClient(ABC):
    @abstractmethod
    async def exists(self, vendor_id: str) -> bool: ...

    @abstractmethod
    async def is_finalized(self, vendor_id: str) -> bool: ...

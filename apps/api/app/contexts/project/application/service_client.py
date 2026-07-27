"""ProjectServiceClient PORT — how other contexts synchronously validate references
into project-owned entities (spaces, domains). Consumed by commercial/quality/document.
"""
from __future__ import annotations

from abc import ABC, abstractmethod


class ProjectServiceClient(ABC):
    @abstractmethod
    async def space_exists(self, space_id: str) -> bool: ...

    @abstractmethod
    async def domain_exists(self, domain_id: str) -> bool: ...

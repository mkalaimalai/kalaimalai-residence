"""In-process ProjectServiceClient adapter (synchronous, swappable to HTTP later)."""
from __future__ import annotations

from app.contexts.project.application.service_client import ProjectServiceClient
from app.contexts.project.domain.repository import (
    DomainRepository,
    SpaceRepository,
)


class LocalProjectServiceClient(ProjectServiceClient):
    def __init__(
        self, spaces: SpaceRepository, domains: DomainRepository
    ) -> None:
        self._spaces = spaces
        self._domains = domains

    async def space_exists(self, space_id: str) -> bool:
        if not space_id:  # "" means unset
            return True
        return await self._spaces.exists(space_id)

    async def domain_exists(self, domain_id: str) -> bool:
        if not domain_id:
            return True
        return await self._domains.exists(domain_id)

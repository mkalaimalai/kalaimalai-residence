"""In-process ProjectRefsClient adapter (synchronous, swappable to HTTP later)."""
from __future__ import annotations

from app.contexts.media.application.service_client import ProjectRefsClient
from app.contexts.project.domain.repository import (
    DomainRepository,
    ProjectRepository,
    SpaceRepository,
)


class LocalProjectRefsClient(ProjectRefsClient):
    def __init__(
        self,
        projects: ProjectRepository,
        domains: DomainRepository,
        spaces: SpaceRepository,
    ) -> None:
        self._projects = projects
        self._domains = domains
        self._spaces = spaces

    async def project_exists(self, project_id: str) -> bool:
        return await self._projects.exists(project_id)

    async def domain_project(self, domain_id: str) -> str | None:
        domain = await self._domains.get(domain_id)
        return domain.project_id if domain else None

    async def space_project(self, space_id: str) -> str | None:
        space = await self._spaces.get(space_id)
        return space.project_id if space else None

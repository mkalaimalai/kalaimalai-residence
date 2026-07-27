"""Outbound PORT: what the media context needs to know about project-owned rows.

The media context never reads `projects`/`domains`/`spaces` directly — a set's owner
references are validated through this port so the check survives splitting the monolith
(swap the local adapter for a REST one; the use cases do not change).

`LocalProjectServiceClient` in the project context answers only "does this id exist",
which cannot catch a domain belonging to a *different* project, so media declares the
narrower question it actually asks.
"""
from __future__ import annotations

from abc import ABC, abstractmethod


class ProjectRefsClient(ABC):
    @abstractmethod
    async def project_exists(self, project_id: str) -> bool: ...

    @abstractmethod
    async def domain_project(self, domain_id: str) -> str | None:
        """The owning project id of a domain, or None when the domain is unknown."""

    @abstractmethod
    async def space_project(self, space_id: str) -> str | None:
        """The owning project id of a space, or None when the space is unknown."""

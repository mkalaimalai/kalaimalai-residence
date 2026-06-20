"""Repository PORTS for the project context (named for clarity; CRUD-shaped)."""
from __future__ import annotations

from app.contexts.project.domain.entities import (
    Domain,
    ProgressEntry,
    Project,
    Space,
)
from app.shared.crud import CrudRepository


class SpaceRepository(CrudRepository[Space]):
    ...


class DomainRepository(CrudRepository[Domain]):
    ...


class ProgressRepository(CrudRepository[ProgressEntry]):
    ...


class ProjectRepository(CrudRepository[Project]):
    ...

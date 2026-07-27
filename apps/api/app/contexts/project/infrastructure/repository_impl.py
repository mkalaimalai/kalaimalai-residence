"""SQLAlchemy adapters implementing the project context repository ports."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.contexts.project.domain import entities as e
from app.contexts.project.domain.repository import (
    DomainRepository,
    ProgressRepository,
    ProjectRepository,
    SpaceRepository,
)
from app.contexts.project.infrastructure import orm
from app.shared.crud import SqlAlchemyCrudRepository


class SqlAlchemySpaceRepository(SqlAlchemyCrudRepository[e.Space], SpaceRepository):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, orm.SpaceModel, e.Space)


class SqlAlchemyDomainRepository(SqlAlchemyCrudRepository[e.Domain], DomainRepository):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, orm.DomainModel, e.Domain)


class SqlAlchemyProgressRepository(
    SqlAlchemyCrudRepository[e.ProgressEntry], ProgressRepository
):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, orm.ProgressModel, e.ProgressEntry)


class SqlAlchemyProjectRepository(
    SqlAlchemyCrudRepository[e.Project], ProjectRepository
):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, orm.ProjectModel, e.Project)

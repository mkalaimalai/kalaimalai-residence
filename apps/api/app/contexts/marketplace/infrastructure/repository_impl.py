"""SqlAlchemy marketplace repositories — adapters implementing the repository ports."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.contexts.marketplace.domain.entities import (
    Professional,
    ProfessionalReview,
    ProjectBrief,
    BriefResponse,
)
from app.contexts.marketplace.domain.repository import (
    ProfessionalRepository,
    ProfessionalReviewRepository,
    ProjectBriefRepository,
)
from app.contexts.marketplace.infrastructure import mappers
from app.contexts.marketplace.infrastructure.orm import (
    ProfessionalModel,
    ProfessionalReviewModel,
    ProjectBriefModel,
    BriefResponseModel,
)
from app.shared.sqlalchemy_repository import SqlAlchemyCrud


class SqlAlchemyProfessionalRepository(ProfessionalRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._crud: SqlAlchemyCrud[ProfessionalModel, Professional] = SqlAlchemyCrud(
            session, ProfessionalModel, mappers.professional_to_entity, mappers.professional_to_columns
        )

    async def list_all(self, project_id: str | None = None) -> list[Professional]:
        return await self._crud.list_all(project_id)

    async def get(self, professional_id: str) -> Professional | None:
        return await self._crud.get(professional_id)

    async def exists(self, professional_id: str) -> bool:
        return await self._crud.exists(professional_id)

    async def add(self, professional: Professional) -> Professional:
        return await self._crud.add(professional)

    async def update(self, professional_id: str, changes: dict) -> Professional | None:
        return await self._crud.update(professional_id, changes)

    async def delete(self, professional_id: str) -> bool:
        return await self._crud.delete(professional_id)


class SqlAlchemyProfessionalReviewRepository(ProfessionalReviewRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._crud: SqlAlchemyCrud[ProfessionalReviewModel, ProfessionalReview] = SqlAlchemyCrud(
            session, ProfessionalReviewModel, mappers.review_to_entity, mappers.review_to_columns
        )

    async def list_by_professional(self, professional_id: str) -> list[ProfessionalReview]:
        # TODO: Implement filtering by professional_id
        return await self._crud.list_all(None)

    async def add(self, review: ProfessionalReview) -> ProfessionalReview:
        return await self._crud.add(review)


class SqlAlchemyProjectBriefRepository(ProjectBriefRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._crud: SqlAlchemyCrud[ProjectBriefModel, ProjectBrief] = SqlAlchemyCrud(
            session, ProjectBriefModel, mappers.brief_to_entity, mappers.brief_to_columns
        )
        self._response_crud: SqlAlchemyCrud[BriefResponseModel, BriefResponse] = SqlAlchemyCrud(
            session, BriefResponseModel, mappers.response_to_entity, mappers.response_to_columns
        )

    async def list_all(self, project_id: str | None = None) -> list[ProjectBrief]:
        return await self._crud.list_all(project_id)

    async def get(self, brief_id: str) -> ProjectBrief | None:
        return await self._crud.get(brief_id)

    async def add(self, brief: ProjectBrief) -> ProjectBrief:
        return await self._crud.add(brief)

    async def update(self, brief_id: str, changes: dict) -> ProjectBrief | None:
        return await self._crud.update(brief_id, changes)

    async def add_response(self, brief_id: str, response: BriefResponse) -> BriefResponse:
        return await self._response_crud.add(response)

    async def update_response(self, response_id: str, changes: dict) -> BriefResponse | None:
        return await self._response_crud.update(response_id, changes)
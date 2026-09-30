"""Marketplace repository ports — abstract storage interface."""
from __future__ import annotations

from app.contexts.marketplace.domain.entities import (
    Professional,
    ProfessionalReview,
    ProjectBrief,
    BriefResponse,
)


class ProfessionalRepository:
    async def list_all(self, project_id: str | None = None) -> list[Professional]:
        raise NotImplementedError

    async def get(self, professional_id: str) -> Professional | None:
        raise NotImplementedError

    async def exists(self, professional_id: str) -> bool:
        raise NotImplementedError

    async def add(self, professional: Professional) -> Professional:
        raise NotImplementedError

    async def update(
        self, professional_id: str, changes: dict
    ) -> Professional | None:
        raise NotImplementedError

    async def delete(self, professional_id: str) -> bool:
        raise NotImplementedError


class ProfessionalReviewRepository:
    async def list_by_professional(
        self, professional_id: str
    ) -> list[ProfessionalReview]:
        raise NotImplementedError

    async def add(self, review: ProfessionalReview) -> ProfessionalReview:
        raise NotImplementedError


class ProjectBriefRepository:
    async def list_all(self, project_id: str | None = None) -> list[ProjectBrief]:
        raise NotImplementedError

    async def get(self, brief_id: str) -> ProjectBrief | None:
        raise NotImplementedError

    async def add(self, brief: ProjectBrief) -> ProjectBrief:
        raise NotImplementedError

    async def update(
        self, brief_id: str, changes: dict
    ) -> ProjectBrief | None:
        raise NotImplementedError

    async def add_response(self, brief_id: str, response: BriefResponse) -> BriefResponse:
        raise NotImplementedError

    async def update_response(
        self, response_id: str, changes: dict
    ) -> BriefResponse | None:
        raise NotImplementedError
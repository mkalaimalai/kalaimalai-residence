"""Marketplace use cases — application services orchestrating the domain + ports."""
from __future__ import annotations

from app.contexts.marketplace.application.commands import (
    CreateProfessionalCommand,
    UpdateProfessionalCommand,
    CreateReviewCommand,
    CreateBriefCommand,
    UpdateBriefCommand,
    CreateResponseCommand,
    UpdateResponseCommand,
)
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
from app.shared.errors import NotFoundError
from app.shared.ids import new_id


class ListProfessionals:
    def __init__(self, repo: ProfessionalRepository) -> None:
        self._repo = repo

    async def __call__(self, project_id: str | None = None) -> list[Professional]:
        return await self._repo.list_all(project_id)


class GetProfessional:
    def __init__(self, repo: ProfessionalRepository) -> None:
        self._repo = repo

    async def __call__(self, professional_id: str) -> Professional:
        professional = await self._repo.get(professional_id)
        if professional is None:
            raise NotFoundError(f"professional {professional_id} not found")
        return professional


class CreateProfessional:
    def __init__(self, repo: ProfessionalRepository) -> None:
        self._repo = repo

    async def __call__(self, cmd: CreateProfessionalCommand) -> Professional:
        professional = Professional.create(
            project_id=cmd.project_id,
            name=cmd.name,
            company=cmd.company,
            type=cmd.type,
            specializations=cmd.specializations,
            contact_person=cmd.contact_person,
            phone=cmd.phone,
            email=cmd.email,
            location=cmd.location,
            service_areas=cmd.service_areas,
            website=cmd.website,
            portfolio_images=cmd.portfolio_images,
            certifications=cmd.certifications,
            license_number=cmd.license_number,
            rating=cmd.rating,
            review_count=cmd.review_count,
            status=cmd.status,
            availability=cmd.availability,
            hourly_rate=cmd.hourly_rate,
            currency=cmd.currency,
            notes=cmd.notes,
            user_id=cmd.user_id,
        )
        return await self._repo.add(professional)


class UpdateProfessional:
    def __init__(self, repo: ProfessionalRepository) -> None:
        self._repo = repo

    async def __call__(self, professional_id: str, cmd: UpdateProfessionalCommand) -> Professional:
        updated = await self._repo.update(professional_id, cmd.changes)
        if updated is None:
            raise NotFoundError(f"professional {professional_id} not found")
        return updated


class DeleteProfessional:
    def __init__(self, repo: ProfessionalRepository) -> None:
        self._repo = repo

    async def __call__(self, professional_id: str) -> bool:
        return await self._repo.delete(professional_id)


class ListProfessionalReviews:
    def __init__(self, repo: ProfessionalReviewRepository) -> None:
        self._repo = repo

    async def __call__(self, professional_id: str) -> list[ProfessionalReview]:
        return await self._repo.list_by_professional(professional_id)


class CreateReview:
    def __init__(self, repo: ProfessionalReviewRepository) -> None:
        self._repo = repo

    async def __call__(self, cmd: CreateReviewCommand) -> ProfessionalReview:
        review = ProfessionalReview.create(
            project_id=cmd.project_id,
            professional_id=cmd.professional_id,
            reviewer_id=cmd.reviewer_id,
            reviewer_name=cmd.reviewer_name,
            rating=cmd.rating,
            title=cmd.title,
            content=cmd.content,
            project_name=cmd.project_name,
            date=cmd.date,
            verified=cmd.verified,
        )
        return await self._repo.add(review)


class ListBriefs:
    def __init__(self, repo: ProjectBriefRepository) -> None:
        self._repo = repo

    async def __call__(self, project_id: str | None = None) -> list[ProjectBrief]:
        return await self._repo.list_all(project_id)


class GetBrief:
    def __init__(self, repo: ProjectBriefRepository) -> None:
        self._repo = repo

    async def __call__(self, brief_id: str) -> ProjectBrief:
        brief = await self._repo.get(brief_id)
        if brief is None:
            raise NotFoundError(f"brief {brief_id} not found")
        return brief


class CreateBrief:
    def __init__(self, repo: ProjectBriefRepository) -> None:
        self._repo = repo

    async def __call__(self, cmd: CreateBriefCommand) -> ProjectBrief:
        brief = ProjectBrief.create(
            project_id=cmd.project_id,
            title=cmd.title,
            description=cmd.description,
            required_professional_types=cmd.required_professional_types,
            budget_min=cmd.budget_min,
            budget_max=cmd.budget_max,
            budget_currency=cmd.budget_currency,
            timeline=cmd.timeline,
            location=cmd.location,
            status=cmd.status,
        )
        return await self._repo.add(brief)


class UpdateBrief:
    def __init__(self, repo: ProjectBriefRepository) -> None:
        self._repo = repo

    async def __call__(self, brief_id: str, cmd: UpdateBriefCommand) -> ProjectBrief:
        updated = await self._repo.update(brief_id, cmd.changes)
        if updated is None:
            raise NotFoundError(f"brief {brief_id} not found")
        return updated


class CreateResponse:
    def __init__(self, repo: ProjectBriefRepository) -> None:
        self._repo = repo

    async def __call__(self, cmd: CreateResponseCommand) -> BriefResponse:
        response = BriefResponse.create(
            brief_id=cmd.brief_id,
            professional_id=cmd.professional_id,
            professional_name=cmd.professional_name,
            proposed_fee=cmd.proposed_fee,
            currency=cmd.currency,
            timeline=cmd.timeline,
            approach=cmd.approach,
            portfolio_items=cmd.portfolio_items,
            status=cmd.status,
        )
        return await self._repo.add_response(cmd.brief_id, response)


class UpdateResponse:
    def __init__(self, repo: ProjectBriefRepository) -> None:
        self._repo = repo

    async def __call__(self, response_id: str, cmd: UpdateResponseCommand) -> BriefResponse:
        updated = await self._repo.update_response(response_id, cmd.changes)
        if updated is None:
            raise NotFoundError(f"response {response_id} not found")
        return updated
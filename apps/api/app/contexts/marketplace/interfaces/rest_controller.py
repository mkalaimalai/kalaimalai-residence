"""Marketplace REST controller — the inbound adapter (HTTP → use cases)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.contexts.marketplace.application.commands import (
    CreateProfessionalCommand,
    UpdateProfessionalCommand,
    CreateReviewCommand,
    CreateBriefCommand,
    UpdateBriefCommand,
    CreateResponseCommand,
    UpdateResponseCommand,
)
from app.contexts.marketplace.application.use_cases import (
    CreateProfessional,
    CreateReview,
    CreateBrief,
    CreateResponse,
    DeleteProfessional,
    GetProfessional,
    GetBrief,
    ListProfessionals,
    ListProfessionalReviews,
    ListBriefs,
    UpdateProfessional,
    UpdateBrief,
    UpdateResponse,
)
from app.contexts.marketplace.infrastructure.repository_impl import (
    SqlAlchemyProfessionalRepository,
    SqlAlchemyProfessionalReviewRepository,
    SqlAlchemyProjectBriefRepository,
)
from app.contexts.marketplace.interfaces.schemas import (
    ProfessionalResponse,
    ProfessionalCreate,
    ProfessionalUpdate,
    ProfessionalReviewResponse,
    ReviewCreate,
    ProjectBriefResponse,
    BriefCreate,
    BriefUpdate,
    BriefResponseResponse,
    ResponseCreate,
    ResponseUpdate,
)
from app.shared.auth import require_admin, require_user
from app.shared.db import get_session
from app.shared.errors import NotFoundError

professional_router = APIRouter(prefix="/professionals", tags=["marketplace"])
brief_router = APIRouter(prefix="/briefs", tags=["marketplace"])


def _prof_repo(session: AsyncSession = Depends(get_session)) -> SqlAlchemyProfessionalRepository:
    return SqlAlchemyProfessionalRepository(session)


def _review_repo(session: AsyncSession = Depends(get_session)) -> SqlAlchemyProfessionalReviewRepository:
    return SqlAlchemyProfessionalReviewRepository(session)


def _brief_repo(session: AsyncSession = Depends(get_session)) -> SqlAlchemyProjectBriefRepository:
    return SqlAlchemyProjectBriefRepository(session)


@professional_router.get("", response_model=list[ProfessionalResponse])
async def list_professionals(
    repo: SqlAlchemyProfessionalRepository = Depends(_prof_repo),
    project_id: str | None = Query(None, alias="projectId"),
):
    professionals = await ListProfessionals(repo)(project_id)
    return [ProfessionalResponse.from_entity(p) for p in professionals]


@professional_router.get("/{professional_id}", response_model=ProfessionalResponse)
async def get_professional(
    professional_id: str, repo: SqlAlchemyProfessionalRepository = Depends(_prof_repo)
):
    try:
        professional = await GetProfessional(repo)(professional_id)
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return ProfessionalResponse.from_entity(professional)


@professional_router.post(
    "", response_model=ProfessionalResponse, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def create_professional(
    body: ProfessionalCreate, repo: SqlAlchemyProfessionalRepository = Depends(_prof_repo)
):
    professional = await CreateProfessional(repo)(CreateProfessionalCommand(**body.model_dump()))
    return ProfessionalResponse.from_entity(professional)


@professional_router.patch(
    "/{professional_id}", response_model=ProfessionalResponse,
    dependencies=[Depends(require_admin)],
)
async def update_professional(
    professional_id: str,
    body: ProfessionalUpdate,
    repo: SqlAlchemyProfessionalRepository = Depends(_prof_repo),
):
    changes = body.model_dump(exclude_unset=True)
    try:
        professional = await UpdateProfessional(repo)(professional_id, UpdateProfessionalCommand(changes))
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return ProfessionalResponse.from_entity(professional)


@professional_router.delete(
    "/{professional_id}", status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
async def delete_professional(
    professional_id: str, repo: SqlAlchemyProfessionalRepository = Depends(_prof_repo)
):
    try:
        await DeleteProfessional(repo)(professional_id)
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc


@professional_router.get("/{professional_id}/reviews", response_model=list[ProfessionalReviewResponse])
async def list_professional_reviews(
    professional_id: str, repo: SqlAlchemyProfessionalReviewRepository = Depends(_review_repo)
):
    reviews = await ListProfessionalReviews(repo)(professional_id)
    return [ProfessionalReviewResponse.from_entity(r) for r in reviews]


@professional_router.post(
    "/{professional_id}/reviews", response_model=ProfessionalReviewResponse, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_user)],
)
async def create_review(
    professional_id: str,
    body: ReviewCreate,
    repo: SqlAlchemyProfessionalReviewRepository = Depends(_review_repo),
):
    if body.professional_id != professional_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Professional ID mismatch")
    review = await CreateReview(repo)(CreateReviewCommand(**body.model_dump()))
    return ProfessionalReviewResponse.from_entity(review)


@brief_router.get("", response_model=list[ProjectBriefResponse])
async def list_briefs(
    repo: SqlAlchemyProjectBriefRepository = Depends(_brief_repo),
    project_id: str | None = Query(None, alias="projectId"),
):
    briefs = await ListBriefs(repo)(project_id)
    return [ProjectBriefResponse.from_entity(b) for b in briefs]


@brief_router.get("/{brief_id}", response_model=ProjectBriefResponse)
async def get_brief(
    brief_id: str, repo: SqlAlchemyProjectBriefRepository = Depends(_brief_repo)
):
    try:
        brief = await GetBrief(repo)(brief_id)
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return ProjectBriefResponse.from_entity(brief)


@brief_router.post(
    "", response_model=ProjectBriefResponse, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_user)],
)
async def create_brief(
    body: BriefCreate, repo: SqlAlchemyProjectBriefRepository = Depends(_brief_repo)
):
    brief = await CreateBrief(repo)(CreateBriefCommand(**body.model_dump()))
    return ProjectBriefResponse.from_entity(brief)


@brief_router.patch(
    "/{brief_id}", response_model=ProjectBriefResponse,
    dependencies=[Depends(require_user)],
)
async def update_brief(
    brief_id: str,
    body: BriefUpdate,
    repo: SqlAlchemyProjectBriefRepository = Depends(_brief_repo),
):
    changes = body.model_dump(exclude_unset=True)
    try:
        brief = await UpdateBrief(repo)(brief_id, UpdateBriefCommand(changes))
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return ProjectBriefResponse.from_entity(brief)


@brief_router.post(
    "/{brief_id}/responses", response_model=BriefResponseResponse, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_user)],
)
async def create_response(
    brief_id: str,
    body: ResponseCreate,
    repo: SqlAlchemyProjectBriefRepository = Depends(_brief_repo),
):
    if body.brief_id != brief_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Brief ID mismatch")
    response = await CreateResponse(repo)(CreateResponseCommand(**body.model_dump()))
    return BriefResponseResponse.from_entity(response)


@brief_router.patch(
    "/{brief_id}/responses/{response_id}", response_model=BriefResponseResponse,
    dependencies=[Depends(require_user)],
)
async def update_response(
    brief_id: str,
    response_id: str,
    body: ResponseUpdate,
    repo: SqlAlchemyProjectBriefRepository = Depends(_brief_repo),
):
    changes = body.model_dump(exclude_unset=True)
    try:
        response = await UpdateResponse(repo)(response_id, UpdateResponseCommand(changes))
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return BriefResponseResponse.from_entity(response)
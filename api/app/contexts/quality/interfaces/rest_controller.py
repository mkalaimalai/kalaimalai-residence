"""Quality context REST controllers — snags, decisions, inspections (architecture.md §6)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.contexts.quality.domain import entities as e
from app.contexts.quality.infrastructure import orm
from app.contexts.quality.infrastructure.repository_impl import (
    SqlAlchemyInspectionRepository,
    SqlAlchemySnagRepository,
)
from app.contexts.quality.interfaces import schemas as s
from app.shared.auth import require_admin
from app.shared.crud import make_crud_router
from app.shared.db import get_session

snags_router = make_crud_router(
    prefix="/snags", tags=["quality"], orm_cls=orm.SnagModel, entity_cls=e.Snag,
    response_model=s.SnagResponse, create_model=s.SnagCreate,
    update_model=s.SnagUpdate, id_prefix="snag", public_read=False,
)

decisions_router = make_crud_router(
    prefix="/decisions", tags=["quality"], orm_cls=orm.DecisionModel,
    entity_cls=e.Decision, response_model=s.DecisionResponse,
    create_model=s.DecisionCreate, update_model=s.DecisionUpdate,
    id_prefix="decision", public_read=True,
)

inspections_router = make_crud_router(
    prefix="/inspections", tags=["quality"], orm_cls=orm.InspectionModel,
    entity_cls=e.Inspection, response_model=s.InspectionResponse,
    create_model=s.InspectionCreate, update_model=s.InspectionUpdate,
    id_prefix="inspection", public_read=False,
)

# --- Snag lifecycle actions (§6) ---------------------------------------------------
snag_actions_router = APIRouter(prefix="/snags", tags=["quality"])


def _snags(session: AsyncSession = Depends(get_session)):
    return SqlAlchemySnagRepository(session)


async def _update_snag(repo, snag_id: str, changes: dict) -> s.SnagResponse:
    snag = await repo.update(snag_id, changes)
    if snag is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"snag {snag_id} not found")
    return s.SnagResponse.model_validate(snag)


@snag_actions_router.patch(
    "/{snag_id}/assign", response_model=s.SnagResponse,
    dependencies=[Depends(require_admin)],
)
async def assign_snag(snag_id: str, body: s.SnagAssign, repo=Depends(_snags)):
    return await _update_snag(
        repo, snag_id, {"assigned_to": body.assigned_to, "status": "In Progress"}
    )


@snag_actions_router.patch(
    "/{snag_id}/resolve", response_model=s.SnagResponse,
    dependencies=[Depends(require_admin)],
)
async def resolve_snag(snag_id: str, body: s.SnagResolve, repo=Depends(_snags)):
    changes = {"status": "Fixed", "notes": body.notes}
    if body.actual_closure_date:
        changes["actual_closure_date"] = body.actual_closure_date
    return await _update_snag(repo, snag_id, changes)


@snag_actions_router.patch(
    "/{snag_id}/close", response_model=s.SnagResponse,
    dependencies=[Depends(require_admin)],
)
async def close_snag(snag_id: str, repo=Depends(_snags)):
    return await _update_snag(repo, snag_id, {"status": "Closed"})


# --- Project-nested reads (§6) — single-project semantics --------------------------
project_nested_router = APIRouter(prefix="/projects", tags=["quality"])


@project_nested_router.get(
    "/{project_id}/snags", response_model=list[s.SnagResponse],
    dependencies=[Depends(require_admin)],
)
async def project_snags(project_id: str, session: AsyncSession = Depends(get_session)):
    repo = SqlAlchemySnagRepository(session)
    return [s.SnagResponse.model_validate(x) for x in await repo.list_all()]


@project_nested_router.get(
    "/{project_id}/inspections", response_model=list[s.InspectionResponse],
    dependencies=[Depends(require_admin)],
)
async def project_inspections(
    project_id: str, session: AsyncSession = Depends(get_session)
):
    repo = SqlAlchemyInspectionRepository(session)
    return [s.InspectionResponse.model_validate(x) for x in await repo.list_all()]


routers = [
    snags_router,
    decisions_router,
    inspections_router,
    snag_actions_router,
    project_nested_router,
]

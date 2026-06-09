"""Project context REST controllers (inbound adapters).

Spaces/domains/progress use the generic CRUD router. Project is bespoke: a public
singleton endpoint (anonymized) + an authenticated /project/full endpoint, plus admin
create/update.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.contexts.project.application.use_cases import (
    GetSingletonProject,
    SluggedCrudService,
)
from app.contexts.project.domain import entities as e
from app.contexts.project.infrastructure import orm
from app.contexts.project.infrastructure.repository_impl import (
    SqlAlchemyDomainRepository,
    SqlAlchemyProjectRepository,
    SqlAlchemySpaceRepository,
)
from app.contexts.project.interfaces import schemas as s
from app.shared.auth import require_admin, require_user
from app.shared.crud import CrudService, make_crud_router
from app.shared.db import get_session
from app.shared.errors import NotFoundError


def _space_service(session: AsyncSession) -> CrudService:
    return SluggedCrudService(
        SqlAlchemySpaceRepository(session), e.Space, "space"
    )


def _domain_service(session: AsyncSession) -> CrudService:
    return SluggedCrudService(
        SqlAlchemyDomainRepository(session), e.Domain, "domain"
    )


spaces_router = make_crud_router(
    prefix="/spaces", tags=["project"], orm_cls=orm.SpaceModel, entity_cls=e.Space,
    response_model=s.SpaceResponse, create_model=s.SpaceCreate,
    update_model=s.SpaceUpdate, id_prefix="space", public_read=True,
    service_factory=_space_service,
)

domains_router = make_crud_router(
    prefix="/domains", tags=["project"], orm_cls=orm.DomainModel, entity_cls=e.Domain,
    response_model=s.DomainResponse, create_model=s.DomainCreate,
    update_model=s.DomainUpdate, id_prefix="domain", public_read=True,
    service_factory=_domain_service,
)

progress_router = make_crud_router(
    prefix="/progress", tags=["project"], orm_cls=orm.ProgressModel,
    entity_cls=e.ProgressEntry, response_model=s.ProgressResponse,
    create_model=s.ProgressCreate, update_model=s.ProgressUpdate,
    id_prefix="progress", public_read=True,
)

# --- Project (bespoke singleton) ---------------------------------------------------
project_router = APIRouter(prefix="/project", tags=["project"])


def _project_repo(session: AsyncSession = Depends(get_session)):
    return SqlAlchemyProjectRepository(session)


@project_router.get("", response_model=s.PublicProject)
async def get_public_project(repo=Depends(_project_repo)):
    try:
        project = await GetSingletonProject(repo)()
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return s.PublicProject.model_validate(project)


@project_router.get(
    "/full", response_model=s.FullProject, dependencies=[Depends(require_user)]
)
async def get_full_project(repo=Depends(_project_repo)):
    try:
        project = await GetSingletonProject(repo)()
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return s.FullProject.model_validate(project)


@project_router.patch(
    "/{project_id}", response_model=s.FullProject,
    dependencies=[Depends(require_admin)],
)
async def update_project(project_id: str, body: s.ProjectUpdate, repo=Depends(_project_repo)):
    service = CrudService(repo, e.Project, "project")
    changes = body.model_dump(by_alias=False, exclude_unset=True)
    try:
        project = await service.update(project_id, changes)
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return s.FullProject.model_validate(project)


# --- Projects collection (admin) — list + create for the admin UI ------------------
projects_router = APIRouter(prefix="/projects", tags=["project"])


@projects_router.get(
    "", response_model=list[s.FullProject], dependencies=[Depends(require_user)]
)
async def list_projects(repo=Depends(_project_repo)):
    return [s.FullProject.model_validate(p) for p in await repo.list_all()]


@projects_router.post(
    "", response_model=s.FullProject, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def create_project(body: s.ProjectCreate, repo=Depends(_project_repo)):
    service = CrudService(repo, e.Project, "project")
    project = await service.create(body.model_dump(by_alias=False))
    return s.FullProject.model_validate(project)


@projects_router.get(
    "/{project_id}", response_model=s.FullProject, dependencies=[Depends(require_user)]
)
async def get_project_by_id(project_id: str, repo=Depends(_project_repo)):
    project = await repo.get(project_id)
    if project is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"project {project_id} not found")
    return s.FullProject.model_validate(project)


@projects_router.patch(
    "/{project_id}", response_model=s.FullProject,
    dependencies=[Depends(require_admin)],
)
async def patch_project(project_id: str, body: s.ProjectUpdate, repo=Depends(_project_repo)):
    service = CrudService(repo, e.Project, "project")
    changes = body.model_dump(by_alias=False, exclude_unset=True)
    try:
        project = await service.update(project_id, changes)
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return s.FullProject.model_validate(project)


# --- Project-nested spaces (§6) — single-project semantics -------------------------
@projects_router.get("/{project_id}/spaces", response_model=list[s.SpaceResponse])
async def list_project_spaces(
    project_id: str, session: AsyncSession = Depends(get_session)
):
    repo = SqlAlchemySpaceRepository(session)
    return [s.SpaceResponse.model_validate(sp) for sp in await repo.list_all()]


@projects_router.post(
    "/{project_id}/spaces", response_model=s.SpaceResponse,
    status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)],
)
async def create_project_space(
    project_id: str, body: s.SpaceCreate, session: AsyncSession = Depends(get_session)
):
    space = await _space_service(session).create(body.model_dump(by_alias=False))
    return s.SpaceResponse.model_validate(space)


routers = [
    spaces_router,
    domains_router,
    progress_router,
    project_router,
    projects_router,
]

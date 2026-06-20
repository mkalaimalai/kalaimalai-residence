"""Generic CRUD building blocks reused across bounded contexts.

The vendor context is hand-written in full as the reference. Every other context
composes these generics inside its OWN four hexagonal layers:

  domain/repository.py        -> `CrudRepository[Entity]`         (port)
  infrastructure/repository_impl.py
                              -> `SqlAlchemyCrudRepository`       (adapter)
  application/use_cases.py    -> `CrudService[Entity]`            (use cases)
  interfaces/rest_controller.py
                              -> `make_crud_router(...)`          (inbound adapter)

Entity dataclass field names are identical to ORM column names (both snake_case), so a
single generic mapper handles both directions. Cross-context referential checks are
injected into `CrudService` via the optional `validate_refs` hook, which calls
synchronous service-client ports.

NOTE: this module deliberately does NOT use `from __future__ import annotations`. The
router factory builds endpoint functions whose parameter annotations reference closure
variables (create_model/update_model/response_model); those must stay real type objects
for FastAPI to resolve them, not stringified forward refs.
"""
import dataclasses
from abc import ABC
from collections.abc import Awaitable, Callable
from typing import Generic, TypeVar

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.auth import require_admin, require_user
from app.shared.db import get_session
from app.shared.errors import ConflictError, NotFoundError, ValidationError
from app.shared.ids import new_id
from app.shared.sqlalchemy_repository import SqlAlchemyCrud

TEntity = TypeVar("TEntity")


# --- generic mapper (dataclass entity <-> ORM row, identical column names) ---------
def make_mappers(
    entity_cls: type[TEntity],
) -> tuple[Callable[[object], TEntity], Callable[[TEntity], dict]]:
    field_names = [f.name for f in dataclasses.fields(entity_cls)]

    def to_entity(row: object) -> TEntity:
        return entity_cls(**{name: getattr(row, name) for name in field_names})

    def to_columns(entity: TEntity) -> dict:
        return {name: getattr(entity, name) for name in field_names}

    return to_entity, to_columns


# --- domain port -------------------------------------------------------------------
class CrudRepository(ABC, Generic[TEntity]):
    async def list_all(self) -> list[TEntity]: ...
    async def get(self, entity_id: str) -> TEntity | None: ...
    async def exists(self, entity_id: str) -> bool: ...
    async def add(self, entity: TEntity) -> TEntity: ...
    async def update(self, entity_id: str, changes: dict) -> TEntity | None: ...


# --- infrastructure adapter --------------------------------------------------------
class SqlAlchemyCrudRepository(CrudRepository[TEntity]):
    def __init__(self, session: AsyncSession, orm_cls, entity_cls: type[TEntity]) -> None:
        to_entity, to_columns = make_mappers(entity_cls)
        self._crud: SqlAlchemyCrud = SqlAlchemyCrud(
            session, orm_cls, to_entity, to_columns
        )

    async def list_all(self) -> list[TEntity]:
        return await self._crud.list_all()

    async def get(self, entity_id: str) -> TEntity | None:
        return await self._crud.get(entity_id)

    async def exists(self, entity_id: str) -> bool:
        return await self._crud.exists(entity_id)

    async def add(self, entity: TEntity) -> TEntity:
        return await self._crud.add(entity)

    async def update(self, entity_id: str, changes: dict) -> TEntity | None:
        return await self._crud.update(entity_id, changes)


# --- application use cases ----------------------------------------------------------
# A validate_refs hook receives the proposed field dict and raises ValidationError if a
# cross-context reference (vendorId, spaceId, ...) is dangling. It runs synchronously.
ValidateRefs = Callable[[dict], Awaitable[None]]


class CrudService(Generic[TEntity]):
    def __init__(
        self,
        repo: CrudRepository[TEntity],
        entity_cls: type[TEntity],
        id_prefix: str,
        validate_refs: ValidateRefs | None = None,
    ) -> None:
        self._repo = repo
        self._entity_cls = entity_cls
        self._id_prefix = id_prefix
        self._validate_refs = validate_refs

    async def list_all(self) -> list[TEntity]:
        return await self._repo.list_all()

    async def get(self, entity_id: str) -> TEntity:
        entity = await self._repo.get(entity_id)
        if entity is None:
            raise NotFoundError(f"{self._id_prefix} {entity_id} not found")
        return entity

    async def create(self, fields: dict) -> TEntity:
        fields = dict(fields)
        fields.setdefault("id", new_id(self._id_prefix))
        if self._validate_refs:
            await self._validate_refs(fields)
        entity = self._entity_cls(**fields)
        return await self._repo.add(entity)

    async def update(self, entity_id: str, changes: dict) -> TEntity:
        if self._validate_refs and changes:
            await self._validate_refs(changes)
        updated = await self._repo.update(entity_id, changes)
        if updated is None:
            raise NotFoundError(f"{self._id_prefix} {entity_id} not found")
        return updated


# --- interface adapter (router factory) --------------------------------------------
def make_crud_router(
    *,
    prefix: str,
    tags: list[str],
    orm_cls,
    entity_cls: type,
    response_model: type,
    create_model: type,
    update_model: type,
    id_prefix: str,
    public_read: bool,
    repository_factory: Callable[[AsyncSession], CrudRepository] | None = None,
    service_factory: Callable[[AsyncSession], CrudService] | None = None,
) -> APIRouter:
    """Build a standard CRUD router for a context.

    - `public_read=True` leaves GETs open (anonymized, needed at build time);
      otherwise GETs require an authenticated portal user.
    - Writes always require the admin role.
    - `service_factory` lets a context inject cross-context referential validation;
      otherwise a plain CrudService (no validation) is used.
    """
    router = APIRouter(prefix=prefix, tags=tags)

    def _build_service(session: AsyncSession) -> CrudService:
        if service_factory is not None:
            return service_factory(session)
        repo = (
            repository_factory(session)
            if repository_factory
            else SqlAlchemyCrudRepository(session, orm_cls, entity_cls)
        )
        return CrudService(repo, entity_cls, id_prefix)

    def _service(session: AsyncSession = Depends(get_session)) -> CrudService:
        return _build_service(session)

    read_guard = [] if public_read else [Depends(require_user)]

    @router.get("", response_model=list[response_model], dependencies=read_guard)
    async def _list(service: CrudService = Depends(_service)):
        return [response_model.model_validate(e) for e in await service.list_all()]

    @router.get("/{entity_id}", response_model=response_model, dependencies=read_guard)
    async def _get(entity_id: str, service: CrudService = Depends(_service)):
        try:
            entity = await service.get(entity_id)
        except NotFoundError as exc:
            raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
        return response_model.model_validate(entity)

    @router.post(
        "", response_model=response_model, status_code=status.HTTP_201_CREATED,
        dependencies=[Depends(require_admin)],
    )
    async def _create(body: create_model, service: CrudService = Depends(_service)):
        try:
            entity = await service.create(body.model_dump(by_alias=False))
        except ValidationError as exc:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc
        except ConflictError as exc:
            raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc
        return response_model.model_validate(entity)

    @router.patch(
        "/{entity_id}", response_model=response_model,
        dependencies=[Depends(require_admin)],
    )
    async def _update(
        entity_id: str, body: update_model, service: CrudService = Depends(_service)
    ):
        changes = body.model_dump(by_alias=False, exclude_unset=True)
        try:
            entity = await service.update(entity_id, changes)
        except NotFoundError as exc:
            raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
        except ValidationError as exc:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc
        return response_model.model_validate(entity)

    return router

"""Generic async SQLAlchemy CRUD helper.

This is an *infrastructure* utility, not a domain port. Each context's
`repository_impl` composes it and supplies its own ORM model + entity↔ORM mappers,
so the domain layer stays free of SQLAlchemy.
"""
from __future__ import annotations

from collections.abc import Callable
from typing import Generic, TypeVar

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.db import Base

TOrm = TypeVar("TOrm", bound=Base)
TEntity = TypeVar("TEntity")


class SqlAlchemyCrud(Generic[TOrm, TEntity]):
    def __init__(
        self,
        session: AsyncSession,
        orm_cls: type[TOrm],
        to_entity: Callable[[TOrm], TEntity],
        to_columns: Callable[[TEntity], dict],
    ) -> None:
        self._session = session
        self._orm = orm_cls
        self._to_entity = to_entity
        self._to_columns = to_columns

    async def list_all(self) -> list[TEntity]:
        result = await self._session.execute(select(self._orm))
        return [self._to_entity(row) for row in result.scalars().all()]

    async def get(self, entity_id: str) -> TEntity | None:
        row = await self._session.get(self._orm, entity_id)
        return self._to_entity(row) if row else None

    async def exists(self, entity_id: str) -> bool:
        return await self._session.get(self._orm, entity_id) is not None

    async def add(self, entity: TEntity) -> TEntity:
        row = self._orm(**self._to_columns(entity))
        self._session.add(row)
        await self._session.commit()
        await self._session.refresh(row)
        return self._to_entity(row)

    async def update(self, entity_id: str, changes: dict) -> TEntity | None:
        row = await self._session.get(self._orm, entity_id)
        if row is None:
            return None
        for column, value in changes.items():
            setattr(row, column, value)
        await self._session.commit()
        await self._session.refresh(row)
        return self._to_entity(row)

    async def upsert(self, entity: TEntity) -> TEntity:
        columns = self._to_columns(entity)
        existing = await self._session.get(self._orm, columns["id"])
        if existing is None:
            row = self._orm(**columns)
            self._session.add(row)
        else:
            for column, value in columns.items():
                setattr(existing, column, value)
        await self._session.commit()
        return entity

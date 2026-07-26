"""Async SQLAlchemy engine/session + the declarative Base shared by all ORM models.

A single Postgres database with one schema; bounded contexts own disjoint tables and
never read each other's tables directly (cross-context access goes through service
clients). NullPool + disabled statement cache keeps us compatible with Supabase's
pgbouncer pooled connection (port 6543).
"""
from __future__ import annotations

from collections.abc import AsyncIterator
from uuid import uuid4

from sqlalchemy import ForeignKey, String
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, declared_attr, mapped_column
from sqlalchemy.pool import NullPool

from app.config import get_settings


class Base(DeclarativeBase):
    pass


class ProjectScoped:
    """Mixin declaring the tenant boundary column.

    Every entity table except `projects` itself carries `project_id`, FK-constrained to
    `projects.id` (see migrations/002_project_scope.sql). Mixing this in rather than
    repeating the column keeps the 20 models honest: a new model that forgets to
    inherit it is visibly missing its tenant boundary at the class definition.
    """

    # declared_attr, not a bare mapped_column: a ForeignKey object cannot be shared
    # across mappers, so each subclass needs its own instance.
    @declared_attr
    def project_id(cls) -> Mapped[str]:  # noqa: N805
        return mapped_column(
            String,
            ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        )


_settings = get_settings()

engine = create_async_engine(
    _settings.database_url,
    poolclass=NullPool,
    connect_args={
        # All three are required behind Supabase's transaction pooler: caching is off
        # on both the asyncpg and SQLAlchemy sides, and statement names must be unique
        # per connection — the pooler reuses one server connection across ours, so the
        # default fixed names collide as DuplicatePreparedStatementError.
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
        "prepared_statement_name_func": lambda: f"__asyncpg_{uuid4()}__",
    },
    future=True,
)

SessionFactory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_session() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency yielding a request-scoped session."""
    async with SessionFactory() as session:
        yield session

"""Async SQLAlchemy engine/session + the declarative Base shared by all ORM models.

A single Postgres database with one schema; bounded contexts own disjoint tables and
never read each other's tables directly (cross-context access goes through service
clients). The disabled statement cache keeps us compatible with Supabase's pgbouncer
pooled connection; whether connections are reused between requests is `DB_POOL_SIZE`
(see `_pool_args` below).
"""
from __future__ import annotations

from collections.abc import AsyncIterator
from typing import Any
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
    def project_id(cls) -> Mapped[str]:
        return mapped_column(
            String,
            ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        )


_settings = get_settings()

def _pool_args() -> dict[str, Any]:
    """Pooling strategy, decided by DB_POOL_SIZE.

    Opening a Postgres connection is not cheap: a TCP round trip, a TLS handshake and
    an auth exchange. With NullPool that whole sequence runs on every request, which is
    invisible next to a local database and dominates the response when the database is
    in another region.

    Reuse is safe here even against Supabase's TRANSACTION pooler (port 6543), which
    is what `DATABASE_URL` points at: what that pooler cannot preserve is *session*
    state, and the `connect_args` below already forbid the one thing we would otherwise
    rely on it for (server-side prepared statements). Nothing else in this codebase
    sets a session variable or opens a temp table, so a checked-out connection carries
    no state worth losing.

    Measured against the ap-south-1 pooler: ~470 ms per query with NullPool, ~220 ms
    with a pool of 5. The remainder is the pre-ping round trip, deliberately kept —
    an idle connection can be severed by the pooler, by Supabase restarting, or by any
    NAT in between, and paying ~90 ms beats returning a 500 on a dead connection.
    """
    if _settings.db_pool_size <= 0:
        return {"poolclass": NullPool}
    return {
        "pool_size": _settings.db_pool_size,
        # A brief burst beyond the pool is served rather than queued.
        "max_overflow": _settings.db_pool_size,
        # A pooled connection can be severed while idle — by the pooler, by Supabase
        # restarting, or by any NAT in between. Without this the next request to check
        # that connection out fails instead of transparently opening a fresh one.
        "pool_pre_ping": True,
        # Retire connections well inside the pooler's own idle timeout.
        "pool_recycle": 900,
    }


engine = create_async_engine(
    _settings.database_url,
    connect_args={
        # Required behind Supabase's transaction pooler and harmless elsewhere: caching
        # is off on both the asyncpg and SQLAlchemy sides, and statement names must be
        # unique per connection — that pooler reuses one server connection across ours,
        # so the default fixed names collide as DuplicatePreparedStatementError.
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
        "prepared_statement_name_func": lambda: f"__asyncpg_{uuid4()}__",
    },
    future=True,
    **_pool_args(),
)

SessionFactory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_session() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency yielding a request-scoped session."""
    async with SessionFactory() as session:
        yield session

"""Async SQLAlchemy engine/session + the declarative Base shared by all ORM models.

A single Postgres database with one schema; bounded contexts own disjoint tables and
never read each other's tables directly (cross-context access goes through service
clients). NullPool + disabled statement cache keeps us compatible with Supabase's
pgbouncer pooled connection (port 6543).
"""
from __future__ import annotations

from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.config import get_settings


class Base(DeclarativeBase):
    pass


_settings = get_settings()

engine = create_async_engine(
    _settings.database_url,
    poolclass=NullPool,
    connect_args={"statement_cache_size": 0},  # required behind pgbouncer
    future=True,
)

SessionFactory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_session() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency yielding a request-scoped session."""
    async with SessionFactory() as session:
        yield session

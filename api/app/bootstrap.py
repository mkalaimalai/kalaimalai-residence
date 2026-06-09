"""Composition root.

Collects every context's REST router (each context wires its own ports → adapters
internally; cross-context access is synchronous via service-client ports). Also exposes
`create_all` for local/dev table creation.
"""
from __future__ import annotations

from fastapi import APIRouter

import app.models  # noqa: F401  -- registers all ORM tables on Base.metadata
from app.contexts.commercial.interfaces.rest_controller import (
    routers as commercial_routers,
)
from app.contexts.document.interfaces.rest_controller import (
    routers as document_routers,
)
from app.contexts.handover.interfaces.rest_controller import (
    routers as handover_routers,
)
from app.contexts.notification.interfaces.rest_controller import (
    routers as notification_routers,
)
from app.contexts.project.interfaces.rest_controller import routers as project_routers
from app.contexts.quality.interfaces.rest_controller import routers as quality_routers
from app.contexts.vendor.interfaces.rest_controller import router as vendor_router
from app.shared.db import Base, engine


def build_api_router() -> APIRouter:
    api = APIRouter()
    for router in [
        *project_routers,
        *document_routers,
        vendor_router,
        *commercial_routers,
        *quality_routers,
        *handover_routers,
        *notification_routers,
    ]:
        api.include_router(router)
    return api


async def create_all() -> None:
    """Create any missing tables (dev convenience; prod uses migrations/001_init.sql)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

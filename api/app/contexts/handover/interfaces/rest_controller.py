"""Handover context REST controller — warranties (auth read)."""
from __future__ import annotations

from app.contexts.handover.domain import entities as e
from app.contexts.handover.infrastructure import orm
from app.contexts.handover.interfaces import schemas as s
from app.shared.crud import make_crud_router

warranties_router = make_crud_router(
    prefix="/warranties", tags=["handover"], orm_cls=orm.WarrantyModel,
    entity_cls=e.Warranty, response_model=s.WarrantyResponse,
    create_model=s.WarrantyCreate, update_model=s.WarrantyUpdate,
    id_prefix="warranty", public_read=False,
)

routers = [warranties_router]

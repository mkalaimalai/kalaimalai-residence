"""Quality context REST controllers — snags (auth read), decisions (public read)."""
from __future__ import annotations

from app.contexts.quality.domain import entities as e
from app.contexts.quality.infrastructure import orm
from app.contexts.quality.interfaces import schemas as s
from app.shared.crud import make_crud_router

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

routers = [snags_router, decisions_router]

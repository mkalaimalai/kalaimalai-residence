"""Document context REST controllers — drawings, gallery, lessons (public reads)."""
from __future__ import annotations

from app.contexts.document.domain import entities as e
from app.contexts.document.infrastructure import orm
from app.contexts.document.interfaces import schemas as s
from app.shared.crud import make_crud_router

drawings_router = make_crud_router(
    prefix="/drawings", tags=["document"], orm_cls=orm.DrawingModel,
    entity_cls=e.Drawing, response_model=s.DrawingResponse,
    create_model=s.DrawingCreate, update_model=s.DrawingUpdate,
    id_prefix="drawing", public_read=True,
)

gallery_router = make_crud_router(
    prefix="/gallery", tags=["document"], orm_cls=orm.GalleryModel,
    entity_cls=e.GalleryItem, response_model=s.GalleryResponse,
    create_model=s.GalleryCreate, update_model=s.GalleryUpdate,
    id_prefix="gallery", public_read=True,
)

lessons_router = make_crud_router(
    prefix="/lessons", tags=["document"], orm_cls=orm.LessonModel,
    entity_cls=e.Lesson, response_model=s.LessonResponse,
    create_model=s.LessonCreate, update_model=s.LessonUpdate,
    id_prefix="lesson", public_read=True,
)

routers = [drawings_router, gallery_router, lessons_router]

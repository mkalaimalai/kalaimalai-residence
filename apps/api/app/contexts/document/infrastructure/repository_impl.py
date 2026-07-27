"""SQLAlchemy adapters for the document context repository ports."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.contexts.document.domain import entities as e
from app.contexts.document.domain.repository import (
    DrawingRepository,
    GalleryRepository,
    LessonRepository,
)
from app.contexts.document.infrastructure import orm
from app.shared.crud import SqlAlchemyCrudRepository


class SqlAlchemyDrawingRepository(
    SqlAlchemyCrudRepository[e.Drawing], DrawingRepository
):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, orm.DrawingModel, e.Drawing)


class SqlAlchemyGalleryRepository(
    SqlAlchemyCrudRepository[e.GalleryItem], GalleryRepository
):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, orm.GalleryModel, e.GalleryItem)


class SqlAlchemyLessonRepository(
    SqlAlchemyCrudRepository[e.Lesson], LessonRepository
):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, orm.LessonModel, e.Lesson)

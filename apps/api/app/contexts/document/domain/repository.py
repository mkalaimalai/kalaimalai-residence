"""Repository PORTS for the document context."""
from __future__ import annotations

from app.contexts.document.domain.entities import (
    Drawing,
    DrawingRevision,
    GalleryItem,
    Lesson,
)
from app.shared.crud import CrudRepository


class DrawingRepository(CrudRepository[Drawing]):
    ...


class DrawingRevisionRepository(CrudRepository[DrawingRevision]):
    ...


class GalleryRepository(CrudRepository[GalleryItem]):
    ...


class LessonRepository(CrudRepository[Lesson]):
    ...

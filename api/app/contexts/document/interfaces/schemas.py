"""Pydantic request/response models for the document context."""
from __future__ import annotations

from app.shared.camel import CamelModel


# --- Drawing -----------------------------------------------------------------------
class DrawingResponse(CamelModel):
    id: str
    title: str
    domain_id: str
    space_id: str
    revision: str
    date: str
    status: str
    consultant: str
    file_url: str
    notes: str


class DrawingCreate(CamelModel):
    title: str
    domain_id: str = ""
    space_id: str = ""
    revision: str = ""
    date: str = ""
    status: str = "Draft"
    consultant: str = ""
    file_url: str = ""
    notes: str = ""


class DrawingUpdate(CamelModel):
    title: str | None = None
    domain_id: str | None = None
    space_id: str | None = None
    revision: str | None = None
    date: str | None = None
    status: str | None = None
    consultant: str | None = None
    file_url: str | None = None
    notes: str | None = None


# --- GalleryItem -------------------------------------------------------------------
class GalleryResponse(CamelModel):
    id: str
    title: str
    category: str
    image: str
    space_id: str
    domain_id: str
    caption: str


class GalleryCreate(CamelModel):
    title: str
    category: str = "render"
    image: str = ""
    space_id: str = ""
    domain_id: str = ""
    caption: str = ""


class GalleryUpdate(CamelModel):
    title: str | None = None
    category: str | None = None
    image: str | None = None
    space_id: str | None = None
    domain_id: str | None = None
    caption: str | None = None


# --- Lesson ------------------------------------------------------------------------
class LessonImpact(CamelModel):
    cost: str = ""
    time: str = ""
    quality: str = ""
    design: str = ""


class LessonResponse(CamelModel):
    id: str
    title: str
    category: str
    summary: str
    domain_id: str
    space_id: str
    impact: LessonImpact


class LessonCreate(CamelModel):
    title: str
    category: str = ""
    summary: str = ""
    domain_id: str = ""
    space_id: str = ""
    impact: LessonImpact = LessonImpact()


class LessonUpdate(CamelModel):
    title: str | None = None
    category: str | None = None
    summary: str | None = None
    domain_id: str | None = None
    space_id: str | None = None
    impact: LessonImpact | None = None

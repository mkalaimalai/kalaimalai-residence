"""SQLAlchemy models for the document context."""
from __future__ import annotations

from sqlalchemy import String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.db import Base, ProjectScoped


class DrawingModel(ProjectScoped, Base):
    __tablename__ = "drawings"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    domain_id: Mapped[str | None] = mapped_column(String, nullable=True, default=None)
    space_id: Mapped[str | None] = mapped_column(String, nullable=True, default=None)
    revision: Mapped[str] = mapped_column(String, default="")
    date: Mapped[str] = mapped_column(String, default="")
    status: Mapped[str] = mapped_column(String, default="Draft")
    consultant: Mapped[str] = mapped_column(String, default="")
    file_url: Mapped[str] = mapped_column(String, default="")
    notes: Mapped[str] = mapped_column(Text, default="")


class GalleryModel(ProjectScoped, Base):
    __tablename__ = "gallery_items"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str] = mapped_column(String, default="render")
    image: Mapped[str] = mapped_column(String, default="")
    space_id: Mapped[str | None] = mapped_column(String, nullable=True, default=None)
    domain_id: Mapped[str | None] = mapped_column(String, nullable=True, default=None)
    caption: Mapped[str] = mapped_column(Text, default="")


class LessonModel(ProjectScoped, Base):
    __tablename__ = "lessons"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str] = mapped_column(String, default="")
    summary: Mapped[str] = mapped_column(Text, default="")
    domain_id: Mapped[str | None] = mapped_column(String, nullable=True, default=None)
    space_id: Mapped[str | None] = mapped_column(String, nullable=True, default=None)
    impact: Mapped[dict] = mapped_column(JSONB, default=dict)

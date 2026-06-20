"""SQLAlchemy models for the project context."""
from __future__ import annotations

from sqlalchemy import Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.db import Base

_STR_ARRAY = ARRAY(String)


class SpaceModel(Base):
    __tablename__ = "spaces"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    design_intent: Mapped[str] = mapped_column(Text, default="")
    image: Mapped[str] = mapped_column(String, default="")
    domain_ids: Mapped[list[str]] = mapped_column(_STR_ARRAY, default=list)
    material_ids: Mapped[list[str]] = mapped_column(_STR_ARRAY, default=list)
    furniture: Mapped[list[str]] = mapped_column(_STR_ARRAY, default=list)
    lighting: Mapped[list[str]] = mapped_column(_STR_ARRAY, default=list)
    vendor_ids: Mapped[list[str]] = mapped_column(_STR_ARRAY, default=list)
    drawing_ids: Mapped[list[str]] = mapped_column(_STR_ARRAY, default=list)
    decision_ids: Mapped[list[str]] = mapped_column(_STR_ARRAY, default=list)
    status: Mapped[str] = mapped_column(String, default="Concept")
    lesson_ids: Mapped[list[str]] = mapped_column(_STR_ARRAY, default=list)


class DomainModel(Base):
    __tablename__ = "domains"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    space_ids: Mapped[list[str]] = mapped_column(_STR_ARRAY, default=list)
    drawing_ids: Mapped[list[str]] = mapped_column(_STR_ARRAY, default=list)
    vendor_ids: Mapped[list[str]] = mapped_column(_STR_ARRAY, default=list)
    status: Mapped[str] = mapped_column(String, default="Not Started")
    lesson_ids: Mapped[list[str]] = mapped_column(_STR_ARRAY, default=list)


class ProgressModel(Base):
    __tablename__ = "progress_entries"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    date: Mapped[str] = mapped_column(String, default="")
    phase: Mapped[str] = mapped_column(String, default="")
    space_id: Mapped[str] = mapped_column(String, default="")
    work_completed: Mapped[str] = mapped_column(Text, default="")
    photos: Mapped[list[str]] = mapped_column(_STR_ARRAY, default=list)
    issues: Mapped[str] = mapped_column(Text, default="")
    next_action: Mapped[str] = mapped_column(Text, default="")
    owner: Mapped[str] = mapped_column(String, default="")
    status: Mapped[str] = mapped_column(String, default="")


class ProjectModel(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    public_title: Mapped[str] = mapped_column(String, default="")
    public_subtitle: Mapped[str] = mapped_column(String, default="")
    city: Mapped[str] = mapped_column(String, default="")
    designer: Mapped[str] = mapped_column(String, default="")
    direction: Mapped[str] = mapped_column(Text, default="")
    hero_image: Mapped[str] = mapped_column(String, default="")
    concept_statement: Mapped[str] = mapped_column(Text, default="")
    internal_name: Mapped[str] = mapped_column(String, default="")
    villa_no: Mapped[str] = mapped_column(String, default="")
    community: Mapped[str] = mapped_column(String, default="")
    address: Mapped[str] = mapped_column(String, default="")
    plot_area: Mapped[str] = mapped_column(String, default="")
    built_up_area: Mapped[str] = mapped_column(String, default="")
    floors: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String, default="")
    start_date: Mapped[str] = mapped_column(String, default="")

"""SQLAlchemy models for the quality context."""
from __future__ import annotations

from sqlalchemy import String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.db import Base


class SnagModel(Base):
    __tablename__ = "snags"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    space_id: Mapped[str] = mapped_column(String, default="")
    category: Mapped[str] = mapped_column(String, default="")
    description: Mapped[str] = mapped_column(Text, default="")
    photo_url: Mapped[str] = mapped_column(String, default="")
    assigned_to: Mapped[str] = mapped_column(String, default="")
    priority: Mapped[str] = mapped_column(String, default="Low")
    status: Mapped[str] = mapped_column(String, default="Open")
    target_closure_date: Mapped[str] = mapped_column(String, default="")
    actual_closure_date: Mapped[str] = mapped_column(String, default="")
    notes: Mapped[str] = mapped_column(Text, default="")


class InspectionModel(Base):
    __tablename__ = "inspections"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    space_id: Mapped[str] = mapped_column(String, default="")
    work_package_id: Mapped[str] = mapped_column(String, default="")
    inspector: Mapped[str] = mapped_column(String, default="")
    inspection_date: Mapped[str] = mapped_column(String, default="")
    result: Mapped[str] = mapped_column(String, default="Pending")
    notes: Mapped[str] = mapped_column(Text, default="")


class DecisionModel(Base):
    __tablename__ = "decisions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    domain_id: Mapped[str] = mapped_column(String, default="")
    space_id: Mapped[str] = mapped_column(String, default="")
    type: Mapped[str] = mapped_column(String, default="Design")
    options_considered: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    final_decision: Mapped[str] = mapped_column(Text, default="")
    reason: Mapped[str] = mapped_column(Text, default="")
    cost_impact: Mapped[str] = mapped_column(String, default="")
    time_impact: Mapped[str] = mapped_column(String, default="")
    quality_impact: Mapped[str] = mapped_column(String, default="")
    date: Mapped[str] = mapped_column(String, default="")
    owner: Mapped[str] = mapped_column(String, default="")
    status: Mapped[str] = mapped_column(String, default="Open")

"""SQLAlchemy models for marketplace — snake_case columns, owned by the marketplace context."""
from __future__ import annotations

from sqlalchemy import Boolean, Float, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.db import Base, ProjectScoped


class ProfessionalModel(ProjectScoped, Base):
    __tablename__ = "professionals"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str | None] = mapped_column(String, nullable=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    company: Mapped[str] = mapped_column(String, default="")
    type: Mapped[str] = mapped_column(String, default="")
    specializations: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    contact_person: Mapped[str] = mapped_column(String, default="")
    phone: Mapped[str] = mapped_column(String, default="")
    email: Mapped[str] = mapped_column(String, default="")
    location: Mapped[str] = mapped_column(String, default="")
    service_areas: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    website: Mapped[str] = mapped_column(String, default="")
    portfolio_images: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    certifications: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    license_number: Mapped[str] = mapped_column(String, default="")
    rating: Mapped[float] = mapped_column(Numeric, default=0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String, default="Active")
    availability: Mapped[str] = mapped_column(String, default="")
    hourly_rate: Mapped[float | None] = mapped_column(Numeric, nullable=True)
    currency: Mapped[str | None] = mapped_column(String, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[str] = mapped_column(String, default="")
    updated_at: Mapped[str] = mapped_column(String, default="")


class ProfessionalReviewModel(ProjectScoped, Base):
    __tablename__ = "professional_reviews"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    professional_id: Mapped[str] = mapped_column(
        String, ForeignKey("professionals.id", ondelete="CASCADE"), nullable=False
    )
    reviewer_id: Mapped[str] = mapped_column(String, nullable=False)
    reviewer_name: Mapped[str] = mapped_column(String, nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    project_name: Mapped[str] = mapped_column(String, nullable=False)
    date: Mapped[str] = mapped_column(String, nullable=False)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)


class ProjectBriefModel(ProjectScoped, Base):
    __tablename__ = "project_briefs"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    required_professional_types: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list
    )
    budget_min: Mapped[float] = mapped_column(Numeric, default=0)
    budget_max: Mapped[float] = mapped_column(Numeric, default=0)
    budget_currency: Mapped[str] = mapped_column(String, default="INR")
    timeline: Mapped[str] = mapped_column(String, default="")
    location: Mapped[str] = mapped_column(String, default="")
    status: Mapped[str] = mapped_column(String, default="Draft")
    created_at: Mapped[str] = mapped_column(String, default="")
    updated_at: Mapped[str] = mapped_column(String, default="")


class BriefResponseModel(ProjectScoped, Base):
    __tablename__ = "brief_responses"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    brief_id: Mapped[str] = mapped_column(
        String, ForeignKey("project_briefs.id", ondelete="CASCADE"), nullable=False
    )
    professional_id: Mapped[str] = mapped_column(String, nullable=False)
    professional_name: Mapped[str] = mapped_column(String, nullable=False)
    proposed_fee: Mapped[float] = mapped_column(Numeric, nullable=False)
    currency: Mapped[str] = mapped_column(String, default="INR")
    timeline: Mapped[str] = mapped_column(String, default="")
    approach: Mapped[str] = mapped_column(Text, default="")
    portfolio_items: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    status: Mapped[str] = mapped_column(String, default="Pending")
    submitted_at: Mapped[str] = mapped_column(String, default="")
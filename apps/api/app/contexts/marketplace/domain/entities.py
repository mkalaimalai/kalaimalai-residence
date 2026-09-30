"""Marketplace domain entities — Professional and ProjectBrief."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Optional

from app.shared.ids import new_id


def _now() -> datetime:
    return datetime.now(UTC)


@dataclass
class Professional:
    """Professional service provider — architect, consultant, contractor, etc."""

    id: str
    project_id: str
    user_id: Optional[str] = None
    name: str = ""
    company: str = ""
    type: str = ""
    specializations: list[str] = field(default_factory=list)
    contact_person: str = ""
    phone: str = ""
    email: str = ""
    location: str = ""
    service_areas: list[str] = field(default_factory=list)
    website: str = ""
    portfolio_images: list[str] = field(default_factory=list)
    certifications: list[str] = field(default_factory=list)
    license_number: str = ""
    rating: float = 0.0
    review_count: int = 0
    status: str = "Active"
    availability: str = ""
    hourly_rate: Optional[float] = None
    currency: Optional[str] = None
    notes: str = ""
    created_at: datetime = field(default_factory=_now)
    updated_at: datetime = field(default_factory=_now)

    @classmethod
    def create(
        cls,
        project_id: str,
        name: str,
        company: str,
        type: str,
        specializations: list[str],
        contact_person: str,
        phone: str,
        email: str,
        location: str,
        service_areas: list[str],
        website: str,
        portfolio_images: list[str],
        certifications: list[str],
        license_number: str,
        rating: float,
        review_count: int,
        status: str,
        availability: str,
        hourly_rate: Optional[float],
        currency: Optional[str],
        notes: str,
        user_id: Optional[str] = None,
    ) -> "Professional":
        return cls(
            id=new_id("prof"),
            project_id=project_id,
            user_id=user_id,
            name=name,
            company=company,
            type=type,
            specializations=specializations,
            contact_person=contact_person,
            phone=phone,
            email=email,
            location=location,
            service_areas=service_areas,
            website=website,
            portfolio_images=portfolio_images,
            certifications=certifications,
            license_number=license_number,
            rating=rating,
            review_count=review_count,
            status=status,
            availability=availability,
            hourly_rate=hourly_rate,
            currency=currency,
            notes=notes,
        )


@dataclass
class ProfessionalReview:
    """Review for a professional."""

    id: str
    project_id: str
    professional_id: str
    reviewer_id: str
    reviewer_name: str
    rating: int
    title: str
    content: str
    project_name: str
    date: str
    verified: bool = False

    @classmethod
    def create(
        cls,
        project_id: str,
        professional_id: str,
        reviewer_id: str,
        reviewer_name: str,
        rating: int,
        title: str,
        content: str,
        project_name: str,
        date: str,
        verified: bool = False,
    ) -> "ProfessionalReview":
        return cls(
            id=new_id("review"),
            project_id=project_id,
            professional_id=professional_id,
            reviewer_id=reviewer_id,
            reviewer_name=reviewer_name,
            rating=rating,
            title=title,
            content=content,
            project_name=project_name,
            date=date,
            verified=verified,
        )


@dataclass
class ProjectBrief:
    """Project brief posted by a client seeking professionals."""

    id: str
    project_id: str
    title: str
    description: str
    required_professional_types: list[str]
    budget_min: float
    budget_max: float
    budget_currency: str
    timeline: str
    location: str
    status: str = "Draft"
    responses: list["BriefResponse"] = field(default_factory=list)
    created_at: datetime = field(default_factory=_now)
    updated_at: datetime = field(default_factory=_now)

    @classmethod
    def create(
        cls,
        project_id: str,
        title: str,
        description: str,
        required_professional_types: list[str],
        budget_min: float,
        budget_max: float,
        budget_currency: str,
        timeline: str,
        location: str,
        status: str = "Draft",
    ) -> "ProjectBrief":
        return cls(
            id=new_id("brief"),
            project_id=project_id,
            title=title,
            description=description,
            required_professional_types=required_professional_types,
            budget_min=budget_min,
            budget_max=budget_max,
            budget_currency=budget_currency,
            timeline=timeline,
            location=location,
            status=status,
        )


@dataclass
class BriefResponse:
    """Response from a professional to a project brief."""

    id: str
    brief_id: str
    professional_id: str
    professional_name: str
    proposed_fee: float
    currency: str
    timeline: str
    approach: str
    portfolio_items: list[str]
    status: str = "Pending"
    submitted_at: datetime = field(default_factory=_now)

    @classmethod
    def create(
        cls,
        brief_id: str,
        professional_id: str,
        professional_name: str,
        proposed_fee: float,
        currency: str,
        timeline: str,
        approach: str,
        portfolio_items: list[str],
        status: str = "Pending",
    ) -> "BriefResponse":
        return cls(
            id=new_id("response"),
            brief_id=brief_id,
            professional_id=professional_id,
            professional_name=professional_name,
            proposed_fee=proposed_fee,
            currency=currency,
            timeline=timeline,
            approach=approach,
            portfolio_items=portfolio_items,
            status=status,
        )
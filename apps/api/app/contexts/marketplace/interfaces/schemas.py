"""Pydantic request/response models for marketplace.

Response shape mirrors `types/index.ts` Professional exactly (camelCase on the wire).
"""
from __future__ import annotations

from app.contexts.marketplace.domain.entities import (
    Professional,
    ProfessionalReview,
    ProjectBrief,
    BriefResponse,
)
from app.shared.camel import CamelModel


class ProfessionalResponse(CamelModel):
    project_id: str
    id: str
    user_id: str | None = None
    name: str
    company: str
    type: str
    specializations: list[str]
    contact_person: str
    phone: str
    email: str
    location: str
    service_areas: list[str]
    website: str
    portfolio_images: list[str]
    certifications: list[str]
    license_number: str
    rating: float
    review_count: int
    status: str
    availability: str
    hourly_rate: float | None = None
    currency: str | None = None
    notes: str
    created_at: str
    updated_at: str

    @classmethod
    def from_entity(cls, professional: Professional) -> ProfessionalResponse:
        return cls.model_validate(professional)


class ProfessionalCreate(CamelModel):
    project_id: str
    user_id: str | None = None
    name: str
    company: str = ""
    type: str = ""
    specializations: list[str] = []
    contact_person: str = ""
    phone: str = ""
    email: str = ""
    location: str = ""
    service_areas: list[str] = []
    website: str = ""
    portfolio_images: list[str] = []
    certifications: list[str] = []
    license_number: str = ""
    rating: float = 0.0
    review_count: int = 0
    status: str = "Active"
    availability: str = ""
    hourly_rate: float | None = None
    currency: str | None = None
    notes: str = ""


class ProfessionalUpdate(CamelModel):
    name: str | None = None
    company: str | None = None
    type: str | None = None
    specializations: list[str] | None = None
    contact_person: str | None = None
    phone: str | None = None
    email: str | None = None
    location: str | None = None
    service_areas: list[str] | None = None
    website: str | None = None
    portfolio_images: list[str] | None = None
    certifications: list[str] | None = None
    license_number: str | None = None
    rating: float | None = None
    review_count: int | None = None
    status: str | None = None
    availability: str | None = None
    hourly_rate: float | None = None
    currency: str | None = None
    notes: str | None = None


class ProfessionalReviewResponse(CamelModel):
    project_id: str
    id: str
    professional_id: str
    reviewer_id: str
    reviewer_name: str
    rating: int
    title: str
    content: str
    project_name: str
    date: str
    verified: bool

    @classmethod
    def from_entity(cls, review: ProfessionalReview) -> ProfessionalReviewResponse:
        return cls.model_validate(review)


class ReviewCreate(CamelModel):
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


class ProjectBriefResponse(CamelModel):
    project_id: str
    id: str
    title: str
    description: str
    required_professional_types: list[str]
    budget_min: float
    budget_max: float
    budget_currency: str
    timeline: str
    location: str
    status: str
    responses: list[BriefResponseResponse] = []
    created_at: str
    updated_at: str

    @classmethod
    def from_entity(cls, brief: ProjectBrief) -> ProjectBriefResponse:
        return cls.model_validate(brief)


class BriefCreate(CamelModel):
    project_id: str
    title: str
    description: str = ""
    required_professional_types: list[str] = []
    budget_min: float = 0
    budget_max: float = 0
    budget_currency: str = "INR"
    timeline: str = ""
    location: str = ""
    status: str = "Draft"


class BriefUpdate(CamelModel):
    title: str | None = None
    description: str | None = None
    required_professional_types: list[str] | None = None
    budget_min: float | None = None
    budget_max: float | None = None
    budget_currency: str | None = None
    timeline: str | None = None
    location: str | None = None
    status: str | None = None


class BriefResponseResponse(CamelModel):
    id: str
    brief_id: str
    professional_id: str
    professional_name: str
    proposed_fee: float
    currency: str
    timeline: str
    approach: str
    portfolio_items: list[str]
    status: str
    submitted_at: str

    @classmethod
    def from_entity(cls, response: BriefResponse) -> BriefResponseResponse:
        return cls.model_validate(response)


class ResponseCreate(CamelModel):
    brief_id: str
    professional_id: str
    professional_name: str
    proposed_fee: float
    currency: str = "INR"
    timeline: str = ""
    approach: str = ""
    portfolio_items: list[str] = []
    status: str = "Pending"


class ResponseUpdate(CamelModel):
    proposed_fee: float | None = None
    currency: str | None = None
    timeline: str | None = None
    approach: str | None = None
    portfolio_items: list[str] | None = None
    status: str | None = None
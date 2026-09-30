"""Marketplace application commands — data transfer objects for use cases."""
from __future__ import annotations

from pydantic import BaseModel
from typing import Optional


class CreateProfessionalCommand(BaseModel):
    project_id: str
    user_id: Optional[str] = None
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
    hourly_rate: Optional[float] = None
    currency: Optional[str] = None
    notes: str = ""


class UpdateProfessionalCommand(BaseModel):
    changes: dict


class CreateReviewCommand(BaseModel):
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


class CreateBriefCommand(BaseModel):
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


class UpdateBriefCommand(BaseModel):
    changes: dict


class CreateResponseCommand(BaseModel):
    brief_id: str
    professional_id: str
    professional_name: str
    proposed_fee: float
    currency: str = "INR"
    timeline: str = ""
    approach: str = ""
    portfolio_items: list[str] = []
    status: str = "Pending"


class UpdateResponseCommand(BaseModel):
    changes: dict
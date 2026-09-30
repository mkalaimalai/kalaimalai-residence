"""ORM ↔ domain entity translation for the marketplace context."""
from __future__ import annotations

from app.contexts.marketplace.domain.entities import (
    Professional,
    ProfessionalReview,
    ProjectBrief,
    BriefResponse,
)
from app.contexts.marketplace.infrastructure.orm import (
    ProfessionalModel,
    ProfessionalReviewModel,
    ProjectBriefModel,
    BriefResponseModel,
)


def professional_to_entity(row: ProfessionalModel) -> Professional:
    return Professional(
        id=row.id,
        project_id=row.project_id,
        user_id=row.user_id,
        name=row.name,
        company=row.company,
        type=row.type,
        specializations=list(row.specializations) if row.specializations else [],
        contact_person=row.contact_person,
        phone=row.phone,
        email=row.email,
        location=row.location,
        service_areas=list(row.service_areas) if row.service_areas else [],
        website=row.website,
        portfolio_images=list(row.portfolio_images) if row.portfolio_images else [],
        certifications=list(row.certifications) if row.certifications else [],
        license_number=row.license_number,
        rating=float(row.rating),
        review_count=row.review_count,
        status=row.status,
        availability=row.availability,
        hourly_rate=float(row.hourly_rate) if row.hourly_rate is not None else None,
        currency=row.currency,
        notes=row.notes,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


def professional_to_columns(prof: Professional) -> dict:
    return {
        "id": prof.id,
        "project_id": prof.project_id,
        "user_id": prof.user_id,
        "name": prof.name,
        "company": prof.company,
        "type": prof.type,
        "specializations": prof.specializations,
        "contact_person": prof.contact_person,
        "phone": prof.phone,
        "email": prof.email,
        "location": prof.location,
        "service_areas": prof.service_areas,
        "website": prof.website,
        "portfolio_images": prof.portfolio_images,
        "certifications": prof.certifications,
        "license_number": prof.license_number,
        "rating": prof.rating,
        "review_count": prof.review_count,
        "status": prof.status,
        "availability": prof.availability,
        "hourly_rate": prof.hourly_rate,
        "currency": prof.currency,
        "notes": prof.notes,
        "created_at": prof.created_at.isoformat() if hasattr(prof.created_at, 'isoformat') else str(prof.created_at),
        "updated_at": prof.updated_at.isoformat() if hasattr(prof.updated_at, 'isoformat') else str(prof.updated_at),
    }


def review_to_entity(row: ProfessionalReviewModel) -> ProfessionalReview:
    return ProfessionalReview(
        id=row.id,
        project_id=row.project_id,
        professional_id=row.professional_id,
        reviewer_id=row.reviewer_id,
        reviewer_name=row.reviewer_name,
        rating=row.rating,
        title=row.title,
        content=row.content,
        project_name=row.project_name,
        date=row.date,
        verified=row.verified,
    )


def review_to_columns(review: ProfessionalReview) -> dict:
    return {
        "id": review.id,
        "project_id": review.project_id,
        "professional_id": review.professional_id,
        "reviewer_id": review.reviewer_id,
        "reviewer_name": review.reviewer_name,
        "rating": review.rating,
        "title": review.title,
        "content": review.content,
        "project_name": review.project_name,
        "date": review.date,
        "verified": review.verified,
    }


def brief_to_entity(row: ProjectBriefModel) -> ProjectBrief:
    return ProjectBrief(
        id=row.id,
        project_id=row.project_id,
        title=row.title,
        description=row.description,
        required_professional_types=list(row.required_professional_types) if row.required_professional_types else [],
        budget_min=float(row.budget_min),
        budget_max=float(row.budget_max),
        budget_currency=row.budget_currency,
        timeline=row.timeline,
        location=row.location,
        status=row.status,
        responses=[],
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


def brief_to_columns(brief: ProjectBrief) -> dict:
    return {
        "id": brief.id,
        "project_id": brief.project_id,
        "title": brief.title,
        "description": brief.description,
        "required_professional_types": brief.required_professional_types,
        "budget_min": brief.budget_min,
        "budget_max": brief.budget_max,
        "budget_currency": brief.budget_currency,
        "timeline": brief.timeline,
        "location": brief.location,
        "status": brief.status,
        "created_at": brief.created_at.isoformat() if hasattr(brief.created_at, 'isoformat') else str(brief.created_at),
        "updated_at": brief.updated_at.isoformat() if hasattr(brief.updated_at, 'isoformat') else str(brief.updated_at),
    }


def response_to_entity(row: BriefResponseModel) -> BriefResponse:
    return BriefResponse(
        id=row.id,
        brief_id=row.brief_id,
        professional_id=row.professional_id,
        professional_name=row.professional_name,
        proposed_fee=float(row.proposed_fee),
        currency=row.currency,
        timeline=row.timeline,
        approach=row.approach,
        portfolio_items=list(row.portfolio_items) if row.portfolio_items else [],
        status=row.status,
        submitted_at=row.submitted_at,
    )


def response_to_columns(response: BriefResponse) -> dict:
    return {
        "id": response.id,
        "brief_id": response.brief_id,
        "professional_id": response.professional_id,
        "professional_name": response.professional_name,
        "proposed_fee": response.proposed_fee,
        "currency": response.currency,
        "timeline": response.timeline,
        "approach": response.approach,
        "portfolio_items": response.portfolio_items,
        "status": response.status,
        "submitted_at": response.submitted_at.isoformat() if hasattr(response.submitted_at, 'isoformat') else str(response.submitted_at),
    }
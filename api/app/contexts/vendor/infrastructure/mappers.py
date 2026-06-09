"""ORM ↔ domain entity translation for the vendor context."""
from __future__ import annotations

from app.contexts.vendor.domain.entities import Vendor
from app.contexts.vendor.infrastructure.orm import VendorModel


def to_entity(row: VendorModel) -> Vendor:
    return Vendor(
        id=row.id,
        name=row.name,
        category=row.category,
        contact_person=row.contact_person,
        phone=row.phone,
        email=row.email,
        location=row.location,
        website=row.website,
        quote_url=row.quote_url,
        finalized=row.finalized,
        rating=float(row.rating),
        notes=row.notes,
    )


def to_columns(vendor: Vendor) -> dict:
    return {
        "id": vendor.id,
        "name": vendor.name,
        "category": vendor.category,
        "contact_person": vendor.contact_person,
        "phone": vendor.phone,
        "email": vendor.email,
        "location": vendor.location,
        "website": vendor.website,
        "quote_url": vendor.quote_url,
        "finalized": vendor.finalized,
        "rating": vendor.rating,
        "notes": vendor.notes,
    }

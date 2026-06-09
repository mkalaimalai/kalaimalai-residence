"""Pydantic request/response models for vendors.

Response shape mirrors `types/index.ts` Vendor exactly (camelCase on the wire).
"""
from __future__ import annotations

from app.contexts.vendor.domain.entities import Vendor
from app.shared.camel import CamelModel


class VendorResponse(CamelModel):
    id: str
    name: str
    category: str
    contact_person: str
    phone: str
    email: str
    location: str
    website: str
    quote_url: str
    finalized: bool
    rating: float
    notes: str

    @classmethod
    def from_entity(cls, vendor: Vendor) -> "VendorResponse":
        return cls.model_validate(vendor)


class VendorCreate(CamelModel):
    name: str
    category: str = ""
    contact_person: str = ""
    phone: str = ""
    email: str = ""
    location: str = ""
    website: str = ""
    quote_url: str = ""
    finalized: bool = False
    rating: float = 0.0
    notes: str = ""


class VendorUpdate(CamelModel):
    name: str | None = None
    category: str | None = None
    contact_person: str | None = None
    phone: str | None = None
    email: str | None = None
    location: str | None = None
    website: str | None = None
    quote_url: str | None = None
    finalized: bool | None = None
    rating: float | None = None
    notes: str | None = None

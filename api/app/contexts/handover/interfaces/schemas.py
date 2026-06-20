"""Pydantic request/response models for the handover context."""
from __future__ import annotations

from app.shared.camel import CamelModel


class WarrantyResponse(CamelModel):
    id: str
    item: str
    category: str
    vendor_id: str
    brand: str
    purchase_date: str
    warranty_start: str
    warranty_end: str
    invoice_url: str
    manual_url: str
    service_contact: str
    notes: str


class WarrantyCreate(CamelModel):
    item: str
    category: str = ""
    vendor_id: str = ""
    brand: str = ""
    purchase_date: str = ""
    warranty_start: str = ""
    warranty_end: str = ""
    invoice_url: str = ""
    manual_url: str = ""
    service_contact: str = ""
    notes: str = ""


class WarrantyUpdate(CamelModel):
    item: str | None = None
    category: str | None = None
    vendor_id: str | None = None
    brand: str | None = None
    purchase_date: str | None = None
    warranty_start: str | None = None
    warranty_end: str | None = None
    invoice_url: str | None = None
    manual_url: str | None = None
    service_contact: str | None = None
    notes: str | None = None

"""Handover context domain entity — Warranty."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Warranty:
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

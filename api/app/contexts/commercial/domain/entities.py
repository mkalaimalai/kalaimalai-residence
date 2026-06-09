"""Commercial context domain entities — BOQ, ProcurementItem, Material."""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class BOQ:
    id: str
    vendor_id: str
    category: str
    quote_date: str
    original_amount: float
    negotiated_amount: float
    gst: float
    total: float
    payment_status: str
    file_url: str
    notes: str


@dataclass
class ProcurementItem:
    id: str
    item: str
    category: str
    space_id: str
    brand: str
    vendor_id: str
    country: str
    quantity: int
    estimated_price: float
    quoted_price: float
    negotiated_price: float
    final_price: float
    currency: str
    status: str
    delivery_date: str
    installation_date: str
    warranty: str
    notes: str


@dataclass
class Material:
    id: str
    name: str
    category: str
    space_ids: list[str] = field(default_factory=list)
    vendor_id: str = ""
    status: str = ""
    image: str = ""
    notes: str = ""

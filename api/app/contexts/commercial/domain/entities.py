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


@dataclass
class Quote:
    id: str
    project_id: str
    vendor_id: str
    boq_id: str = ""  # the BOQ package this quote is against
    quote_number: str = ""
    quote_date: str = ""
    valid_until: str = ""
    total_amount: float = 0
    currency: str = "INR"
    tax_amount: float = 0
    scope_summary: str = ""
    terms: str = ""
    document_id: str = ""
    comparison_status: str = "Pending"  # Pending|Shortlisted|Negotiated|Accepted|Rejected
    approved_amount: float = 0
    approved_by: str = ""
    approval_note: str = ""

    def is_expired(self, today: str) -> bool:
        return bool(self.valid_until) and self.valid_until < today


@dataclass
class QuoteLineItem:
    id: str
    quote_id: str
    boq_line_id: str = ""
    description: str = ""
    quantity: float = 0
    unit: str = ""
    unit_price: float = 0
    total_price: float = 0
    brand: str = ""
    specification: str = ""
    inclusions: str = ""
    exclusions: str = ""
    negotiation_target_price: float = 0


@dataclass
class PurchaseOrder:
    id: str
    project_id: str
    quote_id: str
    vendor_id: str
    amount: float
    currency: str = "INR"
    status: str = "Created"  # Created|Issued|Acknowledged|Closed|Cancelled
    created_at: str = ""
    notes: str = ""


@dataclass
class Delivery:
    id: str
    purchase_order_id: str
    project_id: str = ""
    expected_date: str = ""
    actual_date: str = ""
    status: str = "Planned"  # Planned|Shipped|Delivered|Installed
    notes: str = ""


@dataclass
class BOQLineItem:
    id: str
    boq_id: str = ""  # parent BOQ package
    project_id: str = ""
    space_id: str = ""
    work_package_id: str = ""
    description: str = ""
    quantity: float = 0
    unit: str = ""
    benchmark_rate: float = 0
    approved_rate: float = 0
    approved_vendor_id: str = ""
    status: str = "Estimated"

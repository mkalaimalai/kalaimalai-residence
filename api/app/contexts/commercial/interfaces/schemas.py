"""Pydantic request/response models for the commercial context."""
from __future__ import annotations

from app.shared.camel import CamelModel


# --- BOQ ---------------------------------------------------------------------------
class BOQResponse(CamelModel):
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


class BOQCreate(CamelModel):
    vendor_id: str = ""
    category: str = ""
    quote_date: str = ""
    original_amount: float = 0
    negotiated_amount: float = 0
    gst: float = 0
    total: float = 0
    payment_status: str = "Unpaid"
    file_url: str = ""
    notes: str = ""


class BOQUpdate(CamelModel):
    vendor_id: str | None = None
    category: str | None = None
    quote_date: str | None = None
    original_amount: float | None = None
    negotiated_amount: float | None = None
    gst: float | None = None
    total: float | None = None
    payment_status: str | None = None
    file_url: str | None = None
    notes: str | None = None


# --- ProcurementItem ---------------------------------------------------------------
class ProcurementResponse(CamelModel):
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


class ProcurementCreate(CamelModel):
    item: str
    category: str = ""
    space_id: str = ""
    brand: str = ""
    vendor_id: str = ""
    country: str = ""
    quantity: int = 1
    estimated_price: float = 0
    quoted_price: float = 0
    negotiated_price: float = 0
    final_price: float = 0
    currency: str = "INR"
    status: str = "Identified"
    delivery_date: str = ""
    installation_date: str = ""
    warranty: str = ""
    notes: str = ""


class ProcurementUpdate(CamelModel):
    item: str | None = None
    category: str | None = None
    space_id: str | None = None
    brand: str | None = None
    vendor_id: str | None = None
    country: str | None = None
    quantity: int | None = None
    estimated_price: float | None = None
    quoted_price: float | None = None
    negotiated_price: float | None = None
    final_price: float | None = None
    currency: str | None = None
    status: str | None = None
    delivery_date: str | None = None
    installation_date: str | None = None
    warranty: str | None = None
    notes: str | None = None


# --- Material ----------------------------------------------------------------------
class MaterialResponse(CamelModel):
    id: str
    name: str
    category: str
    space_ids: list[str]
    vendor_id: str
    status: str
    image: str
    notes: str


class MaterialCreate(CamelModel):
    name: str
    category: str = ""
    space_ids: list[str] = []
    vendor_id: str = ""
    status: str = ""
    image: str = ""
    notes: str = ""


class MaterialUpdate(CamelModel):
    name: str | None = None
    category: str | None = None
    space_ids: list[str] | None = None
    vendor_id: str | None = None
    status: str | None = None
    image: str | None = None
    notes: str | None = None


# --- Quote -------------------------------------------------------------------------
class QuoteResponse(CamelModel):
    id: str
    project_id: str
    vendor_id: str
    boq_id: str
    quote_number: str
    quote_date: str
    valid_until: str
    total_amount: float
    currency: str
    tax_amount: float
    scope_summary: str
    terms: str
    document_id: str
    comparison_status: str
    approved_amount: float
    approved_by: str
    approval_note: str


class QuoteCreate(CamelModel):
    project_id: str
    vendor_id: str
    boq_id: str = ""
    quote_number: str = ""
    quote_date: str = ""
    valid_until: str = ""
    total_amount: float = 0
    currency: str = "INR"
    tax_amount: float = 0
    scope_summary: str = ""
    terms: str = ""
    document_id: str = ""
    comparison_status: str = "Pending"


class ApproveQuoteRequest(CamelModel):
    approved_by: str = ""
    approved_amount: float | None = None
    approval_note: str = ""


class QuoteActionNote(CamelModel):
    note: str = ""


class QuoteLineItemResponse(CamelModel):
    id: str
    quote_id: str
    boq_line_id: str
    description: str
    quantity: float
    unit: str
    unit_price: float
    total_price: float
    brand: str
    specification: str
    inclusions: str
    exclusions: str
    negotiation_target_price: float


class QuoteLineItemCreate(CamelModel):
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


# --- PurchaseOrder / Delivery ------------------------------------------------------
class PurchaseOrderResponse(CamelModel):
    id: str
    project_id: str
    quote_id: str
    vendor_id: str
    amount: float
    currency: str
    status: str
    created_at: str
    notes: str


class PurchaseOrderCreate(CamelModel):
    project_id: str
    quote_id: str = ""
    vendor_id: str
    amount: float = 0
    currency: str = "INR"
    status: str = "Created"
    notes: str = ""


class PurchaseOrderStatus(CamelModel):
    status: str


class QuoteApprovalResponse(CamelModel):
    quote: QuoteResponse
    purchase_order: PurchaseOrderResponse
    message: str = "Quote approved and purchase order created successfully."


class DeliveryResponse(CamelModel):
    id: str
    purchase_order_id: str
    project_id: str
    expected_date: str
    actual_date: str
    status: str
    notes: str


class DeliveryCreate(CamelModel):
    purchase_order_id: str
    project_id: str = ""
    expected_date: str = ""
    actual_date: str = ""
    status: str = "Planned"
    notes: str = ""


# --- BOQ line items ----------------------------------------------------------------
class BOQLineItemResponse(CamelModel):
    id: str
    boq_id: str
    project_id: str
    space_id: str
    work_package_id: str
    description: str
    quantity: float
    unit: str
    benchmark_rate: float
    approved_rate: float
    approved_vendor_id: str
    status: str


class BOQLineItemCreate(CamelModel):
    boq_id: str = ""
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

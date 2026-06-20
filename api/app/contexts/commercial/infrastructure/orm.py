"""SQLAlchemy models for the commercial context.

Includes the BOQ/Procurement/Material tables exposed today, plus the Quote,
QuoteLineItem and BOQLineItem tables (schema only — no endpoints until a write
feature needs them, per the migration plan).
"""
from __future__ import annotations

from sqlalchemy import Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.db import Base

_STR_ARRAY = ARRAY(String)


class BOQModel(Base):
    __tablename__ = "boqs"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    vendor_id: Mapped[str] = mapped_column(String, default="")
    category: Mapped[str] = mapped_column(String, default="")
    quote_date: Mapped[str] = mapped_column(String, default="")
    original_amount: Mapped[float] = mapped_column(Numeric, default=0)
    negotiated_amount: Mapped[float] = mapped_column(Numeric, default=0)
    gst: Mapped[float] = mapped_column(Numeric, default=0)
    total: Mapped[float] = mapped_column(Numeric, default=0)
    payment_status: Mapped[str] = mapped_column(String, default="Unpaid")
    file_url: Mapped[str] = mapped_column(String, default="")
    notes: Mapped[str] = mapped_column(Text, default="")


class ProcurementModel(Base):
    __tablename__ = "procurement_items"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    item: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str] = mapped_column(String, default="")
    space_id: Mapped[str] = mapped_column(String, default="")
    brand: Mapped[str] = mapped_column(String, default="")
    vendor_id: Mapped[str] = mapped_column(String, default="")
    country: Mapped[str] = mapped_column(String, default="")
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    estimated_price: Mapped[float] = mapped_column(Numeric, default=0)
    quoted_price: Mapped[float] = mapped_column(Numeric, default=0)
    negotiated_price: Mapped[float] = mapped_column(Numeric, default=0)
    final_price: Mapped[float] = mapped_column(Numeric, default=0)
    currency: Mapped[str] = mapped_column(String, default="INR")
    status: Mapped[str] = mapped_column(String, default="Identified")
    delivery_date: Mapped[str] = mapped_column(String, default="")
    installation_date: Mapped[str] = mapped_column(String, default="")
    warranty: Mapped[str] = mapped_column(String, default="")
    notes: Mapped[str] = mapped_column(Text, default="")


class MaterialModel(Base):
    __tablename__ = "materials"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str] = mapped_column(String, default="")
    space_ids: Mapped[list[str]] = mapped_column(_STR_ARRAY, default=list)
    vendor_id: Mapped[str] = mapped_column(String, default="")
    status: Mapped[str] = mapped_column(String, default="")
    image: Mapped[str] = mapped_column(String, default="")
    notes: Mapped[str] = mapped_column(Text, default="")


# --- New MVP tables (schema only; no endpoints yet) --------------------------------
class QuoteModel(Base):
    __tablename__ = "quotes"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    project_id: Mapped[str] = mapped_column(String, default="")
    vendor_id: Mapped[str] = mapped_column(String, default="")
    boq_id: Mapped[str] = mapped_column(String, default="")
    quote_number: Mapped[str] = mapped_column(String, default="")
    quote_date: Mapped[str] = mapped_column(String, default="")
    valid_until: Mapped[str] = mapped_column(String, default="")
    total_amount: Mapped[float] = mapped_column(Numeric, default=0)
    currency: Mapped[str] = mapped_column(String, default="INR")
    tax_amount: Mapped[float] = mapped_column(Numeric, default=0)
    scope_summary: Mapped[str] = mapped_column(Text, default="")
    terms: Mapped[str] = mapped_column(Text, default="")
    document_id: Mapped[str] = mapped_column(String, default="")
    comparison_status: Mapped[str] = mapped_column(String, default="Pending")
    approved_amount: Mapped[float] = mapped_column(Numeric, default=0)
    approved_by: Mapped[str] = mapped_column(String, default="")
    approval_note: Mapped[str] = mapped_column(Text, default="")


class QuoteLineItemModel(Base):
    __tablename__ = "quote_line_items"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    quote_id: Mapped[str] = mapped_column(String, default="")
    boq_line_id: Mapped[str] = mapped_column(String, default="")
    description: Mapped[str] = mapped_column(Text, default="")
    quantity: Mapped[float] = mapped_column(Numeric, default=0)
    unit: Mapped[str] = mapped_column(String, default="")
    unit_price: Mapped[float] = mapped_column(Numeric, default=0)
    total_price: Mapped[float] = mapped_column(Numeric, default=0)
    brand: Mapped[str] = mapped_column(String, default="")
    specification: Mapped[str] = mapped_column(Text, default="")
    inclusions: Mapped[str] = mapped_column(Text, default="")
    exclusions: Mapped[str] = mapped_column(Text, default="")
    negotiation_target_price: Mapped[float] = mapped_column(Numeric, default=0)


class BOQLineItemModel(Base):
    __tablename__ = "boq_line_items"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    boq_id: Mapped[str] = mapped_column(String, default="")  # parent BOQ package
    project_id: Mapped[str] = mapped_column(String, default="")
    space_id: Mapped[str] = mapped_column(String, default="")
    work_package_id: Mapped[str] = mapped_column(String, default="")
    description: Mapped[str] = mapped_column(Text, default="")
    quantity: Mapped[float] = mapped_column(Numeric, default=0)
    unit: Mapped[str] = mapped_column(String, default="")
    benchmark_rate: Mapped[float] = mapped_column(Numeric, default=0)
    approved_rate: Mapped[float] = mapped_column(Numeric, default=0)
    approved_vendor_id: Mapped[str] = mapped_column(String, default="")
    status: Mapped[str] = mapped_column(String, default="Estimated")


class PurchaseOrderModel(Base):
    __tablename__ = "purchase_orders"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    project_id: Mapped[str] = mapped_column(String, default="")
    quote_id: Mapped[str] = mapped_column(String, default="")
    vendor_id: Mapped[str] = mapped_column(String, default="")
    amount: Mapped[float] = mapped_column(Numeric, default=0)
    currency: Mapped[str] = mapped_column(String, default="INR")
    status: Mapped[str] = mapped_column(String, default="Created")
    created_at: Mapped[str] = mapped_column(String, default="")
    notes: Mapped[str] = mapped_column(Text, default="")


class DeliveryModel(Base):
    __tablename__ = "deliveries"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    purchase_order_id: Mapped[str] = mapped_column(String, default="")
    project_id: Mapped[str] = mapped_column(String, default="")
    expected_date: Mapped[str] = mapped_column(String, default="")
    actual_date: Mapped[str] = mapped_column(String, default="")
    status: Mapped[str] = mapped_column(String, default="Planned")
    notes: Mapped[str] = mapped_column(Text, default="")

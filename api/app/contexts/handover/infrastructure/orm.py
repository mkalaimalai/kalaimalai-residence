"""SQLAlchemy model for the handover context."""
from __future__ import annotations

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.db import Base


class WarrantyModel(Base):
    __tablename__ = "warranties"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    item: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str] = mapped_column(String, default="")
    vendor_id: Mapped[str] = mapped_column(String, default="")
    brand: Mapped[str] = mapped_column(String, default="")
    purchase_date: Mapped[str] = mapped_column(String, default="")
    warranty_start: Mapped[str] = mapped_column(String, default="")
    warranty_end: Mapped[str] = mapped_column(String, default="")
    invoice_url: Mapped[str] = mapped_column(String, default="")
    manual_url: Mapped[str] = mapped_column(String, default="")
    service_contact: Mapped[str] = mapped_column(String, default="")
    notes: Mapped[str] = mapped_column(Text, default="")

"""Vendor aggregate root — pure domain entity (no ORM, no Pydantic)."""
from __future__ import annotations

from dataclasses import dataclass

from app.contexts.vendor.domain.value_objects import Rating


@dataclass
class Vendor:
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

    def __post_init__(self) -> None:
        # Enforce the rating invariant through the value object.
        Rating(self.rating)

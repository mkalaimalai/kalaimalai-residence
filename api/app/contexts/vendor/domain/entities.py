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
    # Tenant boundary (migrations/002_project_scope.sql). Defaulted only because
    # dataclass ordering forbids a required field after defaulted ones;
    # CrudService.create rejects an empty value before it reaches the FK.
    project_id: str = ""

"""Write inputs for the vendor context (application layer)."""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class CreateVendorCommand:
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


@dataclass
class UpdateVendorCommand:
    # Only provided keys are applied; None means "leave unchanged".
    changes: dict = field(default_factory=dict)

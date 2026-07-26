"""Pydantic request/response models for the identity context."""
from __future__ import annotations

from datetime import datetime

from app.shared.camel import CamelModel


class UserProfileResponse(CamelModel):
    id: str
    email: str | None
    display_name: str | None
    role: str
    created_at: datetime
    updated_at: datetime


class UserProfileUpdate(CamelModel):
    """The self-service write surface. `role` is absent on purpose — it mirrors
    `app_metadata.role`, and accepting it here would let a user promote themselves."""

    display_name: str

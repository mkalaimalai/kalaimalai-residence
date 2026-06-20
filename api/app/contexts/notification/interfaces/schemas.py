"""Pydantic models for the notification context."""
from __future__ import annotations

from app.shared.camel import CamelModel


class NotificationResponse(CamelModel):
    id: str
    channel: str
    recipient: str
    subject: str
    body: str
    status: str
    related_entity: str
    created_at: str


class NotificationCreate(CamelModel):
    channel: str = "log"
    recipient: str
    subject: str = ""
    body: str = ""
    related_entity: str = ""

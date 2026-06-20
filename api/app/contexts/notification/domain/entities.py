"""Notification context domain entity."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Notification:
    id: str
    channel: str  # email | whatsapp | sms | log
    recipient: str
    subject: str
    body: str
    status: str  # Queued | Sent | Failed
    related_entity: str  # e.g. "quote:quote_789" — what triggered it
    created_at: str

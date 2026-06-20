"""Notification repository PORT + the outbound NotificationSender PORT.

The repository persists an audit log of notifications; the sender is the outbound
channel adapter (log today; email/WhatsApp/SMS later). Both are ports — the domain and
application layers never import a concrete channel.
"""
from __future__ import annotations

from abc import ABC, abstractmethod

from app.contexts.notification.domain.entities import Notification
from app.shared.crud import CrudRepository


class NotificationRepository(CrudRepository[Notification]):
    ...


class NotificationSender(ABC):
    """Outbound channel port (infrastructure adapter implements it)."""

    @abstractmethod
    async def send(self, notification: Notification) -> bool: ...

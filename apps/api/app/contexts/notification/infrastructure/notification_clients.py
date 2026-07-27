"""Outbound channel adapters implementing the NotificationSender port.

`LogNotificationSender` is the default no-op channel — it logs and reports success, so the
Quote-approval flow works end to end today. Swap for an email/WhatsApp/SMS adapter later
without touching the domain or application layers (architecture.md §16).
"""
from __future__ import annotations

import logging

from app.contexts.notification.domain.entities import Notification
from app.contexts.notification.domain.repository import NotificationSender

logger = logging.getLogger("notifications")


class LogNotificationSender(NotificationSender):
    async def send(self, notification: Notification) -> bool:
        logger.info(
            "NOTIFY [%s] → %s | %s | %s",
            notification.channel,
            notification.recipient,
            notification.subject,
            notification.related_entity,
        )
        return True

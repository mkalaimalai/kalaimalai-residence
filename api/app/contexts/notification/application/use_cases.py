"""Notification use cases."""
from __future__ import annotations

from datetime import datetime, timezone

from app.contexts.notification.domain.entities import Notification
from app.contexts.notification.domain.repository import (
    NotificationRepository,
    NotificationSender,
)
from app.shared.ids import new_id


class ListNotifications:
    def __init__(self, repo: NotificationRepository) -> None:
        self._repo = repo

    async def __call__(self) -> list[Notification]:
        return await self._repo.list_all()


class SendNotification:
    """Persist an audit record, dispatch through the channel adapter, record the result."""

    def __init__(
        self, repo: NotificationRepository, sender: NotificationSender
    ) -> None:
        self._repo = repo
        self._sender = sender

    async def __call__(
        self,
        *,
        channel: str,
        recipient: str,
        subject: str,
        body: str,
        related_entity: str = "",
    ) -> Notification:
        notification = Notification(
            id=new_id("notif"),
            channel=channel,
            recipient=recipient,
            subject=subject,
            body=body,
            status="Queued",
            related_entity=related_entity,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        ok = await self._sender.send(notification)
        notification.status = "Sent" if ok else "Failed"
        return await self._repo.add(notification)

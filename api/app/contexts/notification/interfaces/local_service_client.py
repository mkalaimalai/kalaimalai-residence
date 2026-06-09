"""In-process NotificationServiceClient adapter (synchronous)."""
from __future__ import annotations

from app.contexts.notification.application.service_client import (
    NotificationServiceClient,
)
from app.contexts.notification.application.use_cases import SendNotification
from app.contexts.notification.domain.repository import (
    NotificationRepository,
    NotificationSender,
)


class LocalNotificationServiceClient(NotificationServiceClient):
    def __init__(
        self, repo: NotificationRepository, sender: NotificationSender
    ) -> None:
        self._send = SendNotification(repo, sender)

    async def notify(
        self,
        *,
        channel: str,
        recipient: str,
        subject: str,
        body: str,
        related_entity: str = "",
    ) -> None:
        await self._send(
            channel=channel,
            recipient=recipient,
            subject=subject,
            body=body,
            related_entity=related_entity,
        )

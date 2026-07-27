"""NotificationServiceClient PORT — how other contexts request a notification.

The commercial context's ApproveQuote use case depends on this (architecture.md §9 step 8:
"Call Notification Service to notify vendor and homeowner"). Synchronous, in-process now.
"""
from __future__ import annotations

from abc import ABC, abstractmethod


class NotificationServiceClient(ABC):
    @abstractmethod
    async def notify(
        self,
        *,
        channel: str,
        recipient: str,
        subject: str,
        body: str,
        related_entity: str = "",
    ) -> None: ...

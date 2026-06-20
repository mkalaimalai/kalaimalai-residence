"""SQLAlchemy adapter for the notification repository port."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.contexts.notification.domain.entities import Notification
from app.contexts.notification.domain.repository import NotificationRepository
from app.contexts.notification.infrastructure.orm import NotificationModel
from app.shared.crud import SqlAlchemyCrudRepository


class SqlAlchemyNotificationRepository(
    SqlAlchemyCrudRepository[Notification], NotificationRepository
):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, NotificationModel, Notification)

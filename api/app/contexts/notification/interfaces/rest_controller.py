"""Notification REST controller — audit log read + manual send (admin)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.contexts.notification.application.use_cases import ListNotifications
from app.contexts.notification.infrastructure.notification_clients import (
    LogNotificationSender,
)
from app.contexts.notification.infrastructure.repository_impl import (
    SqlAlchemyNotificationRepository,
)
from app.contexts.notification.interfaces.local_service_client import (
    LocalNotificationServiceClient,
)
from app.contexts.notification.interfaces.schemas import (
    NotificationCreate,
    NotificationResponse,
)
from app.shared.auth import require_admin, require_user
from app.shared.db import get_session

router = APIRouter(prefix="/notifications", tags=["notification"])


def _repo(session: AsyncSession = Depends(get_session)):
    return SqlAlchemyNotificationRepository(session)


@router.get("", response_model=list[NotificationResponse],
            dependencies=[Depends(require_user)])
async def list_notifications(repo=Depends(_repo)):
    return [NotificationResponse.model_validate(n) for n in await ListNotifications(repo)()]


@router.post("", response_model=NotificationResponse,
             status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def send_notification(body: NotificationCreate, repo=Depends(_repo)):
    client = LocalNotificationServiceClient(repo, LogNotificationSender())
    await client.notify(
        channel=body.channel, recipient=body.recipient, subject=body.subject,
        body=body.body, related_entity=body.related_entity,
    )
    # return the most recent record for this recipient
    items = await ListNotifications(repo)()
    return NotificationResponse.model_validate(items[-1])


routers = [router]

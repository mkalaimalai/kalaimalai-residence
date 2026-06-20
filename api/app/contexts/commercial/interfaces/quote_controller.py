"""Quote / PurchaseOrder / Delivery REST controllers (architecture.md §6).

The approve endpoint composes the synchronous service clients (Vendor + Notification)
the ApproveQuote use case depends on — the §5/§9 Quote-approval → PurchaseOrder flow.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.contexts.commercial.application.quote_use_cases import (
    ApproveQuote,
    ApproveQuoteCommand,
    CompareQuotes,
    NegotiateQuote,
    RejectQuote,
)
from app.contexts.commercial.domain import entities as e
from app.contexts.commercial.infrastructure import orm
from app.contexts.commercial.infrastructure.repository_impl import (
    SqlAlchemyBOQRepository,
    SqlAlchemyDeliveryRepository,
    SqlAlchemyPurchaseOrderRepository,
    SqlAlchemyQuoteLineItemRepository,
    SqlAlchemyQuoteRepository,
)
from app.contexts.commercial.interfaces import schemas as s
from app.contexts.notification.infrastructure.notification_clients import (
    LogNotificationSender,
)
from app.contexts.notification.infrastructure.repository_impl import (
    SqlAlchemyNotificationRepository,
)
from app.contexts.notification.interfaces.local_service_client import (
    LocalNotificationServiceClient,
)
from app.contexts.vendor.infrastructure.repository_impl import (
    SqlAlchemyVendorRepository,
)
from app.contexts.vendor.interfaces.local_service_client import (
    LocalVendorServiceClient,
)
from app.shared.auth import require_admin, require_user
from app.shared.crud import CrudService, make_crud_router
from app.shared.db import get_session
from app.shared.errors import NotFoundError, ValidationError

# --- Quotes ------------------------------------------------------------------------
quotes_router = APIRouter(prefix="/quotes", tags=["commercial"])


def _quotes(session: AsyncSession = Depends(get_session)):
    return SqlAlchemyQuoteRepository(session)


@quotes_router.get(
    "", response_model=list[s.QuoteResponse], dependencies=[Depends(require_user)]
)
async def list_quotes(repo=Depends(_quotes)):
    return [s.QuoteResponse.model_validate(q) for q in await repo.list_all()]


@quotes_router.post(
    "", response_model=s.QuoteResponse, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def submit_quote(body: s.QuoteCreate, repo=Depends(_quotes)):
    service = CrudService(repo, e.Quote, "quote")
    quote = await service.create(body.model_dump(by_alias=False))
    return s.QuoteResponse.model_validate(quote)


@quotes_router.get(
    "/{quote_id}", response_model=s.QuoteResponse, dependencies=[Depends(require_user)]
)
async def get_quote(quote_id: str, repo=Depends(_quotes)):
    quote = await repo.get(quote_id)
    if quote is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"quote {quote_id} not found")
    return s.QuoteResponse.model_validate(quote)


@quotes_router.get(
    "/{quote_id}/line-items", response_model=list[s.QuoteLineItemResponse],
    dependencies=[Depends(require_user)],
)
async def quote_line_items(
    quote_id: str, session: AsyncSession = Depends(get_session)
):
    repo = SqlAlchemyQuoteLineItemRepository(session)
    rows = [li for li in await repo.list_all() if li.quote_id == quote_id]
    return [s.QuoteLineItemResponse.model_validate(li) for li in rows]


@quotes_router.post(
    "/{quote_id}/approve", response_model=s.QuoteApprovalResponse,
    dependencies=[Depends(require_admin)],
)
async def approve_quote(
    quote_id: str,
    body: s.ApproveQuoteRequest,
    session: AsyncSession = Depends(get_session),
):
    use_case = ApproveQuote(
        quotes=SqlAlchemyQuoteRepository(session),
        boqs=SqlAlchemyBOQRepository(session),
        purchase_orders=SqlAlchemyPurchaseOrderRepository(session),
        vendors=LocalVendorServiceClient(SqlAlchemyVendorRepository(session)),
        notifications=LocalNotificationServiceClient(
            SqlAlchemyNotificationRepository(session), LogNotificationSender()
        ),
    )
    try:
        result = await use_case(
            quote_id,
            ApproveQuoteCommand(
                approved_by=body.approved_by,
                approved_amount=body.approved_amount,
                approval_note=body.approval_note,
            ),
        )
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc
    return s.QuoteApprovalResponse(
        quote=s.QuoteResponse.model_validate(result.quote),
        purchase_order=s.PurchaseOrderResponse.model_validate(result.purchase_order),
    )


@quotes_router.post(
    "/{quote_id}/reject", response_model=s.QuoteResponse,
    dependencies=[Depends(require_admin)],
)
async def reject_quote(quote_id: str, body: s.QuoteActionNote, repo=Depends(_quotes)):
    try:
        quote = await RejectQuote(repo)(quote_id, body.note)
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return s.QuoteResponse.model_validate(quote)


@quotes_router.post(
    "/{quote_id}/negotiate", response_model=s.QuoteResponse,
    dependencies=[Depends(require_admin)],
)
async def negotiate_quote(quote_id: str, body: s.QuoteActionNote, repo=Depends(_quotes)):
    try:
        quote = await NegotiateQuote(repo)(quote_id, body.note)
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return s.QuoteResponse.model_validate(quote)


quote_line_items_router = make_crud_router(
    prefix="/quote-line-items", tags=["commercial"], orm_cls=orm.QuoteLineItemModel,
    entity_cls=e.QuoteLineItem, response_model=s.QuoteLineItemResponse,
    create_model=s.QuoteLineItemCreate, update_model=s.QuoteLineItemCreate,
    id_prefix="qli", public_read=False,
)

# --- Purchase orders ---------------------------------------------------------------
po_router = APIRouter(prefix="/purchase-orders", tags=["commercial"])


def _pos(session: AsyncSession = Depends(get_session)):
    return SqlAlchemyPurchaseOrderRepository(session)


@po_router.get(
    "", response_model=list[s.PurchaseOrderResponse],
    dependencies=[Depends(require_user)],
)
async def list_purchase_orders(repo=Depends(_pos)):
    return [s.PurchaseOrderResponse.model_validate(p) for p in await repo.list_all()]


@po_router.post(
    "", response_model=s.PurchaseOrderResponse, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def create_purchase_order(body: s.PurchaseOrderCreate, repo=Depends(_pos)):
    from datetime import date

    service = CrudService(repo, e.PurchaseOrder, "po")
    fields = body.model_dump(by_alias=False)
    fields["created_at"] = date.today().isoformat()
    po = await service.create(fields)
    return s.PurchaseOrderResponse.model_validate(po)


@po_router.get(
    "/{po_id}", response_model=s.PurchaseOrderResponse,
    dependencies=[Depends(require_user)],
)
async def get_purchase_order(po_id: str, repo=Depends(_pos)):
    po = await repo.get(po_id)
    if po is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"PO {po_id} not found")
    return s.PurchaseOrderResponse.model_validate(po)


@po_router.patch(
    "/{po_id}/status", response_model=s.PurchaseOrderResponse,
    dependencies=[Depends(require_admin)],
)
async def set_purchase_order_status(
    po_id: str, body: s.PurchaseOrderStatus, repo=Depends(_pos)
):
    po = await repo.update(po_id, {"status": body.status})
    if po is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"PO {po_id} not found")
    return s.PurchaseOrderResponse.model_validate(po)


# --- Deliveries --------------------------------------------------------------------
deliveries_router = make_crud_router(
    prefix="/deliveries", tags=["commercial"], orm_cls=orm.DeliveryModel,
    entity_cls=e.Delivery, response_model=s.DeliveryResponse,
    create_model=s.DeliveryCreate, update_model=s.DeliveryCreate,
    id_prefix="delivery", public_read=False,
)

routers = [
    quotes_router,
    quote_line_items_router,
    po_router,
    deliveries_router,
]

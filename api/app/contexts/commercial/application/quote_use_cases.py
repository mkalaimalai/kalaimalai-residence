"""Quote use cases — including the ApproveQuote → PurchaseOrder flow (architecture.md §9).

Cross-context calls are synchronous through ports: VendorServiceClient (confirm vendor)
and NotificationServiceClient (notify). BOQ confirmation and PO creation are in-context
(BOQ, Quote, Procurement/PO all belong to the Commercial context per §13).
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from app.contexts.commercial.domain.entities import PurchaseOrder, Quote
from app.contexts.commercial.domain.repository import (
    BOQRepository,
    PurchaseOrderRepository,
    QuoteRepository,
)
from app.contexts.notification.application.service_client import (
    NotificationServiceClient,
)
from app.contexts.vendor.application.service_client import VendorServiceClient
from app.shared.errors import NotFoundError, ValidationError
from app.shared.ids import new_id


@dataclass
class ApproveQuoteCommand:
    approved_by: str = ""
    approved_amount: float | None = None
    approval_note: str = ""


@dataclass
class ApprovalResult:
    quote: Quote
    purchase_order: PurchaseOrder


class ApproveQuote:
    def __init__(
        self,
        quotes: QuoteRepository,
        boqs: BOQRepository,
        purchase_orders: PurchaseOrderRepository,
        vendors: VendorServiceClient,
        notifications: NotificationServiceClient,
    ) -> None:
        self._quotes = quotes
        self._boqs = boqs
        self._pos = purchase_orders
        self._vendors = vendors
        self._notifications = notifications

    async def __call__(
        self, quote_id: str, cmd: ApproveQuoteCommand
    ) -> ApprovalResult:
        # 1. Load quote
        quote = await self._quotes.get(quote_id)
        if quote is None:
            raise NotFoundError(f"quote {quote_id} not found")

        # 2. Validate not expired
        if quote.is_expired(date.today().isoformat()):
            raise ValidationError(f"quote {quote_id} has expired")

        # 3. Confirm vendor (synchronous, via Vendor service-client port)
        if not await self._vendors.exists(quote.vendor_id):
            raise ValidationError(f"vendor '{quote.vendor_id}' does not exist")

        # 4. Confirm BOQ package is active (in-context)
        if quote.boq_id and not await self._boqs.exists(quote.boq_id):
            raise ValidationError(f"BOQ package '{quote.boq_id}' is not active")

        # 5–6. Approve + persist
        amount = cmd.approved_amount if cmd.approved_amount is not None else quote.total_amount
        await self._quotes.update(
            quote_id,
            {
                "comparison_status": "Accepted",
                "approved_amount": amount,
                "approved_by": cmd.approved_by,
                "approval_note": cmd.approval_note,
            },
        )
        quote = await self._quotes.get(quote_id)
        assert quote is not None

        # 7. Create purchase order (in-context, Procurement)
        po = await self._pos.add(
            PurchaseOrder(
                id=new_id("po"),
                project_id=quote.project_id,
                quote_id=quote.id,
                vendor_id=quote.vendor_id,
                amount=amount,
                currency=quote.currency,
                status="Created",
                created_at=date.today().isoformat(),
                notes=f"Auto-created on approval of quote {quote.id}",
            )
        )

        # 8. Notify vendor + homeowner (synchronous, via Notification service-client port)
        await self._notifications.notify(
            channel="log",
            recipient=f"vendor:{quote.vendor_id}",
            subject="Quote approved — purchase order issued",
            body=f"Quote {quote.id} approved at {amount} {quote.currency}; PO {po.id}.",
            related_entity=f"quote:{quote.id}",
        )
        await self._notifications.notify(
            channel="log",
            recipient="homeowner",
            subject="Quote approved",
            body=f"PO {po.id} created for vendor {quote.vendor_id}.",
            related_entity=f"quote:{quote.id}",
        )

        return ApprovalResult(quote=quote, purchase_order=po)


class RejectQuote:
    def __init__(self, quotes: QuoteRepository) -> None:
        self._quotes = quotes

    async def __call__(self, quote_id: str, note: str = "") -> Quote:
        updated = await self._quotes.update(
            quote_id, {"comparison_status": "Rejected", "approval_note": note}
        )
        if updated is None:
            raise NotFoundError(f"quote {quote_id} not found")
        return updated


class NegotiateQuote:
    def __init__(self, quotes: QuoteRepository) -> None:
        self._quotes = quotes

    async def __call__(self, quote_id: str, note: str = "") -> Quote:
        updated = await self._quotes.update(
            quote_id, {"comparison_status": "Negotiated", "approval_note": note}
        )
        if updated is None:
            raise NotFoundError(f"quote {quote_id} not found")
        return updated


class CompareQuotes:
    """List a project's quotes, cheapest first — the comparison view."""

    def __init__(self, quotes: QuoteRepository) -> None:
        self._quotes = quotes

    async def __call__(self, project_id: str) -> list[Quote]:
        rows = [q for q in await self._quotes.list_all() if q.project_id == project_id]
        return sorted(rows, key=lambda q: q.total_amount)

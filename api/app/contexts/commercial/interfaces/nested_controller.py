"""§6 endpoint-shape conformance for the commercial context.

- BOQ Service shape: /boq-packages (+ {id} + /line-items), treating each BOQ record as a
  package and BOQ line items as its children (linked by boq_id).
- Project-nested reads: /projects/{id}/quotes (comparison), /purchase-orders, /deliveries.

Single-project semantics: nested collections return the full set (quotes/POs/deliveries
filter by project_id, which they carry).
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.contexts.commercial.application.quote_use_cases import CompareQuotes
from app.contexts.commercial.domain import entities as e
from app.contexts.commercial.infrastructure.repository_impl import (
    SqlAlchemyBOQLineItemRepository,
    SqlAlchemyBOQRepository,
    SqlAlchemyDeliveryRepository,
    SqlAlchemyPurchaseOrderRepository,
    SqlAlchemyQuoteRepository,
)
from app.contexts.commercial.interfaces import schemas as s
from app.shared.auth import require_admin, require_user
from app.shared.crud import CrudService
from app.shared.db import get_session

# --- BOQ packages ------------------------------------------------------------------
boq_packages_router = APIRouter(prefix="/boq-packages", tags=["commercial"])


def _boqs(session: AsyncSession = Depends(get_session)):
    return SqlAlchemyBOQRepository(session)


@boq_packages_router.get(
    "", response_model=list[s.BOQResponse], dependencies=[Depends(require_user)]
)
async def list_boq_packages(repo=Depends(_boqs)):
    return [s.BOQResponse.model_validate(b) for b in await repo.list_all()]


@boq_packages_router.post(
    "", response_model=s.BOQResponse, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def create_boq_package(body: s.BOQCreate, repo=Depends(_boqs)):
    pkg = await CrudService(repo, e.BOQ, "boq").create(body.model_dump(by_alias=False))
    return s.BOQResponse.model_validate(pkg)


@boq_packages_router.get(
    "/{boq_id}", response_model=s.BOQResponse, dependencies=[Depends(require_user)]
)
async def get_boq_package(boq_id: str, repo=Depends(_boqs)):
    pkg = await repo.get(boq_id)
    if pkg is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"BOQ {boq_id} not found")
    return s.BOQResponse.model_validate(pkg)


@boq_packages_router.get(
    "/{boq_id}/line-items", response_model=list[s.BOQLineItemResponse],
    dependencies=[Depends(require_user)],
)
async def list_boq_line_items(
    boq_id: str, session: AsyncSession = Depends(get_session)
):
    repo = SqlAlchemyBOQLineItemRepository(session)
    rows = [li for li in await repo.list_all() if li.boq_id == boq_id]
    return [s.BOQLineItemResponse.model_validate(li) for li in rows]


@boq_packages_router.post(
    "/{boq_id}/line-items", response_model=s.BOQLineItemResponse,
    status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)],
)
async def add_boq_line_item(
    boq_id: str, body: s.BOQLineItemCreate, session: AsyncSession = Depends(get_session)
):
    repo = SqlAlchemyBOQLineItemRepository(session)
    fields = body.model_dump(by_alias=False)
    fields["boq_id"] = boq_id
    li = await CrudService(repo, e.BOQLineItem, "bli").create(fields)
    return s.BOQLineItemResponse.model_validate(li)


# --- Project-nested commercial reads ------------------------------------------------
project_nested_router = APIRouter(prefix="/projects", tags=["commercial"])


@project_nested_router.get(
    "/{project_id}/quotes", response_model=list[s.QuoteResponse],
    dependencies=[Depends(require_user)],
)
async def project_quotes(
    project_id: str, session: AsyncSession = Depends(get_session)
):
    rows = await CompareQuotes(SqlAlchemyQuoteRepository(session))(project_id)
    return [s.QuoteResponse.model_validate(q) for q in rows]


@project_nested_router.get(
    "/{project_id}/purchase-orders", response_model=list[s.PurchaseOrderResponse],
    dependencies=[Depends(require_user)],
)
async def project_purchase_orders(
    project_id: str, session: AsyncSession = Depends(get_session)
):
    repo = SqlAlchemyPurchaseOrderRepository(session)
    rows = [p for p in await repo.list_all() if p.project_id == project_id]
    return [s.PurchaseOrderResponse.model_validate(p) for p in rows]


@project_nested_router.get(
    "/{project_id}/deliveries", response_model=list[s.DeliveryResponse],
    dependencies=[Depends(require_user)],
)
async def project_deliveries(
    project_id: str, session: AsyncSession = Depends(get_session)
):
    repo = SqlAlchemyDeliveryRepository(session)
    rows = [d for d in await repo.list_all() if d.project_id == project_id]
    return [s.DeliveryResponse.model_validate(d) for d in rows]


routers = [boq_packages_router, project_nested_router]

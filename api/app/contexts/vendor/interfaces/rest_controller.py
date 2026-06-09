"""Vendor REST controller — the inbound adapter (HTTP → use cases)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.contexts.vendor.application.commands import (
    CreateVendorCommand,
    UpdateVendorCommand,
)
from app.contexts.vendor.application.use_cases import (
    CreateVendor,
    GetVendor,
    ListVendors,
    UpdateVendor,
)
from app.contexts.vendor.infrastructure.repository_impl import (
    SqlAlchemyVendorRepository,
)
from app.contexts.vendor.interfaces.schemas import (
    VendorCreate,
    VendorRatings,
    VendorResponse,
    VendorUpdate,
    VerificationStatusRequest,
)
from app.shared.auth import require_admin
from app.shared.db import get_session
from app.shared.errors import NotFoundError

router = APIRouter(prefix="/vendors", tags=["vendor"])


def _repo(session: AsyncSession = Depends(get_session)) -> SqlAlchemyVendorRepository:
    return SqlAlchemyVendorRepository(session)


@router.get("", response_model=list[VendorResponse])
async def list_vendors(repo: SqlAlchemyVendorRepository = Depends(_repo)):
    vendors = await ListVendors(repo)()
    return [VendorResponse.from_entity(v) for v in vendors]


@router.get("/{vendor_id}", response_model=VendorResponse)
async def get_vendor(
    vendor_id: str, repo: SqlAlchemyVendorRepository = Depends(_repo)
):
    try:
        vendor = await GetVendor(repo)(vendor_id)
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return VendorResponse.from_entity(vendor)


@router.post(
    "", response_model=VendorResponse, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def create_vendor(
    body: VendorCreate, repo: SqlAlchemyVendorRepository = Depends(_repo)
):
    vendor = await CreateVendor(repo)(CreateVendorCommand(**body.model_dump()))
    return VendorResponse.from_entity(vendor)


@router.patch(
    "/{vendor_id}", response_model=VendorResponse,
    dependencies=[Depends(require_admin)],
)
async def update_vendor(
    vendor_id: str,
    body: VendorUpdate,
    repo: SqlAlchemyVendorRepository = Depends(_repo),
):
    changes = body.model_dump(exclude_unset=True)
    try:
        vendor = await UpdateVendor(repo)(vendor_id, UpdateVendorCommand(changes))
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return VendorResponse.from_entity(vendor)


@router.get("/{vendor_id}/ratings", response_model=VendorRatings)
async def vendor_ratings(
    vendor_id: str, repo: SqlAlchemyVendorRepository = Depends(_repo)
):
    try:
        vendor = await GetVendor(repo)(vendor_id)
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return VendorRatings(vendor_id=vendor.id, rating_value=vendor.rating)


@router.patch(
    "/{vendor_id}/verification-status", response_model=VendorResponse,
    dependencies=[Depends(require_admin)],
)
async def set_verification_status(
    vendor_id: str,
    body: VerificationStatusRequest,
    repo: SqlAlchemyVendorRepository = Depends(_repo),
):
    # types/index.ts Vendor exposes `finalized`; map Verified/Preferred → finalized.
    finalized = body.status in {"Verified", "Preferred"}
    try:
        vendor = await UpdateVendor(repo)(
            vendor_id, UpdateVendorCommand({"finalized": finalized})
        )
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return VendorResponse.from_entity(vendor)

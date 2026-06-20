"""Synchronous cross-context referential validation for commercial writes.

This is the canonical exercise of the service-client pattern from architecture.md §4–5:
the commercial context never reads vendor/project tables — it consults them through the
VendorServiceClient and ProjectServiceClient PORTS. A dangling reference raises
ValidationError, surfaced as HTTP 422 (preserves constitution rule 2 — relations by id,
never severed).
"""
from __future__ import annotations

from app.contexts.project.application.service_client import ProjectServiceClient
from app.contexts.vendor.application.service_client import VendorServiceClient
from app.shared.errors import ValidationError


def make_ref_validator(
    vendors: VendorServiceClient,
    project: ProjectServiceClient,
):
    async def validate(fields: dict) -> None:
        vendor_id = fields.get("vendor_id")
        if vendor_id is not None and not await vendors.exists(vendor_id):
            raise ValidationError(f"vendor '{vendor_id}' does not exist")

        space_id = fields.get("space_id")
        if space_id is not None and not await project.space_exists(space_id):
            raise ValidationError(f"space '{space_id}' does not exist")

        for sid in fields.get("space_ids", []) or []:
            if not await project.space_exists(sid):
                raise ValidationError(f"space '{sid}' does not exist")

    return validate

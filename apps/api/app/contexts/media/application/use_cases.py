"""Media context use cases — CRUD plus owner-reference validation.

`CrudService` covers the generic paths; media adds two things it cannot express:
a delete (media is the one collection that genuinely needs one) and a reference check
that a `domainId`/`spaceId` owner is not merely *present* but belongs to the **same
project** as the set — otherwise a set would straddle the tenant boundary.
"""
from __future__ import annotations

from app.contexts.media.application.service_client import ProjectRefsClient
from app.contexts.media.domain import entities as e
from app.contexts.media.domain.repository import MediaSetRepository
from app.shared.crud import CrudService
from app.shared.errors import NotFoundError, ValidationError


class MediaSetService(CrudService[e.MediaSet]):
    def __init__(self, repo: MediaSetRepository, refs: ProjectRefsClient) -> None:
        super().__init__(repo, e.MediaSet, "ms")
        self._media = repo
        self._refs = refs

    async def list_filtered(
        self,
        project_id: str | None = None,
        kind: str | None = None,
        domain_id: str | None = None,
        space_id: str | None = None,
    ) -> list[e.MediaSet]:
        return await self._media.list_filtered(project_id, kind, domain_id, space_id)

    async def create(self, fields: dict) -> e.MediaSet:
        fields = _normalize(dict(fields))
        project_id = fields.get("project_id") or ""
        if not project_id:
            raise ValidationError("projectId is required")
        if not await self._refs.project_exists(project_id):
            raise ValidationError(f"project {project_id} not found")
        await self._check_owners(project_id, fields)
        return await super().create(fields)

    async def update(self, entity_id: str, changes: dict) -> e.MediaSet:
        existing = await self.get(entity_id)
        changes = _normalize(dict(changes))
        await self._check_owners(existing.project_id, changes)
        return await super().update(entity_id, changes)

    async def delete(self, entity_id: str) -> None:
        if not await self._media.delete(entity_id):
            raise NotFoundError(f"ms {entity_id} not found")

    async def _check_owners(self, project_id: str, fields: dict) -> None:
        if "kind" in fields and fields["kind"] not in e.KINDS:
            raise ValidationError(f"kind must be one of {', '.join(e.KINDS)}")
        for field_name, owner in (
            ("domain_id", self._refs.domain_project),
            ("space_id", self._refs.space_project),
        ):
            owner_id = fields.get(field_name)
            if not owner_id:
                continue
            actual = await owner(owner_id)
            label = field_name.replace("_id", "Id")
            if actual is None:
                raise ValidationError(f"{label} {owner_id} not found")
            if actual != project_id:
                raise ValidationError(
                    f"{label} {owner_id} belongs to project {actual}, not {project_id}"
                )


def _normalize(fields: dict) -> dict:
    """Treat a cleared owner select ("") as "no owner" rather than a dangling id."""
    for field_name in ("domain_id", "space_id"):
        if fields.get(field_name) == "":
            fields[field_name] = None
    return fields

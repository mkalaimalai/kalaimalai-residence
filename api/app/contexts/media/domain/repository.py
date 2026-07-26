"""Repository PORT for the media context."""
from __future__ import annotations

from app.contexts.media.domain.entities import MediaSet
from app.shared.crud import CrudRepository


class MediaSetRepository(CrudRepository[MediaSet]):
    async def list_filtered(
        self,
        project_id: str | None = None,
        kind: str | None = None,
        domain_id: str | None = None,
        space_id: str | None = None,
    ) -> list[MediaSet]: ...

    async def delete(self, entity_id: str) -> bool: ...

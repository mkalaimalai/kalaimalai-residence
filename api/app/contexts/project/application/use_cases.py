"""Project context use cases.

Most entities use the generic CrudService. Spaces and Domains add slug derivation;
Project create/get is bespoke because of the public/full response split.
"""
from __future__ import annotations

from app.shared.crud import CrudRepository, CrudService
from app.shared.errors import NotFoundError
from app.shared.ids import slugify


class SluggedCrudService(CrudService):
    """Derives `slug` from `name` on create when not supplied (spaces, domains)."""

    async def create(self, fields: dict):
        fields = dict(fields)
        if not fields.get("slug"):
            fields["slug"] = slugify(fields.get("name", ""))
        return await super().create(fields)


class GetSingletonProject:
    """The residence is one project; expose the first row."""

    def __init__(self, repo: CrudRepository) -> None:
        self._repo = repo

    async def __call__(self):
        projects = await self._repo.list_all()
        if not projects:
            raise NotFoundError("no project configured")
        return projects[0]

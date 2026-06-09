"""Repository PORTS for the quality context."""
from __future__ import annotations

from app.contexts.quality.domain.entities import Decision, Snag
from app.shared.crud import CrudRepository


class SnagRepository(CrudRepository[Snag]):
    ...


class DecisionRepository(CrudRepository[Decision]):
    ...

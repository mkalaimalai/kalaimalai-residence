"""Domain-level errors, translated to HTTP status codes at the interface boundary."""
from __future__ import annotations


class DomainError(Exception):
    """Base for expected, client-facing domain failures."""


class NotFoundError(DomainError):
    """An entity referenced by id does not exist."""


class ValidationError(DomainError):
    """A write violated an invariant or a cross-context reference (→ HTTP 422)."""


class ConflictError(DomainError):
    """A uniqueness constraint (e.g. slug) was violated (→ HTTP 409)."""

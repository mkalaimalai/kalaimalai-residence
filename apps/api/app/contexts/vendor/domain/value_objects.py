"""Vendor value objects — pure, no framework imports."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Rating:
    """A 0–5 vendor rating."""

    value: float

    def __post_init__(self) -> None:
        if not 0 <= self.value <= 5:
            raise ValueError("rating must be between 0 and 5")

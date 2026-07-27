"""Pydantic base that serialises snake_case fields as camelCase JSON.

This is what keeps the frontend `types/index.ts` contract untouched: persistence and
Python stay snake_case, the wire is camelCase, and requests may use either spelling.
"""
from __future__ import annotations

from pydantic import BaseModel, ConfigDict


def to_camel(snake: str) -> str:
    head, *tail = snake.split("_")
    return head + "".join(part.capitalize() for part in tail)


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

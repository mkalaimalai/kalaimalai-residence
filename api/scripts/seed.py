"""Load api/scripts/seed.json (camelCase, exported from data/*.ts) into Postgres.

Idempotent: upserts on primary key, so re-running is safe. Maps camelCase JSON keys to
snake_case ORM columns and silently drops keys the table doesn't have.

Usage (from api/):  python -m scripts.seed
Requires DATABASE_URL to point at the target database.
"""
from __future__ import annotations

import asyncio
import json
import re
from pathlib import Path

from sqlalchemy import delete
from sqlalchemy.dialects.postgresql import insert

import app.models  # noqa: F401  register all tables
from app.contexts.commercial.infrastructure.orm import (
    BOQModel,
    MaterialModel,
    ProcurementModel,
)
from app.contexts.document.infrastructure.orm import (
    DrawingModel,
    GalleryModel,
    LessonModel,
)
from app.contexts.handover.infrastructure.orm import WarrantyModel
from app.contexts.project.infrastructure.orm import (
    DomainModel,
    ProgressModel,
    ProjectModel,
    SpaceModel,
)
from app.contexts.quality.infrastructure.orm import DecisionModel, SnagModel
from app.contexts.vendor.infrastructure.orm import VendorModel
from app.shared.db import SessionFactory

SEED_PATH = Path(__file__).parent / "seed.json"

# JSON collection name -> ORM model. "project" is a single object, handled separately.
COLLECTIONS = {
    "spaces": SpaceModel,
    "domains": DomainModel,
    "progress": ProgressModel,
    "drawings": DrawingModel,
    "gallery": GalleryModel,
    "lessons": LessonModel,
    "vendors": VendorModel,
    "boqs": BOQModel,
    "procurement": ProcurementModel,
    "materials": MaterialModel,
    "decisions": DecisionModel,
    "snags": SnagModel,
    "warranties": WarrantyModel,
}


def camel_to_snake(name: str) -> str:
    return re.sub(r"(?<!^)(?=[A-Z])", "_", name).lower()


def to_columns(record: dict, model) -> dict:
    cols = set(model.__table__.columns.keys())
    return {
        camel_to_snake(k): v
        for k, v in record.items()
        if camel_to_snake(k) in cols
    }


async def _upsert(session, model, rows: list[dict]) -> int:
    if not rows:
        return 0
    payload = [to_columns(r, model) for r in rows]
    stmt = insert(model).values(payload)
    update_cols = {
        c.name: stmt.excluded[c.name]
        for c in model.__table__.columns
        if c.name != "id"
    }
    stmt = stmt.on_conflict_do_update(index_elements=["id"], set_=update_cols)
    await session.execute(stmt)
    return len(payload)


async def main() -> None:
    data = json.loads(SEED_PATH.read_text())
    async with SessionFactory() as session:
        total = 0
        for name, model in COLLECTIONS.items():
            n = await _upsert(session, model, data.get(name, []))
            total += n
            print(f"  {name:12} {n}")

        project = data.get("project")
        if project:
            await _upsert(session, ProjectModel, [project])
            print(f"  {'project':12} 1")
            total += 1

        await session.commit()
        print(f"Seeded {total} rows.")


if __name__ == "__main__":
    asyncio.run(main())

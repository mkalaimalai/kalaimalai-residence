"""Server-side data-integrity check against Postgres (mirror of scripts/verify-data.ts).

Proves the seeded database is sound:
  1. Non-zero / expected counts for every entity.
  2. Referential integrity — every *_id(s) reference resolves to a real row.
  3. A fully resolved sample relation chain (master bedroom → vendors/drawings/decisions).

Exits non-zero on any failure, so it doubles as a CI gate before wiring the frontend.

Usage (from api/):  python -m scripts.verify
"""
from __future__ import annotations

import asyncio
import sys

from sqlalchemy import select

import app.models  # noqa: F401
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

EXPECTED = {
    "spaces": 16, "domains": 14, "vendors": 8, "procurement": 6, "drawings": 6,
    "gallery": 8, "materials": 5, "project": 1, "decisions": 3, "snags": 3,
    "progress": 3, "boqs": 3, "warranties": 3, "lessons": 3,
}

failures: list[str] = []


def fail(msg: str) -> None:
    failures.append(msg)
    print(f"  ✗ {msg}")


async def _all(session, model) -> list[dict]:
    rows = (await session.execute(select(model))).scalars().all()
    return [
        {c.name: getattr(r, c.name) for c in model.__table__.columns} for r in rows
    ]


async def main() -> None:
    async with SessionFactory() as session:
        spaces = await _all(session, SpaceModel)
        domains = await _all(session, DomainModel)
        vendors = await _all(session, VendorModel)
        drawings = await _all(session, DrawingModel)
        decisions = await _all(session, DecisionModel)
        materials = await _all(session, MaterialModel)
        lessons = await _all(session, LessonModel)
        procurement = await _all(session, ProcurementModel)
        snags = await _all(session, SnagModel)
        progress = await _all(session, ProgressModel)
        boqs = await _all(session, BOQModel)
        warranties = await _all(session, WarrantyModel)
        gallery = await _all(session, GalleryModel)
        project = await _all(session, ProjectModel)

    counts = {
        "spaces": len(spaces), "domains": len(domains), "vendors": len(vendors),
        "procurement": len(procurement), "drawings": len(drawings),
        "gallery": len(gallery), "materials": len(materials), "project": len(project),
        "decisions": len(decisions), "snags": len(snags), "progress": len(progress),
        "boqs": len(boqs), "warranties": len(warranties), "lessons": len(lessons),
    }

    print("Counts:")
    for name, expected in EXPECTED.items():
        got = counts[name]
        ok = "✓" if got == expected else "✗"
        print(f"  {ok} {name:12} {got} (expected {expected})")
        if got != expected:
            fail(f"{name}: expected {expected}, got {got}")

    def ids(rows: list[dict]) -> set[str]:
        return {r["id"] for r in rows}

    space_ids, domain_ids = ids(spaces), ids(domains)
    vendor_ids, drawing_ids = ids(vendors), ids(drawings)
    decision_ids, lesson_ids = ids(decisions), ids(lessons)
    material_ids = ids(materials)

    def check_one(label: str, value: str, pool: set[str]) -> None:
        if value and value not in pool:
            fail(f"{label} -> '{value}' not found")

    def check_many(label: str, values, pool: set[str]) -> None:
        for v in values or []:
            if v and v not in pool:
                fail(f"{label} -> '{v}' not found")

    print("Referential integrity:")
    for s in spaces:
        check_many(f"space {s['id']}.domainIds", s["domain_ids"], domain_ids)
        check_many(f"space {s['id']}.materialIds", s["material_ids"], material_ids)
        check_many(f"space {s['id']}.vendorIds", s["vendor_ids"], vendor_ids)
        check_many(f"space {s['id']}.drawingIds", s["drawing_ids"], drawing_ids)
        check_many(f"space {s['id']}.decisionIds", s["decision_ids"], decision_ids)
        check_many(f"space {s['id']}.lessonIds", s["lesson_ids"], lesson_ids)
    for d in domains:
        check_many(f"domain {d['id']}.spaceIds", d["space_ids"], space_ids)
        check_many(f"domain {d['id']}.drawingIds", d["drawing_ids"], drawing_ids)
        check_many(f"domain {d['id']}.vendorIds", d["vendor_ids"], vendor_ids)
        check_many(f"domain {d['id']}.lessonIds", d["lesson_ids"], lesson_ids)
    for dr in drawings:
        check_one(f"drawing {dr['id']}.domainId", dr["domain_id"], domain_ids)
        check_one(f"drawing {dr['id']}.spaceId", dr["space_id"], space_ids)
    for p in procurement:
        check_one(f"procurement {p['id']}.spaceId", p["space_id"], space_ids)
        check_one(f"procurement {p['id']}.vendorId", p["vendor_id"], vendor_ids)
    for dec in decisions:
        check_one(f"decision {dec['id']}.domainId", dec["domain_id"], domain_ids)
        check_one(f"decision {dec['id']}.spaceId", dec["space_id"], space_ids)
    for sn in snags:
        check_one(f"snag {sn['id']}.spaceId", sn["space_id"], space_ids)
    for b in boqs:
        check_one(f"boq {b['id']}.vendorId", b["vendor_id"], vendor_ids)
    for m in materials:
        check_many(f"material {m['id']}.spaceIds", m["space_ids"], space_ids)
        check_one(f"material {m['id']}.vendorId", m["vendor_id"], vendor_ids)
    for ln in lessons:
        check_one(f"lesson {ln['id']}.domainId", ln["domain_id"], domain_ids)
        check_one(f"lesson {ln['id']}.spaceId", ln["space_id"], space_ids)
    for pr in progress:
        check_one(f"progress {pr['id']}.spaceId", pr["space_id"], space_ids)
    for w in warranties:
        check_one(f"warranty {w['id']}.vendorId", w["vendor_id"], vendor_ids)
    for g in gallery:
        check_one(f"gallery {g['id']}.spaceId", g["space_id"], space_ids)
        check_one(f"gallery {g['id']}.domainId", g["domain_id"], domain_ids)

    # Sample relation chain
    master = next((s for s in spaces if "master" in s["slug"]), None)
    if master is None:
        fail("no master-bedroom-like space found for chain check")
    else:
        resolved_v = [v for v in vendors if v["id"] in master["vendor_ids"]]
        resolved_d = [d for d in drawings if d["id"] in master["drawing_ids"]]
        print(
            f"Chain: {master['name']} -> "
            f"{len(resolved_v)} vendors, {len(resolved_d)} drawings"
        )

    if failures:
        print(f"\nFAILED: {len(failures)} problem(s).")
        sys.exit(1)
    print("\nAll checks passed.")


if __name__ == "__main__":
    asyncio.run(main())

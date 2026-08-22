"""Check every entity reference in a live database.

`npm run verify` checks the seed. Nothing checked production, which is where references
actually rot: a vendor deleted through the admin app used to leave every quote, material
and warranty that mentioned it pointing at an id that no longer resolves.

Two kinds of edge, checked differently:

- Scalar columns now have foreign keys (migration c4d8b17f0a92), so Postgres enforces
  them. This script still checks them, because a constraint that was never applied to a
  particular database looks exactly like a database with no violations.
- Array columns (`spaces.vendor_ids`, `domains.drawing_ids`, …) cannot have foreign
  keys — Postgres has no per-element constraint — so this script is the only thing
  standing between them and silent rot.

Usage (from apps/api, with the environment loaded):

    ./.venv/bin/python -m scripts.verify_graph

Exits non-zero on the first dangling reference, so it works as a CI gate.
"""

from __future__ import annotations

import asyncio
import os
import re
import sys

import asyncpg

from app.shared.relations import ARRAY_EDGES, EDGES


def _dsn() -> str:
    url = os.environ.get("DATABASE_URL")
    if not url:
        sys.exit("DATABASE_URL is not set")
    # asyncpg takes a plain postgresql:// DSN, not SQLAlchemy's +asyncpg dialect form,
    # and rejects the query string the app passes through.
    return re.sub(r"\?.*$", "", url).replace("postgresql+asyncpg://", "postgresql://")


async def _missing_tables(conn: asyncpg.Connection, names: set[str]) -> set[str]:
    rows = await conn.fetch(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    )
    return names - {r["table_name"] for r in rows}


async def main() -> int:
    conn = await asyncpg.connect(_dsn(), statement_cache_size=0)
    try:
        referenced = {t for t, _, _, _ in EDGES} | {t for _, _, t in ARRAY_EDGES}
        referenced |= {t for _, _, t, _ in EDGES} | {t for t, _, _ in ARRAY_EDGES}
        absent = await _missing_tables(conn, referenced)
        if absent:
            print(f"tables declared in relations.py but not in this database: {absent}")
            return 1

        failures: list[str] = []

        print("scalar edges (foreign keys)")
        for table, column, target, _ondelete in EDGES:
            dangling = await conn.fetchval(
                f"SELECT count(*) FROM {table} s WHERE s.{column} IS NOT NULL "
                f"AND NOT EXISTS (SELECT 1 FROM {target} t WHERE t.id = s.{column})"
            )
            enforced = await conn.fetchval(
                "SELECT count(*) FROM pg_constraint WHERE conname = $1",
                f"fk_{table}_{column}",
            )
            mark = "ok " if not dangling else "FAIL"
            note = "" if enforced else "   (no constraint — migration not applied here)"
            print(f"  {mark} {table}.{column} -> {target}{note}")
            if dangling:
                failures.append(f"{table}.{column}: {dangling} dangling")
            if not enforced:
                failures.append(f"{table}.{column}: foreign key missing")

        print("\narray edges (checked here; Postgres cannot constrain them)")
        for table, column, target in ARRAY_EDGES:
            dangling = await conn.fetchval(
                f"SELECT count(*) FROM ("
                f"  SELECT unnest({column}) AS ref FROM {table}"
                f") x WHERE x.ref IS NOT NULL AND x.ref <> '' "
                f"AND NOT EXISTS (SELECT 1 FROM {target} t WHERE t.id = x.ref)"
            )
            print(f"  {'ok ' if not dangling else 'FAIL'} {table}.{column} -> {target}")
            if dangling:
                failures.append(f"{table}.{column}: {dangling} dangling")

        if failures:
            print(f"\n{len(failures)} problem(s):")
            for f in failures:
                print(f"  - {f}")
            return 1

        print(
            f"\nverified {len(EDGES)} foreign keys and {len(ARRAY_EDGES)} array edges "
            f"— every reference resolves"
        )
        return 0
    finally:
        await conn.close()


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))

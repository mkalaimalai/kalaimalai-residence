"""enable RLS (no policies) on every public table

Supabase publishes every table in `public` through PostgREST, reachable with the
anon key that ships inside the browser bundle. `user_profiles` was locked down in
migrations/raw/004; every other table was still world-readable and world-writable
straight past this API — which is what the "RLS Disabled in Public" advisor flags.

No policies are added, because nothing is supposed to reach these tables over
PostgREST. The API connects as `postgres`, which bypasses RLS, so the FastAPI
endpoints are unaffected and remain the only door.

Revision ID: a1c7e2b90d41
Revises: f5201d681403
Create Date: 2026-08-19

"""
from typing import Sequence, Union

from alembic import op

revision: str = 'a1c7e2b90d41'
down_revision: Union[str, Sequence[str], None] = 'f5201d681403'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


TABLES = (
    "projects", "spaces", "domains", "drawings", "vendors", "procurement_items",
    "decisions", "snags", "boqs", "boq_line_items", "materials", "lessons",
    "progress_entries", "warranties", "gallery_items", "media_sets",
    "quotes", "quote_line_items", "purchase_orders", "deliveries",
    "inspections", "notifications", "user_profiles", "alembic_version",
)


def upgrade() -> None:
    for table in TABLES:
        # Guarded on existence + current state so this is safe to re-run and safe
        # against a non-Supabase database that never had some of these tables.
        op.execute(
            f"""
            DO $$
            BEGIN
              IF EXISTS (
                SELECT 1 FROM pg_class c
                JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE n.nspname = 'public' AND c.relname = '{table}'
                  AND c.relkind = 'r' AND NOT c.relrowsecurity
              ) THEN
                ALTER TABLE public.{table} ENABLE ROW LEVEL SECURITY;
              END IF;
            END $$;
            """
        )


def downgrade() -> None:
    for table in TABLES:
        if table == "user_profiles":
            # Predates this migration; leave it locked down.
            continue
        op.execute(
            f"""
            DO $$
            BEGIN
              IF EXISTS (
                SELECT 1 FROM pg_class c
                JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE n.nspname = 'public' AND c.relname = '{table}'
                  AND c.relkind = 'r' AND c.relrowsecurity
              ) THEN
                ALTER TABLE public.{table} DISABLE ROW LEVEL SECURITY;
              END IF;
            END $$;
            """
        )

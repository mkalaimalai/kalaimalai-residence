"""foreign keys for the entity graph

Every cross-entity reference was an unconstrained varchar: a `vendor_id` pointing at a
deleted or misspelled vendor was stored happily and surfaced later only as a traversal
returning fewer rows than it should. This makes the graph real.

Two changes per edge, in order:

1. The column becomes NULL-able and its `''` sentinel becomes NULL. A foreign key
   cannot accept the empty string, so `''` had to go. This stops at the database —
   `app.shared.crud.make_mappers` converts NULL back to `""` for entities, so no
   schema, response model or `types/index.ts` field changes.
2. The foreign key is added, CASCADE for rows that cannot outlive their parent and
   SET NULL everywhere else.

The edge list lives in `app.shared.relations`, shared with scripts/verify_graph.py so
the constraints and the checker cannot drift apart.

Revision ID: c4d8b17f0a92
Revises: a1c7e2b90d41
Create Date: 2026-08-22

"""
from typing import Sequence, Union

from alembic import op

from app.shared.relations import EDGES

revision: str = "c4d8b17f0a92"
down_revision: Union[str, Sequence[str], None] = "a1c7e2b90d41"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _name(table: str, column: str) -> str:
    return f"fk_{table}_{column}"


def upgrade() -> None:
    for table, column, target, ondelete in EDGES:
        op.execute(f"ALTER TABLE {table} ALTER COLUMN {column} DROP NOT NULL")
        op.execute(f"UPDATE {table} SET {column} = NULL WHERE {column} = ''")
        # Guarded so a re-run against a partially migrated database is a no-op rather
        # than a duplicate-constraint error.
        op.execute(
            f"""
            DO $$
            BEGIN
              IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = '{_name(table, column)}'
              ) THEN
                ALTER TABLE {table}
                  ADD CONSTRAINT {_name(table, column)}
                  FOREIGN KEY ({column}) REFERENCES {target}(id)
                  ON DELETE {ondelete};
              END IF;
            END $$;
            """
        )
        # Every foreign key is a traversal path; without this each hop is a seq scan.
        op.execute(
            f"CREATE INDEX IF NOT EXISTS ix_{table}_{column} ON {table} ({column})"
        )


def downgrade() -> None:
    for table, column, _target, _ondelete in EDGES:
        op.execute(f"DROP INDEX IF EXISTS ix_{table}_{column}")
        op.execute(
            f"ALTER TABLE {table} DROP CONSTRAINT IF EXISTS {_name(table, column)}"
        )
        # Restore the '' sentinel before reinstating NOT NULL, or the column would
        # fail its own constraint.
        op.execute(f"UPDATE {table} SET {column} = '' WHERE {column} IS NULL")
        op.execute(f"ALTER TABLE {table} ALTER COLUMN {column} SET NOT NULL")

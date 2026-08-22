"""drawing revisions and ISO 19650 suitability

`Drawing.revision` was a single mutable string and `Drawing.file_url` a single file, so
re-issuing a drawing destroyed its predecessor. In the live data `dwg-arch-gf` sits at
"R3" and R1 and R2 exist nowhere — which makes the questions worth asking (when was this
approved, what changed, was that wall built from a superseded sheet) unanswerable.

Two changes:

1. `drawings.suitability` — the ISO 19650 code for what a revision may be *used for*,
   which is a different question from where it sits in our workflow. "Approved" says a
   review finished; `A1` says the site may build from it.
2. `drawing_revisions` — one row per issue, owning its own file. The drawing becomes the
   stable register entry (IFC's IfcDocumentInformation); this is the versioned issue.

The backfill creates exactly one revision per existing drawing, carrying its current
code, date, file and derived suitability, so no information is invented and none is
lost. History starts accumulating from the next issue onward.

Revision ID: d7e3a509c114
Revises: c4d8b17f0a92
Create Date: 2026-08-22

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "d7e3a509c114"
down_revision: Union[str, Sequence[str], None] = "c4d8b17f0a92"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Workflow status -> ISO 19650 suitability. "Superseded" maps to S2 (issued for
# information) rather than an A-code: a replaced sheet must not read as buildable.
STATUS_TO_SUITABILITY = {
    "Draft": "S0",
    "For Review": "S3",
    "Approved": "S4",
    "Issued for Construction": "A1",
    "Superseded": "S2",
}


def upgrade() -> None:
    op.add_column(
        "drawings",
        sa.Column("suitability", sa.String(), nullable=False, server_default="S0"),
    )
    for status, code in STATUS_TO_SUITABILITY.items():
        op.execute(
            f"UPDATE drawings SET suitability = '{code}' WHERE status = '{status}'"
        )

    op.create_table(
        "drawing_revisions",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("drawing_id", sa.String(), nullable=True),
        sa.Column("code", sa.String(), nullable=False),
        sa.Column("issued_on", sa.String(), nullable=False, server_default=""),
        sa.Column("suitability", sa.String(), nullable=False, server_default="S0"),
        sa.Column("file_url", sa.String(), nullable=False, server_default=""),
        sa.Column("supersedes_id", sa.String(), nullable=True),
        sa.Column("issued_by", sa.String(), nullable=False, server_default=""),
        sa.Column("change_note", sa.Text(), nullable=False, server_default=""),
        sa.Column("project_id", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["drawing_id"], ["drawings.id"], name="fk_drawing_revisions_drawing_id",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["supersedes_id"], ["drawing_revisions.id"],
            name="fk_drawing_revisions_supersedes_id", ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_drawing_revisions_drawing_id", "drawing_revisions", ["drawing_id"]
    )
    # A drawing cannot have two issues with the same code.
    op.create_index(
        "uq_drawing_revisions_drawing_code",
        "drawing_revisions",
        ["drawing_id", "code"],
        unique=True,
    )

    # RLS with no policies, matching every other table (migration a1c7e2b90d41).
    # Without it this table is world-readable through PostgREST with the anon key.
    op.execute("ALTER TABLE drawing_revisions ENABLE ROW LEVEL SECURITY")

    # Backfill: one revision per drawing, from what the drawing already holds.
    # COALESCE on revision because a drawing with no code still needs a first issue.
    op.execute(
        """
        INSERT INTO drawing_revisions
            (id, drawing_id, code, issued_on, suitability, file_url,
             supersedes_id, issued_by, change_note, project_id)
        SELECT
            'drawrev-' || d.id,
            d.id,
            COALESCE(NULLIF(d.revision, ''), 'R1'),
            d.date,
            d.suitability,
            d.file_url,
            NULL,
            d.consultant,
            'Backfilled from the drawing record when revision history was introduced.',
            d.project_id
        FROM drawings d
        """
    )


def downgrade() -> None:
    op.drop_index("uq_drawing_revisions_drawing_code", table_name="drawing_revisions")
    op.drop_index("ix_drawing_revisions_drawing_id", table_name="drawing_revisions")
    op.drop_table("drawing_revisions")
    op.drop_column("drawings", "suitability")

"""The entity graph, declared once.

Every cross-entity reference in this system is an id column, but until now none of
them were foreign keys: a `vendor_id` was an unconstrained `varchar`, so a reference
to a deleted or misspelled vendor was stored happily and only failed later, silently,
as a traversal that returned fewer rows than it should have.

This module is the single declaration of those edges. The Alembic migration builds the
constraints from it, `scripts/verify_graph.py` checks live data against it, and
`app.shared.crud` uses `NULLABLE_REFS` to keep the API contract unchanged.

## Why the columns become nullable

The ORM used `""` as the "no reference" sentinel (`mapped_column(String, default="")`).
A foreign key cannot accept `''` — it is not a valid id — so the columns move to NULL.
That change stops at the database: `make_mappers` converts NULL back to `""` on the way
out and `""` to NULL on the way in, so entity dataclasses, Pydantic schemas and
`types/index.ts` are all untouched. The contract in `types/index.ts` is locked
(constitution rule 4); this is deliberately a storage change, not a contract change.

## Not covered here

- Array columns (`spaces.domain_ids`, `domains.vendor_ids`, `materials.space_ids`, …).
  Postgres cannot put a foreign key on an array element, so these are checked by
  `scripts/verify_graph.py` instead of constrained. See ARRAY_EDGES.
- `work_package_id` and `document_id` have no table to point at yet.
- `project_id` already has its foreign key from migration 002.
"""

# (source table, column, target table, ON DELETE)
#
# CASCADE where the row is a child that cannot outlive its parent — a quote line item
# without a quote is garbage. SET NULL everywhere else, so deleting a vendor clears the
# reference rather than destroying the purchase order that mentions it.
EDGES: tuple[tuple[str, str, str, str], ...] = (
    ("boq_line_items", "boq_id", "boqs", "CASCADE"),
    ("quote_line_items", "quote_id", "quotes", "CASCADE"),
    ("deliveries", "purchase_order_id", "purchase_orders", "CASCADE"),

    ("boq_line_items", "approved_vendor_id", "vendors", "SET NULL"),
    ("boq_line_items", "space_id", "spaces", "SET NULL"),
    ("boqs", "vendor_id", "vendors", "SET NULL"),
    ("decisions", "domain_id", "domains", "SET NULL"),
    ("decisions", "space_id", "spaces", "SET NULL"),
    ("drawings", "domain_id", "domains", "SET NULL"),
    ("drawings", "space_id", "spaces", "SET NULL"),
    ("gallery_items", "domain_id", "domains", "SET NULL"),
    ("gallery_items", "space_id", "spaces", "SET NULL"),
    ("inspections", "space_id", "spaces", "SET NULL"),
    ("lessons", "domain_id", "domains", "SET NULL"),
    ("lessons", "space_id", "spaces", "SET NULL"),
    ("materials", "vendor_id", "vendors", "SET NULL"),
    ("procurement_items", "space_id", "spaces", "SET NULL"),
    ("procurement_items", "vendor_id", "vendors", "SET NULL"),
    ("progress_entries", "space_id", "spaces", "SET NULL"),
    ("purchase_orders", "quote_id", "quotes", "SET NULL"),
    ("purchase_orders", "vendor_id", "vendors", "SET NULL"),
    ("quote_line_items", "boq_line_id", "boq_line_items", "SET NULL"),
    ("quotes", "boq_id", "boqs", "SET NULL"),
    ("quotes", "vendor_id", "vendors", "SET NULL"),
    ("snags", "space_id", "spaces", "SET NULL"),
    ("warranties", "vendor_id", "vendors", "SET NULL"),
)

# Edges stored as string arrays. Postgres has no per-element foreign key, so these are
# verified rather than constrained.
ARRAY_EDGES: tuple[tuple[str, str, str], ...] = (
    ("domains", "drawing_ids", "drawings"),
    ("domains", "lesson_ids", "lessons"),
    ("domains", "space_ids", "spaces"),
    ("domains", "vendor_ids", "vendors"),
    ("materials", "space_ids", "spaces"),
    ("spaces", "decision_ids", "decisions"),
    ("spaces", "domain_ids", "domains"),
    ("spaces", "drawing_ids", "drawings"),
    ("spaces", "lesson_ids", "lessons"),
    ("spaces", "material_ids", "materials"),
    ("spaces", "vendor_ids", "vendors"),
)

# Column names the mapper translates between NULL (database) and "" (entity).
# media_sets already had nullable foreign keys from migration 003; including its columns
# here fixes a pre-existing inconsistency where the entity could receive None despite the
# dataclass declaring `str`.
NULLABLE_REFS: frozenset[str] = frozenset(
    [column for _, column, _, _ in EDGES] + ["domain_id", "space_id"]
)

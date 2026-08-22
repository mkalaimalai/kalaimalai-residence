-- 002_project_scope.sql — give every entity table a tenant boundary.
--
-- Before this migration only 4 tables carried `project_id` (as an unconstrained
-- VARCHAR) and the schema had zero foreign keys, so the 14 core entities had no link
-- to `projects` at all. `data/project.ts` ships 5 projects and `/2.0` has a project
-- picker, but every table below the picker returned the same rows regardless of
-- selection. This closes that gap.
--
-- Backfill target: every pre-existing row belongs to the original single project,
-- 'proj-kr'. That row must exist before this runs (it does — projects is seeded from
-- data/project.ts, where proj-kr is projects[0]).
--
-- Idempotent: safe to re-run. ADD COLUMN IF NOT EXISTS + guarded constraint adds.

BEGIN;

-- Guard: refuse to run if the backfill target is missing, rather than silently
-- writing a project_id that violates the FK we are about to add.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM projects WHERE id = 'proj-kr') THEN
    RAISE EXCEPTION
      'Backfill target project ''proj-kr'' not found. Seed projects before migrating.';
  END IF;
END $$;

-- ---------------------------------------------------------------------------------
-- 1. Add + backfill + constrain.
--
-- Two groups, one loop each:
--   NEW  — 16 tables that had no project_id.
--   OLD  — 4 commercial tables that already had a bare VARCHAR project_id; they only
--          need the FK and index. Their existing values are backfilled too, in case
--          any row carries an id that no longer resolves.
-- ---------------------------------------------------------------------------------
DO $$
DECLARE
  scoped_table TEXT;
  new_tables TEXT[] := ARRAY[
    'spaces', 'domains', 'progress_entries',
    'drawings', 'gallery_items', 'lessons',
    'boqs', 'procurement_items', 'materials', 'quote_line_items',
    'vendors',
    'snags', 'inspections', 'decisions',
    'warranties',
    'notifications'
  ];
  existing_tables TEXT[] := ARRAY[
    'boq_line_items', 'deliveries', 'purchase_orders', 'quotes'
  ];
BEGIN
  FOREACH scoped_table IN ARRAY new_tables || existing_tables LOOP

    -- Nullable first so the backfill can run against existing rows.
    EXECUTE format(
      'ALTER TABLE %I ADD COLUMN IF NOT EXISTS project_id VARCHAR', scoped_table);

    -- Every row with no resolvable project belongs to the original project.
    EXECUTE format(
      'UPDATE %I SET project_id = ''proj-kr''
         WHERE project_id IS NULL
            OR project_id = ''''
            OR project_id NOT IN (SELECT id FROM projects)', scoped_table);

    EXECUTE format(
      'ALTER TABLE %I ALTER COLUMN project_id SET NOT NULL', scoped_table);

    -- ON DELETE CASCADE: deleting a project removes its data. That is the point of a
    -- tenant boundary — no orphan rows surviving their owner.
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = scoped_table || '_project_id_fkey'
    ) THEN
      EXECUTE format(
        'ALTER TABLE %I ADD CONSTRAINT %I
           FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE',
        scoped_table, scoped_table || '_project_id_fkey');
    END IF;

    -- Every list query is now `WHERE project_id = $1`; this is the supporting index.
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON %I (project_id)',
      'ix_' || scoped_table || '_project_id', scoped_table);

  END LOOP;
END $$;

-- ---------------------------------------------------------------------------------
-- 2. Slugs are unique per project, not globally.
--
-- `spaces.slug` and `domains.slug` were globally UNIQUE, which is wrong once a second
-- project exists: two projects may each legitimately have a 'living-room'. Swap the
-- global constraint for a composite one.
-- ---------------------------------------------------------------------------------
DO $$
DECLARE
  slugged_table TEXT;
  old_constraint TEXT;
BEGIN
  FOREACH slugged_table IN ARRAY ARRAY['spaces', 'domains'] LOOP

    -- The single-column unique constraint's generated name varies by how the table was
    -- created, so find it by shape rather than assuming `<table>_slug_key`.
    SELECT con.conname INTO old_constraint
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = slugged_table
      AND con.contype = 'u'
      AND con.conkey = ARRAY[
        (SELECT attnum FROM pg_attribute
          WHERE attrelid = rel.oid AND attname = 'slug')
      ]::SMALLINT[];

    IF old_constraint IS NOT NULL THEN
      EXECUTE format(
        'ALTER TABLE %I DROP CONSTRAINT %I', slugged_table, old_constraint);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = slugged_table || '_project_id_slug_key'
    ) THEN
      EXECUTE format(
        'ALTER TABLE %I ADD CONSTRAINT %I UNIQUE (project_id, slug)',
        slugged_table, slugged_table || '_project_id_slug_key');
    END IF;

  END LOOP;
END $$;

COMMIT;

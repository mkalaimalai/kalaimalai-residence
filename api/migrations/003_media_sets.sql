-- 003_media_sets.sql — the `media_sets` table for the media bounded context.
--
-- Renderings and drawing sheets currently live only in the TS seed
-- (`data/renderings.ts`, `data/drawingSheets.ts`), so the portal can show them but an
-- admin can never add one. This gives them a home in the database, shaped like
-- `RenderingSet` (title/width/height/images/subsections) so `components/RenderingGallery`
-- renders DB rows unchanged.
--
-- A set belongs to exactly one project (constitution rule 5) and optionally to one
-- domain or space within that project. Owner FKs are ON DELETE SET NULL, not CASCADE:
-- losing the owner demotes the set to project-level rather than destroying imagery.
--
-- Idempotent: safe to re-run.

BEGIN;

CREATE TABLE IF NOT EXISTS media_sets (
  id VARCHAR NOT NULL,
  project_id VARCHAR NOT NULL,
  kind VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  width INTEGER NOT NULL DEFAULT 1600,
  height INTEGER NOT NULL DEFAULT 900,
  images JSONB NOT NULL DEFAULT '[]',
  subsections JSONB,
  domain_id VARCHAR,
  space_id VARCHAR,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'media_sets_project_id_fkey'
  ) THEN
    ALTER TABLE media_sets ADD CONSTRAINT media_sets_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'media_sets_domain_id_fkey'
  ) THEN
    ALTER TABLE media_sets ADD CONSTRAINT media_sets_domain_id_fkey
      FOREIGN KEY (domain_id) REFERENCES domains (id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'media_sets_space_id_fkey'
  ) THEN
    ALTER TABLE media_sets ADD CONSTRAINT media_sets_space_id_fkey
      FOREIGN KEY (space_id) REFERENCES spaces (id) ON DELETE SET NULL;
  END IF;
END $$;

-- Every list query filters on some combination of these three.
CREATE INDEX IF NOT EXISTS ix_media_sets_project_id ON media_sets (project_id);
CREATE INDEX IF NOT EXISTS ix_media_sets_domain_id ON media_sets (domain_id);
CREATE INDEX IF NOT EXISTS ix_media_sets_space_id ON media_sets (space_id);

COMMIT;

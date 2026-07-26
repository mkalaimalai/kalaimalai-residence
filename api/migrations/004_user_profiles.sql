-- 004_user_profiles.sql — the `user_profiles` table for the identity bounded context.
--
-- Passwords, email verification and session issuance stay in **Supabase Auth**
-- (`auth.users`). This table holds only the app-level facts about a person that
-- Supabase has no opinion about: their display name, their app role, and when they
-- first appeared. `id` is the Supabase user id (the verified `sub` claim), so the two
-- join without a second identifier.
--
-- Two deliberate choices:
--
-- 1. **No FK to `auth.users`.** It would be correct against Supabase, but `scripts/dev.sh`
--    also runs this schema on a plain Postgres container that has no `auth` schema at
--    all, and a hard FK there fails outright. Integrity comes from the JWT instead:
--    a row is only ever written for a `sub` the API has cryptographically verified.
--
-- 2. **`role` is a MIRROR, never the authorization source.** Authorization reads
--    `app_metadata.role` off the verified token (`api/app/shared/auth.py`), which only
--    the service_role key can write. If this column were trusted, a user who could
--    update their own profile row could make themselves an admin. `PATCH /me` therefore
--    refuses to touch it; the column exists so an admin can *see* who is what.
--
-- Idempotent: safe to re-run.

BEGIN;

CREATE TABLE IF NOT EXISTS user_profiles (
  -- The Supabase auth user id (JWT `sub`). Text, not UUID: the local dev container
  -- has no auth schema and the seed/dev user id is a plain string.
  id VARCHAR NOT NULL,
  email VARCHAR,
  display_name VARCHAR,
  -- Mirror of app_metadata.role — see note 2 above. Never read for authorization.
  role VARCHAR NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Admin listings sort by signup date; the email lookup is for support ("who is x@y.com").
CREATE INDEX IF NOT EXISTS ix_user_profiles_created_at ON user_profiles (created_at);
CREATE INDEX IF NOT EXISTS ix_user_profiles_email ON user_profiles (email);

-- RLS with **no policies**, i.e. deny-all — and that is the intended end state.
--
-- Supabase publishes every table in `public` through PostgREST, reachable with the anon
-- key that ships inside the browser bundle. Without this, anyone who views source can
-- read the full user list and INSERT themselves a row, straight past this API. Verified:
-- before, `GET /rest/v1/user_profiles` with the anon key returned the table; after, it
-- returns `[]` and an INSERT is rejected with 42501.
--
-- No policy is needed because nothing is supposed to reach this table over PostgREST.
-- The API connects as the `postgres` role, which bypasses RLS, so `/me` and `/users`
-- are unaffected — they remain the only door, and they enforce the token themselves.
--
-- Guarded: `ENABLE ROW LEVEL SECURITY` is not idempotent-friendly on a plain re-run
-- against a database whose `user_profiles` lives outside Supabase, so it is skipped
-- when RLS is already on.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'user_profiles' AND relrowsecurity
  ) THEN
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

COMMIT;

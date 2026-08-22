/**
 * Where the admin app lives.
 *
 * `apps/admin` is still its own Next build, but it is now *mounted under this origin*
 * at `/admin` rather than deployed to a separate host: the Pages workflow builds it
 * with `ADMIN_BASE_PATH=/admin` and copies the export into `apps/web/out/admin`. So in
 * production this is a same-origin path, not a cross-origin URL, and `/admin` is served
 * by the real admin app — there is no redirect page in this app any more.
 *
 * In dev the two apps really are separate origins (:3000 and :3001), so the fallback
 * stays the dev port. Set NEXT_PUBLIC_ADMIN_URL per environment; the Pages build sets
 * it to `/admin`.
 */
// An unset CI variable inlines as the empty string, not `undefined`, so test for
// truthiness rather than nullishness — otherwise the fallback never applies.
export const ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";

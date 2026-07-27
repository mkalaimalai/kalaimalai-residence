/**
 * Where the admin app lives. It is a **separate endpoint** (`apps/admin`) with its own
 * origin, so links to it are absolute and cross-origin — not app routes.
 *
 * Set NEXT_PUBLIC_ADMIN_URL per environment; the default is the dev port from
 * `npm run dev:admin`.
 */
export const ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001";

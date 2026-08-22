import path from "path";
import type { NextConfig } from "next";

/**
 * The admin app is a separate *build* from `@kr/web` — its own Next app, its own
 * dependencies, its own dev server on :3001. It shares only the workspace packages
 * (`@kr/contracts`, `@kr/api-client`, `@kr/theme`).
 *
 * Static export like the web app — the admin UI is entirely client-fetched against the
 * FastAPI backend, so there is nothing for a Node runtime to do.
 *
 * `ADMIN_BASE_PATH` decides where the export expects to be mounted. Unset (the default,
 * and what `npm run dev:admin` uses) means the app owns its origin root. The Pages
 * deploy sets it to `/admin`, which prefixes every route *and* every asset URL — without
 * it the copied build would request its JS from `/_next/...` and get the web app's
 * chunks instead. It must start with `/` and must not end with one.
 */
const basePath = process.env.ADMIN_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
  // Root is the monorepo, not this app: `next` is hoisted to the root
  // node_modules by npm workspaces, so a per-app root cannot resolve it.
  turbopack: { root: path.join(__dirname, "..", "..") },
};

export default nextConfig;

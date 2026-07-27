import path from "path";
import type { NextConfig } from "next";

/**
 * The admin app is a separate endpoint from `@kr/web`: its own build, its own origin,
 * its own deploy. It shares only the workspace packages (`@kr/contracts`,
 * `@kr/api-client`, `@kr/theme`).
 *
 * Static export like the web app — the admin UI is entirely client-fetched against the
 * FastAPI backend, so there is nothing for a Node runtime to do.
 */
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // Root is the monorepo, not this app: `next` is hoisted to the root
  // node_modules by npm workspaces, so a per-app root cannot resolve it.
  turbopack: { root: path.join(__dirname, "..", "..") },
};

export default nextConfig;

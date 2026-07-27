import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export for GitHub Pages (no Node server at runtime).
  output: "export",
  // Pages is served over a CDN with no Next.js image optimizer, so emit plain <img>.
  images: { unoptimized: true },
  // Emit `route/index.html` so deep links resolve as static files on Pages.
  trailingSlash: true,
  // Pin the workspace root to the REPO root, not this app: npm hoists `next` and the
  // `@kr/*` symlinks into the root node_modules, so Turbopack has to be allowed to read
  // above `apps/web` or it cannot resolve them. Pinning also stops a stray lockfile in
  // the home directory from confusing root inference.
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
};

export default nextConfig;

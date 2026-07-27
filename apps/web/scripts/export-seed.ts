/**
 * Seed exporter (run via `npm run export:seed`).
 *
 * Dumps every typed seed module in `data/` to a single camelCase JSON file the Python
 * backend loads into Postgres (`api/scripts/seed.py`). This is the ONE place besides the
 * repository's offline fallback that reads `data/` directly — the seed-of-record bridge.
 *
 * Output shape matches the API's collection names exactly so the loader is a thin map.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { projects } from "@/data/project";
import { spaces } from "@/data/spaces";
import { domains } from "@/data/domains";
import { materials } from "@/data/materials";
import { drawings } from "@/data/drawings";
import { vendors } from "@/data/vendors";
import { procurement } from "@/data/procurement";
import { decisions } from "@/data/decisions";
import { boqs } from "@/data/boq";
import { progress } from "@/data/progress";
import { snags } from "@/data/snags";
import { warranties } from "@/data/warranties";
import { lessons } from "@/data/lessons";
import { gallery } from "@/data/gallery";
import { renderingsByDomain, type RenderingSet } from "@/data/renderings";
import { drawingSheetsByDomain, drawingSheetsBySpace } from "@/data/drawingSheets";

/**
 * Flatten the slug-keyed rendering/drawing maps into `media_sets` rows.
 *
 * These two modules stay the **build-time** source for the 1.0 site; this exists so the
 * API-backed 2.0 pages show the same imagery instead of empty tabs. Ids are derived from
 * kind + owner slug + position rather than generated, so re-running the seed upserts the
 * same rows instead of duplicating them on every load.
 *
 * The seed is single-project by construction (`projects[0]`) — these maps are keyed by
 * bare slug, and slugs are only unique *per project*, so there is nothing in them that
 * could identify a second project's domain.
 */
const seedProjectId = projects[0].id;

function mediaRows(
  kind: "rendering" | "drawing_sheet",
  bySlug: Record<string, RenderingSet[]>,
  owner: "domain" | "space",
) {
  const ownerIdBySlug = new Map(
    (owner === "domain" ? domains : spaces)
      .filter((entity) => entity.projectId === seedProjectId)
      .map((entity) => [entity.slug, entity.id] as const),
  );

  return Object.entries(bySlug).flatMap(([slug, sets]) => {
    const ownerId = ownerIdBySlug.get(slug);
    // A map entry with no matching entity is a dangling reference, and silently
    // dropping it would hide the typo. `npm run verify` guards data/ the same way.
    if (!ownerId) {
      throw new Error(
        `${kind}: no ${owner} with slug "${slug}" in project ${seedProjectId}`,
      );
    }
    return sets.map((set, index) => ({
      id: `ms-${kind === "rendering" ? "r" : "d"}-${slug}-${index + 1}`,
      projectId: seedProjectId,
      kind,
      title: set.title,
      width: set.width,
      height: set.height,
      images: set.images ?? [],
      subsections: set.subsections ?? null,
      domainId: owner === "domain" ? ownerId : null,
      spaceId: owner === "space" ? ownerId : null,
      sortOrder: index,
    }));
  });
}

const mediaSets = [
  ...mediaRows("rendering", renderingsByDomain, "domain"),
  ...mediaRows("drawing_sheet", drawingSheetsByDomain, "domain"),
  ...mediaRows("drawing_sheet", drawingSheetsBySpace, "space"),
];

const payload = {
  projects,
  spaces,
  domains,
  materials,
  drawings,
  vendors,
  procurement,
  decisions,
  boqs,
  progress,
  snags,
  warranties,
  lessons,
  gallery,
  mediaSets,
};

// cwd is apps/web (npm runs workspace scripts from the workspace dir); the API is a
// sibling app, so go up one level rather than assuming the repo root.
const out = join(process.cwd(), "..", "api", "scripts", "seed.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(payload, null, 2));

const counts = Object.entries(payload)
  .map(([k, v]) => `${k}=${Array.isArray(v) ? v.length : 1}`)
  .join("  ");
console.log(`Wrote ${out}`);
console.log(counts);

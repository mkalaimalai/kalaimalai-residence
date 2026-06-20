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

import { project } from "@/data/project";
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

const payload = {
  project,
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
};

const out = join(process.cwd(), "api", "scripts", "seed.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(payload, null, 2));

const counts = Object.entries(payload)
  .map(([k, v]) => `${k}=${Array.isArray(v) ? v.length : 1}`)
  .join("  ");
console.log(`Wrote ${out}`);
console.log(counts);

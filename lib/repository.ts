/**
 * Repository — the ONLY data entry point for the app (build doc §7.0).
 *
 * Pages and components import from here, never from `data/` directly. Every function
 * is async and returns the locked `types/index.ts` shapes, so the backing store is a
 * swap behind this seam.
 *
 * Two modes, chosen by the `DATA_SOURCE` env var:
 *   - default (unset): read the typed seed modules in `data/` (local dev, zero config).
 *   - "api": fetch from the FastAPI backend at `API_BASE_URL` (build-time, for the
 *     static export). On failure, fall back to the local seed iff `ALLOW_SEED_FALLBACK=1`
 *     so CI still builds when the free-tier API is cold/asleep.
 *
 * Public pages are a build-time snapshot regenerated on each deploy. Portal pages fetch
 * live, client-side, via `lib/api-client` (auth + sensitive data stay out of the bundle).
 */

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

import type {
  BOQ,
  Decision,
  Domain,
  Drawing,
  GalleryItem,
  Lesson,
  Material,
  ProcurementItem,
  ProgressEntry,
  Project,
  Snag,
  Space,
  Vendor,
  Warranty,
} from "@/types";

// --- data source switch ------------------------------------------------------------
const USE_API = process.env.DATA_SOURCE === "api";
const API_BASE = process.env.API_BASE_URL ?? "";
const ALLOW_FALLBACK = process.env.ALLOW_SEED_FALLBACK === "1";

// Memoize each list fetch for the lifetime of one build: `generateStaticParams` plus
// every page calls these, and we must not hammer the API (or re-pay latency) per call.
const cache = new Map<string, Promise<unknown>>();

async function fetchList<T>(path: string, fallback: T[]): Promise<T[]> {
  if (!USE_API) return fallback;
  if (!cache.has(path)) cache.set(path, doFetch<T[]>(path, fallback));
  return cache.get(path) as Promise<T[]>;
}

async function doFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    if (ALLOW_FALLBACK) {
      console.warn(`[repository] ${path} failed, using seed fallback: ${String(err)}`);
      return fallback;
    }
    throw err;
  }
}

// Project is a singleton with a public/full split; pad portal-only fields the public
// endpoint omits so the returned object still satisfies the `Project` type.
async function fetchProject(): Promise<Project> {
  if (!USE_API) return project;
  if (!cache.has("/project")) {
    cache.set(
      "/project",
      doFetch<Partial<Project>>("/project", project).then((p) => ({
        internalName: "",
        villaNo: "",
        community: "",
        address: "",
        ...p,
      })) as Promise<unknown>,
    );
  }
  return cache.get("/project") as Promise<Project>;
}

// Project --------------------------------------------------------------------
export async function getProject(): Promise<Project> {
  return fetchProject();
}

// Spaces ---------------------------------------------------------------------
export async function getSpaces(): Promise<Space[]> {
  return fetchList<Space>("/spaces", spaces);
}
export async function getSpaceBySlug(slug: string): Promise<Space | null> {
  return (await getSpaces()).find((s) => s.slug === slug) ?? null;
}
export async function getSpaceById(id: string): Promise<Space | null> {
  return (await getSpaces()).find((s) => s.id === id) ?? null;
}

// Domains --------------------------------------------------------------------
export async function getDomains(): Promise<Domain[]> {
  return fetchList<Domain>("/domains", domains);
}
export async function getDomainBySlug(slug: string): Promise<Domain | null> {
  return (await getDomains()).find((d) => d.slug === slug) ?? null;
}
export async function getDomainById(id: string): Promise<Domain | null> {
  return (await getDomains()).find((d) => d.id === id) ?? null;
}

// Drawings -------------------------------------------------------------------
export async function getDrawings(): Promise<Drawing[]> {
  return fetchList<Drawing>("/drawings", drawings);
}
export async function getDrawingById(id: string): Promise<Drawing | null> {
  return (await getDrawings()).find((d) => d.id === id) ?? null;
}

// Vendors --------------------------------------------------------------------
export async function getVendors(): Promise<Vendor[]> {
  return fetchList<Vendor>("/vendors", vendors);
}
export async function getVendorById(id: string): Promise<Vendor | null> {
  return (await getVendors()).find((v) => v.id === id) ?? null;
}

// Procurement ----------------------------------------------------------------
export async function getProcurement(): Promise<ProcurementItem[]> {
  return fetchList<ProcurementItem>("/procurement", procurement);
}

// Decisions ------------------------------------------------------------------
export async function getDecisions(): Promise<Decision[]> {
  return fetchList<Decision>("/decisions", decisions);
}
export async function getDecisionById(id: string): Promise<Decision | null> {
  return (await getDecisions()).find((d) => d.id === id) ?? null;
}

// BOQ ------------------------------------------------------------------------
export async function getBOQs(): Promise<BOQ[]> {
  return fetchList<BOQ>("/boq", boqs);
}

// Materials ------------------------------------------------------------------
export async function getMaterials(): Promise<Material[]> {
  return fetchList<Material>("/materials", materials);
}
export async function getMaterialById(id: string): Promise<Material | null> {
  return (await getMaterials()).find((m) => m.id === id) ?? null;
}

// Progress -------------------------------------------------------------------
export async function getProgress(): Promise<ProgressEntry[]> {
  return fetchList<ProgressEntry>("/progress", progress);
}

// Snags ----------------------------------------------------------------------
export async function getSnags(): Promise<Snag[]> {
  return fetchList<Snag>("/snags", snags);
}

// Warranties -----------------------------------------------------------------
export async function getWarranties(): Promise<Warranty[]> {
  return fetchList<Warranty>("/warranties", warranties);
}

// Lessons --------------------------------------------------------------------
export async function getLessons(): Promise<Lesson[]> {
  return fetchList<Lesson>("/lessons", lessons);
}
export async function getLessonById(id: string): Promise<Lesson | null> {
  return (await getLessons()).find((l) => l.id === id) ?? null;
}

// Gallery --------------------------------------------------------------------
export async function getGallery(): Promise<GalleryItem[]> {
  return fetchList<GalleryItem>("/gallery", gallery);
}

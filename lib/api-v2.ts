import type {
  Space, Domain, Drawing, Vendor, ProcurementItem, Decision,
  Snag, BOQ, Material, Lesson, ProgressEntry, Warranty, GalleryItem, Project,
} from "@/types";

import { getSupabase } from "@/lib/supabase-client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8099";

/**
 * Attach the Supabase access token when there is one.
 *
 * Most 2.0 reads are public endpoints that don't need it, but sending it means the
 * gated ones (`/me`, `/users`, and anything that later moves behind `require_user`)
 * work without a second fetch helper. Guarded on `window` so a server render — where
 * there is no session and no localStorage — degrades to an anonymous request instead
 * of throwing.
 */
async function authHeaders(): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {};
  const supabase = getSupabase();
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(await authHeaders()),
      ...init.headers,
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.status === 204 ? (undefined as T) : res.json();
}

function fetchJson<T>(path: string): Promise<T> {
  return request<T>(path);
}

/**
 * Collection GETs are project-scoped: the API filters on `project_id` when the
 * `projectId` query param is present, and returns every project's rows when it is not.
 * The 2.0 tree always passes the id from `useProject()`, so switching projects in the
 * picker now actually changes the rows below it.
 */
function list<T>(path: string, projectId?: string): Promise<T[]> {
  const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
  return fetchJson<T[]>(`${path}${query}`);
}

/**
 * What `/projects/public` returns — `Project` minus the portal-only identity fields
 * (internalName, villaNo, community, address) that constitution §6 keeps off the public
 * side. Derived from `Project` so it tracks the locked contract in `types/index.ts`.
 */
export type PublicProject = Omit<
  Project,
  "internalName" | "villaNo" | "community" | "address"
>;

/**
 * The API's record of a signed-up person (`user_profiles`). Distinct from the Supabase
 * auth user: no credential, no email-verification state — just the app-level facts.
 * `role` mirrors the token's `app_metadata.role` and is display-only; authorization is
 * decided server-side from the token itself.
 */
export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * A `media_sets` row. Superset of `RenderingSet` in `data/renderings.ts` — same
 * title/width/height/images/subsections — so `RenderingGallery` renders these without
 * a translation layer, plus the ownership columns the DB needs.
 */
export interface MediaSet {
  id: string;
  projectId: string;
  kind: "rendering" | "drawing_sheet";
  title: string;
  width: number;
  height: number;
  images: string[];
  subsections: { title: string; images: string[] }[] | null;
  domainId: string | null;
  spaceId: string | null;
  sortOrder: number;
}

export const api = {
  // Gated (portal/admin): returns internal identity fields, 401s without a token.
  projects:        (): Promise<Project[]>                  => fetchJson("/projects"),
  // Public: safe for the 2.0 index and project picker.
  publicProjects:  (): Promise<PublicProject[]>            => fetchJson("/projects/public"),
  project:         (): Promise<Project>                    => fetchJson("/project"),
  projectById:     (id: string): Promise<Project>          => fetchJson(`/projects/${id}`),

  // Identity. The subject always comes from the bearer token, never from a parameter,
  // so none of these can be pointed at another user.
  ensureProfile: (): Promise<UserProfile> => request("/me", { method: "POST" }),
  me:            (): Promise<UserProfile> => request("/me"),
  updateMe:      (displayName: string): Promise<UserProfile> =>
    request("/me", { method: "PATCH", body: JSON.stringify({ displayName }) }),
  users:         (): Promise<UserProfile[]> => request("/users"),

  /**
   * Rendering / drawing-sheet sets, filtered server-side. Behind `require_user`, so it
   * only works for a signed-in caller — which the 2.0 tree always is.
   */
  mediaSets: (filters: {
    projectId?: string;
    domainId?: string;
    spaceId?: string;
    kind?: MediaSet["kind"];
  }): Promise<MediaSet[]> => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) query.set(key, value);
    }
    const suffix = query.toString();
    return request<MediaSet[]>(`/media-sets${suffix ? `?${suffix}` : ""}`);
  },

  spaces:      (projectId?: string) => list<Space>("/spaces", projectId),
  domains:     (projectId?: string) => list<Domain>("/domains", projectId),
  drawings:    (projectId?: string) => list<Drawing>("/drawings", projectId),
  vendors:     (projectId?: string) => list<Vendor>("/vendors", projectId),
  procurement: (projectId?: string) => list<ProcurementItem>("/procurement", projectId),
  decisions:   (projectId?: string) => list<Decision>("/decisions", projectId),
  snags:       (projectId?: string) => list<Snag>("/snags", projectId),
  boqs:        (projectId?: string) => list<BOQ>("/boq", projectId),
  materials:   (projectId?: string) => list<Material>("/materials", projectId),
  lessons:     (projectId?: string) => list<Lesson>("/lessons", projectId),
  progress:    (projectId?: string) => list<ProgressEntry>("/progress", projectId),
  warranties:  (projectId?: string) => list<Warranty>("/warranties", projectId),
  gallery:     (projectId?: string) => list<GalleryItem>("/gallery", projectId),

  // Slugs are unique per project, not globally (002 swapped the global UNIQUE for a
  // composite one), so a slug lookup without a projectId can match the wrong project's
  // room. Callers inside the 2.0 tree always have one.
  spaceById:    (id: string): Promise<Space> => fetchJson(`/spaces/${id}`),
  spaceBySlug:  (slug: string, projectId?: string): Promise<Space | undefined> =>
    list<Space>("/spaces", projectId).then(ss => ss.find(s => s.slug === slug)),
  domainBySlug: (slug: string, projectId?: string): Promise<Domain | undefined> =>
    list<Domain>("/domains", projectId).then(ds => ds.find(d => d.slug === slug)),
};

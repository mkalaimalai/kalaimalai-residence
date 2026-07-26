import type {
  Space, Domain, Drawing, Vendor, ProcurementItem, Decision,
  Snag, BOQ, Material, Lesson, ProgressEntry, Warranty, GalleryItem, Project,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8099";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
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

export const api = {
  // Gated (portal/admin): returns internal identity fields, 401s without a token.
  projects:        (): Promise<Project[]>                  => fetchJson("/projects"),
  // Public: safe for the 2.0 index and project picker.
  publicProjects:  (): Promise<PublicProject[]>            => fetchJson("/projects/public"),
  project:         (): Promise<Project>                    => fetchJson("/project"),
  projectById:     (id: string): Promise<Project>          => fetchJson(`/projects/${id}`),

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

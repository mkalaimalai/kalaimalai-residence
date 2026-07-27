/**
 * Platform-agnostic client for the FastAPI backend.
 *
 * Extracted from the web app's `lib/api-v2.ts` so the web app, the admin app and the
 * iOS/Android app all speak to the API through one implementation. Nothing in here may
 * import from `next`, touch `window`, or read `process.env` — the host supplies its own
 * base URL and token getter, because those differ per platform (Next.js inlines
 * `NEXT_PUBLIC_*`, Expo inlines `EXPO_PUBLIC_*`, and React Native has no `window`).
 */
import type {
  Space, Domain, Drawing, Vendor, ProcurementItem, Decision,
  Snag, BOQ, Material, Lesson, ProgressEntry, Warranty, GalleryItem, Project,
} from "@kr/contracts";

export interface ApiClientOptions {
  /** Origin of the API, no trailing slash — e.g. `http://localhost:8099`. */
  baseUrl: string;
  /**
   * Returns the Supabase access token, or null when nobody is signed in. Called per
   * request rather than captured once, so a token refresh is picked up automatically.
   * Public endpoints work fine without it.
   */
  getAccessToken?: () => Promise<string | null>;
}

/**
 * `/projects/public` — `Project` minus the portal-only identity fields (internalName,
 * villaNo, community, address) that constitution §6 keeps off the public side.
 */
export type PublicProject = Omit<
  Project,
  "internalName" | "villaNo" | "community" | "address"
>;

/**
 * The API's record of a signed-up person (`user_profiles`). `role` mirrors the token's
 * `app_metadata.role` and is display-only — authorization is decided server-side from
 * the token itself.
 */
export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

/** A `media_sets` row — renderings and drawing sheets. */
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

/** Thrown on any non-2xx response, carrying the status so callers can branch on 401. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
  ) {
    super(`API ${status}: ${path}`);
    this.name = "ApiError";
  }
}

export function createApiClient({ baseUrl, getAccessToken }: ApiClientOptions) {
  const root = baseUrl.replace(/\/$/, "");

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = getAccessToken ? await getAccessToken() : null;
    const res = await fetch(`${root}${path}`, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
    if (!res.ok) throw new ApiError(res.status, path);
    return res.status === 204 ? (undefined as T) : res.json();
  }

  /**
   * Collection GETs are project-scoped: the API filters on `project_id` when
   * `projectId` is present and returns EVERY project's rows when it is not. Any caller
   * rendering a single project must pass it — see constitution §5.
   */
  function list<T>(path: string, projectId?: string): Promise<T[]> {
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
    return request<T[]>(`${path}${query}`);
  }

  return {
    request,

    // Gated (portal/admin): returns internal identity fields, 401s without a token.
    projects:       (): Promise<Project[]>       => request("/projects"),
    // Public: safe for the portfolio index, the project picker and the mobile app.
    publicProjects: (): Promise<PublicProject[]> => request("/projects/public"),
    project:        (): Promise<Project>         => request("/project"),
    projectById:    (id: string): Promise<Project> => request(`/projects/${id}`),

    // Identity. The subject always comes from the bearer token, never a parameter.
    ensureProfile: (): Promise<UserProfile> => request("/me", { method: "POST" }),
    me:            (): Promise<UserProfile> => request("/me"),
    updateMe:      (displayName: string): Promise<UserProfile> =>
      request("/me", { method: "PATCH", body: JSON.stringify({ displayName }) }),
    users:         (): Promise<UserProfile[]> => request("/users"),

    /** Renderings / drawing sheets, filtered server-side. Behind `require_user`. */
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

    // Slugs are unique per project, not globally, so a slug lookup without a projectId
    // can match another project's room.
    spaceById:    (id: string): Promise<Space> => request(`/spaces/${id}`),
    spaceBySlug:  (slug: string, projectId?: string): Promise<Space | undefined> =>
      list<Space>("/spaces", projectId).then((ss) => ss.find((s) => s.slug === slug)),
    domainBySlug: (slug: string, projectId?: string): Promise<Domain | undefined> =>
      list<Domain>("/domains", projectId).then((ds) => ds.find((d) => d.slug === slug)),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

/**
 * Image paths from the API are root-relative (`/images/spaces/x.jpg`) and resolve
 * against the web app's origin, not the API's. Native clients have no origin of their
 * own, so they must absolutise them against wherever the site is hosted.
 */
export function resolveImageUrl(path: string, siteOrigin: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteOrigin.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}

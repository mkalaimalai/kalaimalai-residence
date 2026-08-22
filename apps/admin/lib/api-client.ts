"use client";

/**
 * Browser API client for the portal — live reads + admin writes against the FastAPI
 * backend, with the Supabase access token attached. Returns the same `types/index.ts`
 * shapes the repository does, so the portal `*Table` components are unchanged.
 *
 * Base URL: NEXT_PUBLIC_API_BASE_URL.
 */
import { getSupabase } from "@kr/api-client";
import type {
  BOQ,
  Decision,
  Domain,
  Drawing,
  Material,
  ProcurementItem,
  ProgressEntry,
  Project,
  Snag,
  Space,
  Vendor,
  Warranty,
} from "@kr/contracts";
import type {
  Delivery,
  Inspection,
  NotificationRecord,
  PurchaseOrder,
  Quote,
  QuoteApproval,
  QuoteLineItem,
  UserProfile,
  UserRole,
} from "@/lib/api-types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const supabase = getSupabase();
  if (!supabase) return {};
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session ? { Authorization: `Bearer ${session.access_token}` } : {};
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = { ...(await authHeader()) };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail = `${method} ${path} → ${res.status}`;
    try {
      const data = await res.json();
      if (data?.detail) {
        detail =
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail);
      }
    } catch {
      /* no JSON body */
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const apiGet = <T>(path: string) => request<T>("GET", path);
export const apiPost = <T>(path: string, body: unknown) =>
  request<T>("POST", path, body);
export const apiPatch = <T>(path: string, body: unknown) =>
  request<T>("PATCH", path, body);
export const apiDelete = <T>(path: string) => request<T>("DELETE", path);

/**
 * Multipart upload — several files in one request, matching the API's
 * `files: list[UploadFile]` parameter.
 *
 * Deliberately does NOT go through `request()`: that sets `Content-Type: application/
 * json`, and a multipart body must let the browser set the header so it can include the
 * boundary. Setting it by hand produces a body the server cannot parse.
 */
export async function apiUpload<T>(path: string, files: File[]): Promise<T> {
  const form = new FormData();
  for (const f of files) form.append("files", f, f.name);

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: await authHeader(),
    body: form,
  });

  if (!res.ok) {
    let detail = `POST ${path} → ${res.status}`;
    try {
      const data = await res.json();
      if (data?.detail) {
        detail =
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail);
      }
    } catch {
      /* no JSON body */
    }
    throw new ApiError(res.status, detail);
  }
  return (await res.json()) as T;
}

/**
 * Default project scope — used until the portal knows better. Every read is scoped to
 * the active project and every create stamped with it, since entities are `NOT NULL` on
 * `project_id` (api/migrations/002_project_scope.sql).
 */
export const PORTAL_PROJECT_ID =
  process.env.NEXT_PUBLIC_PROJECT_ID ?? "proj-kr";

/** localStorage key holding the admin's last chosen project. */
export const PROJECT_STORAGE_KEY = "portal_selected_project";

/**
 * The active project id, as a module-level value so the non-React call sites
 * (`scopedPath`, `withProject`) keep working unchanged.
 *
 * It is seeded **synchronously at module load** from localStorage rather than being left
 * at the default until ProjectProvider's effect restores it. That closes the
 * stale-scope window: a component that calls `scopedPath` in its very first render would
 * otherwise silently fetch `proj-kr` and show the wrong project's rows for one pass. The
 * `typeof window` guard keeps this safe under the static export's prerender, where the
 * value stays at the default (nothing is fetched during prerender anyway — the portal is
 * client-fetched).
 */
let activeProjectId: string = (() => {
  if (typeof window === "undefined") return PORTAL_PROJECT_ID;
  try {
    return window.localStorage.getItem(PROJECT_STORAGE_KEY) ?? PORTAL_PROJECT_ID;
  } catch {
    return PORTAL_PROJECT_ID;
  }
})();

/** Read the active project id. */
export const getActiveProjectId = () => activeProjectId;

/**
 * Point the client at a project. Called by `ProjectProvider` — once when it
 * validates the restored/default id against `GET /projects`, and again on every pick.
 * Persistence lives here too so the module value and localStorage never diverge.
 */
export function setActiveProjectId(id: string): void {
  activeProjectId = id;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROJECT_STORAGE_KEY, id);
  } catch {
    /* private mode / storage disabled — in-memory scope still works */
  }
}

export const scopedPath = (path: string) =>
  `${path}?projectId=${encodeURIComponent(activeProjectId)}`;

/**
 * Stamp the owning project on a create payload.
 *
 * `Project` is the tenant root and `ProjectCreate` has no `projectId` field, so creates
 * against `/projects` must opt out with `{ scoped: false }` — otherwise the API rejects
 * the extra field.
 */
export const withProject = <T extends object>(
  payload: T,
  opts?: { scoped?: boolean },
) => (opts?.scoped === false ? { ...payload } : { projectId: activeProjectId, ...payload });

// --- typed collection reads (mirror the repository getters used by the portal) ----
export const api = {
  spaces: () => apiGet<Space[]>(scopedPath("/spaces")),
  domains: () => apiGet<Domain[]>(scopedPath("/domains")),
  vendors: () => apiGet<Vendor[]>(scopedPath("/vendors")),
  materials: () => apiGet<Material[]>(scopedPath("/materials")),
  drawings: () => apiGet<Drawing[]>(scopedPath("/drawings")),
  decisions: () => apiGet<Decision[]>(scopedPath("/decisions")),
  procurement: () => apiGet<ProcurementItem[]>(scopedPath("/procurement")),
  boqs: () => apiGet<BOQ[]>(scopedPath("/boq")),
  snags: () => apiGet<Snag[]>(scopedPath("/snags")),
  progress: () => apiGet<ProgressEntry[]>(scopedPath("/progress")),
  warranties: () => apiGet<Warranty[]>(scopedPath("/warranties")),
  /**
   * Everyone who has signed up (`require_admin`). Not project-scoped — a person is not
   * owned by a project, so `scopedPath` would be wrong here.
   */
  users: () => apiGet<UserProfile[]>("/users"),
  /** The caller's own profile. Subject comes from the token, so it needs no id. */
  me: () => apiGet<UserProfile>("/me"),
  /**
   * Promote or demote someone. Writes `app_metadata.role` in Supabase via the API's
   * service_role key — 501 if the server has no such key configured. The change lands
   * for the target on their next token refresh, not immediately.
   */
  setUserRole: (userId: string, role: UserRole) =>
    apiPatch<UserProfile>(`/users/${encodeURIComponent(userId)}/role`, { role }),

  /** Every project the signed-in user can see (`require_user`) — feeds the picker. */
  projects: () => apiGet<Project[]>("/projects"),
  /**
   * The active project's full (portal-only) record. Uses `/projects/{id}` rather than
   * `/project/full`, which is a hard singleton server-side (`GetSingletonProject` returns
   * the first row and ignores any scope) and so would always return proj-kr.
   */
  projectFull: () =>
    apiGet<Project>(`/projects/${encodeURIComponent(activeProjectId)}`),
};

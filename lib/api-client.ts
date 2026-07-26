"use client";

/**
 * Browser API client for the portal — live reads + admin writes against the FastAPI
 * backend, with the Supabase access token attached. Returns the same `types/index.ts`
 * shapes the repository does, so the portal `*Table` components are unchanged.
 *
 * Base URL: NEXT_PUBLIC_API_BASE_URL.
 */
import { getSupabase } from "@/lib/supabase-client";
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
} from "@/types";
import type {
  Delivery,
  Inspection,
  NotificationRecord,
  PurchaseOrder,
  Quote,
  QuoteApproval,
  QuoteLineItem,
} from "@/types/api";

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

/**
 * The project this portal administers. The portal is the control centre for one
 * project (unlike `/2.0`, which has a picker), so every read is scoped to it and every
 * create is stamped with it — entities are `NOT NULL` on `project_id` since
 * api/migrations/002_project_scope.sql.
 */
export const PORTAL_PROJECT_ID =
  process.env.NEXT_PUBLIC_PROJECT_ID ?? "proj-kr";

export const scopedPath = (path: string) =>
  `${path}?projectId=${encodeURIComponent(PORTAL_PROJECT_ID)}`;

/** Stamp the owning project on a create payload. */
export const withProject = <T extends object>(payload: T) => ({
  projectId: PORTAL_PROJECT_ID,
  ...payload,
});

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
  projectFull: () => apiGet<Project>("/project/full"),
};

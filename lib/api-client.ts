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

// --- typed collection reads (mirror the repository getters used by the portal) ----
export const api = {
  spaces: () => apiGet<Space[]>("/spaces"),
  domains: () => apiGet<Domain[]>("/domains"),
  vendors: () => apiGet<Vendor[]>("/vendors"),
  materials: () => apiGet<Material[]>("/materials"),
  drawings: () => apiGet<Drawing[]>("/drawings"),
  decisions: () => apiGet<Decision[]>("/decisions"),
  procurement: () => apiGet<ProcurementItem[]>("/procurement"),
  boqs: () => apiGet<BOQ[]>("/boq"),
  snags: () => apiGet<Snag[]>("/snags"),
  progress: () => apiGet<ProgressEntry[]>("/progress"),
  warranties: () => apiGet<Warranty[]>("/warranties"),
  projectFull: () => apiGet<Project>("/project/full"),
};

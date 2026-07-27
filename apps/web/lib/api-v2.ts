/**
 * Web binding for the shared API client.
 *
 * The transport, the endpoint list and the response types now live in
 * `@kr/api-client` so the admin app and the iOS/Android app use the same
 * implementation. This file supplies only what is web-specific: the Next.js public env
 * var and the Supabase session held in localStorage.
 */
import { createApiClient } from "@kr/api-client";
import { getSupabase } from "@/lib/supabase-client";

export type { PublicProject, UserProfile, MediaSet, ApiClient } from "@kr/api-client";
export { ApiError, resolveImageUrl } from "@kr/api-client";

export const api = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8099",
  /**
   * Guarded on `window` so a server render — where there is no session and no
   * localStorage — degrades to an anonymous request instead of throwing. Most public
   * reads don't need the token; the gated ones (`/me`, `/media-sets`) do.
   */
  getAccessToken: async () => {
    if (typeof window === "undefined") return null;
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  },
});

/**
 * Mobile binding for the shared API client.
 *
 * Mirrors what `lib/api-v2.ts` does for the web: supply the platform's base URL and
 * token getter, and reuse `@kr/api-client` for everything else. The app is read-only
 * today, so there is no session yet and `getAccessToken` returns null — which limits it
 * to the public endpoints (`/projects/public`, `/spaces`, `/domains`, `/gallery`, …).
 * Wire Supabase here when the app grows a login.
 */
import Constants from "expo-constants";
import { createApiClient, resolveImageUrl } from "@kr/api-client";

const extra = (Constants.expoConfig?.extra ?? {}) as {
  apiUrl?: string;
  siteOrigin?: string;
};

/**
 * `EXPO_PUBLIC_*` is inlined at build time, same idea as `NEXT_PUBLIC_*`. Falls back to
 * app.json so a plain `expo start` works with no env setup.
 *
 * Note for device testing: `localhost` is the phone, not your Mac. Set
 * EXPO_PUBLIC_API_URL to your machine's LAN address (e.g. http://192.168.1.5:8099).
 */
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || extra.apiUrl || "http://localhost:8099";

/**
 * Image paths from the API are root-relative and resolve against the WEB app's origin —
 * the API does not serve files. Native has no origin of its own, so every image URL
 * must be absolutised against the deployed site.
 */
export const SITE_ORIGIN =
  process.env.EXPO_PUBLIC_SITE_ORIGIN ||
  extra.siteOrigin ||
  "https://mkalaimalai-residence.github.io";

export const api = createApiClient({ baseUrl: API_URL });

export const imageUrl = (path: string) => resolveImageUrl(path, SITE_ORIGIN);

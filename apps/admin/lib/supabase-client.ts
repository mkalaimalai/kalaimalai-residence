"use client";

/**
 * Browser Supabase client — real auth for the portal, replacing the obscurity-only
 * PasswordGate. Session persists in localStorage (survives reload).
 *
 * Configured via NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (the anon key
 * is public by design — RLS / API JWT verification is the real boundary). When the env
 * is absent (e.g. a local build with no backend), `getSupabase()` returns null and the
 * auth gate shows a "not configured" message instead of crashing the build.
 */
import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!URL || !ANON) return null;
  if (!client) {
    client = createClient(URL, ANON, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}

export const isSupabaseConfigured = Boolean(URL && ANON);

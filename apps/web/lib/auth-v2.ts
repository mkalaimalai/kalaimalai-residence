"use client";

/**
 * Auth for the 2.0 tree (`/` and `/[projectId]/**`).
 *
 * Thin layer over `lib/supabase-client.ts`: Supabase Auth issues and refreshes the
 * session, this file only wraps the three calls the login/signup pages need and turns
 * Supabase's error strings into something a person can read.
 *
 * There is no password handling here and there is no second user store. The API never
 * sees a password — it verifies the resulting JWT (`api/app/shared/auth.py`) and keeps
 * its own `user_profiles` row keyed by the token's `sub`.
 */
import { getSupabase } from "@kr/api-client";
import { api } from "@/lib/api-v2";

export interface AuthResult {
  /** null on success; a human-readable message otherwise. */
  error: string | null;
  /** True when Supabase accepted the signup but wants the email confirmed first. */
  needsEmailConfirmation?: boolean;
}

const NOT_CONFIGURED =
  "Sign-in is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
  "NEXT_PUBLIC_SUPABASE_ANON_KEY.";

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabase();
  if (!supabase) return { error: NOT_CONFIGURED };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: friendly(error.message) };

  // Backfills the profile for accounts that predate `user_profiles` (or were made in
  // the Supabase dashboard), and refreshes the role mirror. Never blocks the sign-in:
  // a profile write failing is not a reason to deny someone a session they've earned.
  await api.ensureProfile().catch(() => undefined);
  return { error: null };
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
): Promise<AuthResult> {
  const supabase = getSupabase();
  if (!supabase) return { error: NOT_CONFIGURED };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // user_metadata is user-writable, so this is a convenience only — never a role.
    // The API reads `app_metadata.role`, which needs the service_role key to set.
    options: { data: { display_name: displayName } },
  });
  if (error) return { error: friendly(error.message) };

  // With email confirmation on, signUp returns a user but no session. There is no token
  // yet, so the profile row waits until the first real sign-in.
  if (!data.session) return { error: null, needsEmailConfirmation: true };

  await api.ensureProfile().catch(() => undefined);
  return { error: null };
}

export async function signOut(): Promise<void> {
  await getSupabase()?.auth.signOut();
}

/** The caller's access token, or null when signed out. Used to authorize API calls. */
export async function getAccessToken(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/** Supabase's messages are terse and lowercase; these are the ones users actually hit. */
function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "That email and password don't match an account.";
  if (m.includes("email not confirmed"))
    return "Check your inbox and confirm your email address first.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "An account with that email already exists — sign in instead.";
  if (m.includes("password should be at least"))
    return "Password is too short — use at least 6 characters.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts. Wait a minute and try again.";
  return message;
}

"use client";

/**
 * Real auth gate for the portal — replaces the obscurity-only PasswordGate.
 *
 * Shows a Supabase email/password sign-in form until there's a session, then renders the
 * portal. Exposes the signed-in user + admin role via `useAuth()` so admin-only UI (the
 * write screens) can be hidden from non-admins. The server still enforces the admin role
 * on every write — this is UX, not the security boundary.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { Lock } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase-client";

interface AuthCtx {
  email: string | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  email: null,
  isAdmin: false,
  signOut: async () => {},
});

export function useAuth(): AuthCtx {
  return useContext(AuthContext);
}

export function SupabaseAuthGate({ children }: { children: React.ReactNode }) {
  const supabase = getSupabase();
  const [session, setSession] = useState<Session | null>(null);
  // When Supabase isn't configured we're immediately "ready" (the not-configured view
  // renders below) — so the effect never needs a synchronous setState.
  const [ready, setReady] = useState(() => !isSupabaseConfigured);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-32 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
          <Lock size={20} />
        </span>
        <h1 className="font-serif text-2xl text-foreground">Portal not configured</h1>
        <p className="text-sm text-muted-foreground">
          Set <code>NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and{" "}
          <code>NEXT_PUBLIC_API_BASE_URL</code> to enable the control center.
        </p>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="flex flex-1 items-center justify-center py-32 text-sm text-muted-foreground">
        Loading…
      </main>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (signInError) setError(signInError.message);
  };

  if (!session) {
    return (
      <main className="mx-auto flex max-w-sm flex-1 flex-col items-center justify-center gap-6 px-6 py-32 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
          <Lock size={20} />
        </span>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl text-foreground">Private Portal</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to open the project control center.
          </p>
        </div>
        <form onSubmit={submit} className="w-full space-y-3">
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            aria-label="Email"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-center text-foreground outline-none focus:border-foreground"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            aria-label="Password"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-center text-foreground outline-none focus:border-foreground"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </main>
    );
  }

  const role =
    (session.user.user_metadata?.role as string | undefined) ?? "viewer";
  const value: AuthCtx = {
    email: session.user.email ?? null,
    isAdmin: role === "admin",
    signOut: async () => {
      await supabase?.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

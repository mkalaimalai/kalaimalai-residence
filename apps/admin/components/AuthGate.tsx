"use client";

/**
 * Auth for the admin app — self-contained, because this app is its own endpoint and
 * cannot lean on the web app's `/login` route.
 *
 * Shows an email/password form until there is a Supabase session, then renders the app
 * and exposes the signed-in identity via `useAuth()`.
 *
 * The role comes from **`app_metadata.role`**, never `user_metadata`: the latter is
 * writable by the user themselves with only the public anon key
 * (`updateUser({ data: { role: "admin" } })`), so trusting it would let any account
 * self-promote. The API enforces the same claim on every write — this is UX, not the
 * security boundary.
 */
import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Lock } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase-client";

interface AuthCtx {
  /** Supabase user id — the token's `sub`, and the key of `user_profiles`. Needed by
   *  the Users screen to mark "you" and to disable the self-demotion control. */
  userId: string | null;
  email: string | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  userId: null,
  email: null,
  isAdmin: false,
  signOut: async () => {},
});

export function useAuth(): AuthCtx {
  return useContext(AuthContext);
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
        <Lock size={20} />
      </span>
      {children}
    </main>
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const supabase = getSupabase();
  const [session, setSession] = useState<Session | null>(null);
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
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  if (!isSupabaseConfigured) {
    return (
      <Centered>
        <h1 className="font-serif text-2xl text-foreground">Admin not configured</h1>
        <p className="text-sm text-muted-foreground">
          Set <code>NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and{" "}
          <code>NEXT_PUBLIC_API_BASE_URL</code>.
        </p>
      </Centered>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
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
      <Centered>
        <div className="space-y-1">
          <h1 className="font-serif text-3xl text-foreground">Admin</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to manage projects and records.
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
      </Centered>
    );
  }

  const role = (session.user.app_metadata?.role as string | undefined) ?? "viewer";

  return (
    <AuthContext.Provider
      value={{
        userId: session.user.id,
        email: session.user.email ?? null,
        isAdmin: role === "admin",
        signOut: async () => {
          await supabase?.auth.signOut();
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

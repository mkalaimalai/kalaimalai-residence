"use client";

/**
 * Auth gate for the 2.0 tree — the portfolio index (`/`) and every project site
 * (`/[projectId]/**`). `/1.0/**` stays public; `/portal/**` keeps its own gate.
 *
 * This is a **client-side** gate, and that is forced by the deployment: the site is a
 * static export with no server (`output: "export"`), so there is no middleware and no
 * redirect that can run before the HTML is served. The real boundary is the API — every
 * gated endpoint verifies the Supabase JWT in `api/app/shared/auth.py`. This component
 * decides what a browser *renders*, not what a user can *reach*.
 *
 * Consequence worth knowing: the page markup itself is public (it is a file on a CDN).
 * Anything genuinely sensitive must come from a `require_user` endpoint at runtime,
 * never be baked into the bundle — the same rule the portal already follows.
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { Lock } from "lucide-react";
import Link from "next/link";
import { getSupabase, isSupabaseConfigured } from "@kr/api-client";
import { api } from "@/lib/api-v2";

interface AuthCtx {
  /** Supabase user id — the token's `sub`, and the key of `user_profiles`. */
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

/**
 * The signed-in user, for UI that varies by identity or role.
 *
 * `isAdmin` here hides controls; it does not protect anything. Every write is checked
 * server-side by `require_admin` against the token, so a user who flips this in devtools
 * gains buttons that 403.
 */
export function useAuth(): AuthCtx {
  return useContext(AuthContext);
}

export function V2AuthGate({ children }: { children: React.ReactNode }) {
  const supabase = getSupabase();
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  // Not configured means we already know the answer — no async settle needed.
  const [ready, setReady] = useState(() => !isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const redirectToLogin = useCallback(() => {
    // Carry where they were headed so login can return them there. `next` is only ever
    // read back as a same-origin path (see app/login/page.tsx) — an absolute URL here
    // would be an open redirect.
    const next = encodeURIComponent(pathname || "/");
    router.replace(`/login/?next=${next}`);
  }, [pathname, router]);

  useEffect(() => {
    if (ready && isSupabaseConfigured && !session) redirectToLogin();
  }, [ready, session, redirectToLogin]);

  if (!isSupabaseConfigured) {
    return (
      <Centered>
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
          <Lock size={20} />
        </span>
        <h1 className="font-serif text-2xl text-foreground">Sign-in not configured</h1>
        <p className="text-sm text-muted-foreground">
          Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable the portfolio.
        </p>
        <Link
          href="/1.0/"
          className="text-sm text-foreground underline underline-offset-4"
        >
          Browse the public archive instead
        </Link>
      </Centered>
    );
  }

  // Two states share this view deliberately: still checking, and redirecting after a
  // failed check. Rendering the children in either case would flash gated content.
  if (!ready || !session) {
    return (
      <Centered>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </Centered>
    );
  }

  // app_metadata mirrors what the API trusts (`app/shared/auth.py`) — it is
  // service_role-only, unlike user_metadata which the user can write themselves.
  const role = (session.user.app_metadata?.role as string | undefined) ?? "viewer";
  const value: AuthCtx = {
    userId: session.user.id,
    email: session.user.email ?? null,
    isAdmin: role === "admin",
    signOut: async () => {
      await supabase?.auth.signOut();
    },
  };

  return (
    <AuthContext.Provider value={value}>
      <ProfileSync>{children}</ProfileSync>
    </AuthContext.Provider>
  );
}

/**
 * Keeps `user_profiles` in step with the session.
 *
 * `POST /me` is idempotent, so this also backfills anyone who signed up before the
 * table existed. Failure is swallowed on purpose — a profile row is bookkeeping, and
 * losing it should not take the site down for someone who is legitimately signed in.
 */
function ProfileSync({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    api.ensureProfile().catch(() => undefined);
  }, []);
  return <>{children}</>;
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 py-32 text-center">
      {children}
    </main>
  );
}

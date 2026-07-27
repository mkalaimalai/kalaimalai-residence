"use client";

/**
 * Sign in to the 2.0 tree. Lives outside the `(v2)` route group so it is not gated by
 * the thing it unlocks.
 */
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase-client";
import { signIn } from "@/lib/auth-v2";
import { AuthShell, Field, FormError, SubmitButton } from "@/components/v2/AuthShell";

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary — it suspends during prerender, and
  // `output: "export"` prerenders every page at build time.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Someone who is already signed in has no business on this page.
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(next);
    });
  }, [router, next]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
      setBusy(false);
      return;
    }
    router.replace(next);
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="The project portfolio is private."
      footer={
        <p>
          No account?{" "}
          <Link href="/signup/" className="text-foreground underline underline-offset-4">
            Create one
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Email"
          type="email"
          value={email}
          autoComplete="email"
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Password"
          type="password"
          value={password}
          autoComplete="current-password"
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <FormError message={error} />
        <SubmitButton busy={busy}>Sign in</SubmitButton>
        {!isSupabaseConfigured && (
          <p className="text-xs text-muted-foreground">
            Supabase env vars are not set, so sign-in will not work in this build.
          </p>
        )}
      </form>
    </AuthShell>
  );
}

/**
 * Only ever follow a same-origin path. `?next=https://evil.example` would otherwise
 * turn the login page into an open redirect, which is exactly the shape phishing wants.
 * A leading `//` is rejected too — the browser reads it as protocol-relative.
 */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

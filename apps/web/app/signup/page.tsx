"use client";

/**
 * Create an account for the 2.0 tree.
 *
 * The password never reaches our API: `supabase.auth.signUp` posts it straight to
 * Supabase Auth, which hashes it and owns the credential. Our `user_profiles` row is
 * written afterwards from the verified token — see `lib/auth-v2.ts`.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { signUp } from "@/lib/auth-v2";
import { AuthShell, Field, FormError, SubmitButton } from "@/components/v2/AuthShell";

// Supabase's own floor is 6; asking for more here is cheap and the error is clearer
// coming from us than bouncing off the API.
const MIN_PASSWORD = 8;

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }

    setBusy(true);
    const result = await signUp(email, password, displayName.trim());
    if (result.error) {
      setError(result.error);
      setBusy(false);
      return;
    }
    // Email confirmation on: there is no session yet, so there is nowhere to go.
    if (result.needsEmailConfirmation) {
      setConfirmEmail(true);
      setBusy(false);
      return;
    }
    router.replace("/");
  }

  if (confirmEmail) {
    return (
      <AuthShell
        title="Check your email"
        subtitle={`We sent a confirmation link to ${email}. Open it to finish signing up.`}
        footer={
          <p>
            Already confirmed?{" "}
            <Link href="/login/" className="text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </p>
        }
      >
        <p className="flex items-center gap-3 text-sm text-muted-foreground">
          <MailCheck size={20} className="shrink-0" />
          You can close this tab — the link works from anywhere.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create an account"
      subtitle="New accounts get read-only access to the portfolio."
      footer={
        <p>
          Already have one?{" "}
          <Link href="/login/" className="text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Name"
          type="text"
          value={displayName}
          autoComplete="name"
          required
          maxLength={80}
          onChange={(e) => setDisplayName(e.target.value)}
        />
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
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Field
          label="Confirm password"
          type="password"
          value={confirm}
          autoComplete="new-password"
          required
          onChange={(e) => setConfirm(e.target.value)}
        />
        <FormError message={error} />
        <SubmitButton busy={busy}>Create account</SubmitButton>
      </form>
    </AuthShell>
  );
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/components/v2/V2AuthGate";
import { Field, FormError, SubmitButton } from "@/components/v2/AuthShell";
import { User, Lock } from "lucide-react";

const MIN_PASSWORD = 8;

export default function ProfilePage() {
  const { email } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    api.me().then((profile) => {
      if (profile.displayName) setDisplayName(profile.displayName);
    }).catch(() => undefined);
  }, []);

  async function onProfileSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      await api.updateProfile(displayName.trim());
      setSuccess("Profile updated.");
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : "Failed to update profile.");
    } finally {
      setBusy(false);
    }
  }

  async function onPasswordSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("The two passwords don't match.");
      return;
    }
    if (!currentPassword) {
      setError("Enter your current password.");
      return;
    }

    setBusy(true);
    try {
      await api.updatePassword(newPassword);
      setSuccess("Password changed.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : "Failed to change password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8 px-4 py-8">
      <header className="space-y-1">
        <h1 className="font-serif text-3xl text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Update your name or change your password.
        </p>
      </header>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-foreground">
          <User size={18} />
          Display name
        </h2>
        <form onSubmit={onProfileSubmit} className="space-y-4">
          <Field
            label="Name"
            type="text"
            value={displayName}
            autoComplete="name"
            required
            maxLength={80}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <FormError message={error} />
          {success && (
            <p className="text-sm text-muted-foreground">{success}</p>
          )}
          <SubmitButton busy={busy}>Save name</SubmitButton>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-foreground">
          <Lock size={18} />
          Change password
        </h2>
        <form onSubmit={onPasswordSubmit} className="space-y-4">
          <Field
            label="Current password"
            type="password"
            value={currentPassword}
            autoComplete="current-password"
            required
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Field
            label="New password"
            type="password"
            value={newPassword}
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Field
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            autoComplete="new-password"
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <FormError message={error} />
          {success && (
            <p className="text-sm text-muted-foreground">{success}</p>
          )}
          <SubmitButton busy={busy}>Change password</SubmitButton>
        </form>
      </div>

      <p className="text-sm text-muted-foreground">
        Signed in as{" "}
        {email ? <span className="text-foreground">{email}</span> : "…"}
      </p>
    </div>
  );
}
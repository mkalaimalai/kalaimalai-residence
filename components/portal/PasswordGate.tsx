"use client";

import { useState, useSyncExternalStore } from "react";
import { Lock } from "lucide-react";

/**
 * Client-side passcode gate for the portal.
 *
 * IMPORTANT: this is OBSCURITY, NOT SECURITY (build doc §6.0). On a static host
 * (GitHub Pages) there is no server to validate a password or set a signed
 * cookie, so the check runs in the browser and the seed data ships in the
 * bundle. Keep genuinely sensitive figures (real negotiated prices, payment
 * details, personal contacts) OUT of /data until real auth (§15) lands.
 *
 * The passcode can be set at build time via NEXT_PUBLIC_PORTAL_PASSCODE.
 */
const PASSCODE = process.env.NEXT_PUBLIC_PORTAL_PASSCODE ?? "anagami";
const STORAGE_KEY = "kr-portal-unlocked";

// Read the unlock flag via an external store so SSG (server snapshot = false)
// hydrates cleanly, then re-renders to the unlocked view in the browser.
function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}
function getStoredUnlocked() {
  return (
    typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY) === "1"
  );
}

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const stored = useSyncExternalStore(subscribe, getStoredUnlocked, () => false);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  if (stored || justUnlocked) return <>{children}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === PASSCODE) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setJustUnlocked(true);
    } else {
      setError(true);
    }
  };

  return (
    <main className="mx-auto flex max-w-sm flex-1 flex-col items-center justify-center gap-6 px-6 py-32 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
        <Lock size={20} />
      </span>
      <div className="space-y-2">
        <h1 className="font-serif text-3xl text-foreground">Private Portal</h1>
        <p className="text-sm text-muted-foreground">
          Enter the passcode to open the project control center.
        </p>
      </div>
      <form onSubmit={submit} className="w-full space-y-3">
        <input
          type="password"
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          placeholder="Passcode"
          aria-label="Portal passcode"
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-center text-foreground outline-none focus:border-foreground"
        />
        {error && <p className="text-sm text-destructive">Incorrect passcode.</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Unlock
        </button>
      </form>
      <p className="text-xs text-muted-foreground">
        Obscurity only — not a security boundary.
      </p>
    </main>
  );
}

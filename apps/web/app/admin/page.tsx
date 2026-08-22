"use client";

/**
 * `/admin` — a short, memorable entry point to the admin app.
 *
 * The admin app is its own origin (`apps/admin`, deployed separately), so this is a
 * cross-origin redirect rather than a route: `window.location`, not the router. It
 * deliberately sits outside the `(v2)` route group, so `V2AuthGate` never runs here —
 * gating a redirect would only mean signing in twice, once on this origin to be sent
 * away, and again on the admin app, which does its own auth.
 *
 * `/portal/admin` redirects here too; that one exists for old bookmarks, this one
 * exists to be typed.
 */
import { useEffect } from "react";
import { ADMIN_URL } from "@/lib/admin-url";

export default function AdminRedirect() {
  useEffect(() => {
    window.location.replace(ADMIN_URL);
  }, []);

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-serif text-2xl text-foreground">Opening Admin</h1>
      <p className="text-sm text-muted-foreground">
        Record management runs as its own app.
      </p>
      <a
        href={ADMIN_URL}
        className="inline-block rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Continue to Admin
      </a>
    </main>
  );
}

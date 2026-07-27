"use client";

/**
 * Record management moved to the **admin app**, which is now a separate endpoint
 * (`apps/admin`, its own origin and its own deploy) rather than a route in this app.
 *
 * This route stays as a redirect because it is the URL the portal sidebar used to link
 * to and is likely bookmarked. The target is a different origin, so this is a
 * `window.location` assignment rather than a router navigation, and a plain `<a>` sits
 * behind it for anyone who lands here before hydration.
 */
import { useEffect } from "react";
import { ADMIN_URL } from "@/lib/admin-url";

export default function PortalAdminMoved() {
  useEffect(() => {
    window.location.replace(ADMIN_URL);
  }, []);

  return (
    <div className="space-y-3">
      <h1 className="font-serif text-2xl text-foreground">Admin has moved</h1>
      <p className="text-sm text-muted-foreground">
        Record management now runs as its own app.
      </p>
      <a
        href={ADMIN_URL}
        className="inline-block rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Go to Admin
      </a>
    </div>
  );
}

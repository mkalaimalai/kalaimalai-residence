"use client";

/**
 * Record management moved to the standalone admin app at `/admin`, which has the
 * two-level navigation and one route per entity.
 *
 * This route stays as a redirect rather than being deleted: it is the URL that was
 * linked from the portal sidebar and is likely bookmarked. There is no server in the
 * static export, so the redirect happens client-side, with a real link behind it for
 * anyone who lands here with JS disabled or before hydration.
 */
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PortalAdminMoved() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="space-y-3">
      <h1 className="font-serif text-2xl text-foreground">Admin has moved</h1>
      <p className="text-sm text-muted-foreground">
        Record management now lives in its own app.
      </p>
      <Link
        href="/admin"
        className="inline-block rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Go to Admin
      </Link>
    </div>
  );
}

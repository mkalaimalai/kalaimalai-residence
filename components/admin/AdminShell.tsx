"use client";

/**
 * Admin app chrome: auth gate → project scope → two-level nav + top bar.
 *
 * Deliberately reuses `SupabaseAuthGate` and `PortalProjectProvider` rather than
 * forking them — the admin app administers the same projects as the portal, and a
 * second source of truth for "which project am I in" is exactly the bug that made the
 * old pinned `PORTAL_PROJECT_ID` painful.
 */
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  PortalProjectProvider,
  PortalProjectPicker,
} from "@/components/portal/PortalProjectProvider";
import { SupabaseAuthGate, useAuth } from "@/components/portal/SupabaseAuthGate";
import { SECTION_BY_KEY, findItem } from "@/lib/admin-nav";
import { AdminSidebar } from "./AdminSidebar";

/** `/admin/catalog/spaces/` → `["catalog", "spaces"]`; tolerates the trailing slash. */
function parsePath(pathname: string): [string | null, string | null] {
  const parts = pathname.split("/").filter(Boolean); // ["admin", section?, item?]
  return [parts[1] ?? null, parts[2] ?? null];
}

function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { email, isAdmin, signOut } = useAuth();
  const [panelOpen, setPanelOpen] = useState(true);

  const [sectionKey, itemKey] = parsePath(pathname);
  const section = sectionKey ? SECTION_BY_KEY[sectionKey] : undefined;
  const item = sectionKey && itemKey ? findItem(sectionKey, itemKey) : null;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar
        activeSection={section?.key ?? "catalog"}
        activeItem={item?.key ?? null}
        panelOpen={panelOpen}
        onTogglePanel={() => setPanelOpen((v) => !v)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-3">
          <nav aria-label="Breadcrumb" className="min-w-0 text-sm">
            <ol className="flex items-center gap-1.5 text-muted-foreground">
              <li>Admin</li>
              {section && (
                <>
                  <li aria-hidden>/</li>
                  <li>{section.label}</li>
                </>
              )}
              {item && (
                <>
                  <li aria-hidden>/</li>
                  <li className="truncate font-medium text-foreground">
                    {item.label}
                  </li>
                </>
              )}
            </ol>
          </nav>

          <div className="flex items-center gap-3">
            <PortalProjectPicker />
            {email && (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {email}
                {!isAdmin && " · read-only"}
              </span>
            )}
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-md border border-border px-2.5 py-1 text-xs text-foreground hover:bg-muted"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthGate>
      <PortalProjectProvider>
        <AdminChrome>{children}</AdminChrome>
      </PortalProjectProvider>
    </SupabaseAuthGate>
  );
}

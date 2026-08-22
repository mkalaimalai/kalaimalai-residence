"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PORTAL_NAV } from "@/lib/nav";
import { ADMIN_URL } from "@/lib/admin-url";
import { cn } from "@kr/api-client";
import { useAuth } from "@/components/v2/V2AuthGate";

/** Left nav for the portal. Active link derived from the current path. */
export function PortalSidebar() {
  const pathname = usePathname();
  const { isAdmin, email, signOut } = useAuth();

  const isActive = (href: string) =>
    href === "/portal" ? pathname === "/portal" : pathname.startsWith(href);

  // Record management moved out of the portal into the admin app, which is a separate
  // endpoint on its own origin (see lib/admin-url). The portal keeps the read-oriented
  // dashboards; admins get a cross-origin link out to editing.
  type NavItem = { label: string; href: string; external: boolean };
  const items: NavItem[] = isAdmin
    ? [
        ...PORTAL_NAV.map((i) => ({ ...i, external: false })),
        { label: "Profile", href: "/portal/profile", external: false },
        { label: "Admin ↗", href: ADMIN_URL, external: true },
      ]
    : [
        ...PORTAL_NAV.map((i) => ({ ...i, external: false })),
        { label: "Profile", href: "/portal/profile", external: false },
      ];

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border p-3 md:w-56 md:flex-col md:overflow-visible md:border-b-0 md:border-r md:p-4">
      <p className="hidden px-3 pb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground md:block">
        Control Center
      </p>
      {items.map((item) => {
        const className = cn(
          "whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors",
          !item.external && isActive(item.href)
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        );
        // The admin app is a different origin, so it gets a plain anchor — next/link
        // is for in-app routes and would never match a typed route here.
        return item.external ? (
          <a key={item.href} href={item.href} className={className}>
            {item.label}
          </a>
        ) : (
          <Link key={item.href} href={item.href} className={className}>
            {item.label}
          </Link>
        );
      })}
      {email && (
        <div className="mt-2 hidden border-t border-border pt-3 md:block">
          <p className="truncate px-3 text-xs text-muted-foreground" title={email}>
            {email}
          </p>
          <button
            onClick={() => void signOut()}
            className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}

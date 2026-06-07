"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PORTAL_NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** Left nav for the portal. Active link derived from the current path. */
export function PortalSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/portal" ? pathname === "/portal" : pathname.startsWith(href);

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border p-3 md:w-56 md:flex-col md:overflow-visible md:border-b-0 md:border-r md:p-4">
      <p className="hidden px-3 pb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground md:block">
        Control Center
      </p>
      {PORTAL_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors",
            isActive(item.href)
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

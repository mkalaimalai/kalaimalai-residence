"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { PUBLIC_NAV, PORTAL_LINK } from "@/lib/nav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@kr/api-client";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Chrome for the 1.0 site and the portal only. The portfolio index (`/`) and the
  // per-project tree (`/[projectId]/**`) carry their own header.
  if (!pathname.startsWith("/1.0") && !pathname.startsWith("/portal")) return null;

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/1.0" className="font-serif text-lg tracking-tight text-foreground">
          Zen Residence
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm transition-colors hover:text-foreground",
                isActive(item.href)
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={PORTAL_LINK.href}
            className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent/40"
          >
            {PORTAL_LINK.label}
          </Link>
          <ThemeToggle />
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-6 py-4">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "py-2 text-sm",
                  isActive(item.href)
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={PORTAL_LINK.href}
              onClick={() => setOpen(false)}
              className="mt-2 py-2 text-sm font-medium text-foreground"
            >
              {PORTAL_LINK.label}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

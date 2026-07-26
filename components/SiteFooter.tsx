"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PUBLIC_NAV } from "@/lib/nav";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/2.0")) return null;

  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div className="max-w-sm space-y-3">
            <p className="font-serif text-lg text-foreground">
              A Contemporary Zen Residence
            </p>
            <p className="text-sm text-muted-foreground">
              A complete design and construction archive of a family home in
              Bengaluru — concept to handover.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-12 gap-y-2">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          Designed by Studio Anagami · Archive built with Next.js
        </p>
      </div>
    </footer>
  );
}

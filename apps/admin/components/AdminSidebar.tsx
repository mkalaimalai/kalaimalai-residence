"use client";

/**
 * Two-level left navigation.
 *
 * Level 1 is a narrow icon rail of sections; level 2 is a panel listing the active
 * section's items under group headings. The rail keeps the whole app one click deep
 * while the panel stays scoped, which is the point of the two-level arrangement — a
 * flat list of 15 entities is what the old portal admin had, and it did not scale.
 *
 * On small screens the rail stays and the panel collapses behind a toggle, so the
 * content column keeps the full width.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Hammer,
  Images,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { ADMIN_NAV, groupItems, type NavSection } from "@/lib/admin-nav";
import { cn } from "@kr/api-client";

const ICONS: Record<NavSection["icon"], LucideIcon> = {
  boxes: Boxes,
  hammer: Hammer,
  receipt: Receipt,
  images: Images,
  settings: Settings,
};

export function AdminSidebar({
  activeSection,
  activeItem,
  panelOpen,
  onTogglePanel,
}: {
  activeSection: string;
  activeItem: string | null;
  panelOpen: boolean;
  onTogglePanel: () => void;
}) {
  const pathname = usePathname();
  const section =
    ADMIN_NAV.find((s) => s.key === activeSection) ?? ADMIN_NAV[0];

  return (
    <div className="flex shrink-0 border-r border-border bg-muted/30">
      {/* Level 1 — section rail */}
      <nav
        aria-label="Sections"
        className="flex w-16 flex-col items-center gap-1 border-r border-border py-3"
      >
        <Link
          href="/"
          aria-label="Admin home"
          className={cn(
            "mb-2 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background font-serif text-sm text-foreground",
            pathname === "/"
              ? "border-foreground"
              : "hover:border-foreground",
          )}
        >
          KR
        </Link>

        {ADMIN_NAV.map((s) => {
          const Icon = ICONS[s.icon];
          const active = s.key === section.key;
          return (
            <Link
              key={s.key}
              href={`/${s.key}/${s.items[0].key}`}
              title={s.label}
              aria-label={s.label}
              aria-current={active ? "true" : undefined}
              className={cn(
                "flex h-10 w-10 flex-col items-center justify-center rounded-lg transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon size={18} />
            </Link>
          );
        })}
      </nav>

      {/* Level 2 — items in the active section */}
      <nav
        aria-label={`${section.label} pages`}
        className={cn(
          "flex-col overflow-y-auto py-4",
          panelOpen ? "flex w-56" : "hidden",
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-2 px-4">
          <div className="min-w-0">
            <p className="font-serif text-base text-foreground">{section.label}</p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              {section.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onTogglePanel}
            aria-label="Collapse navigation"
            className="mt-0.5 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <PanelLeftClose size={15} />
          </button>
        </div>

        {groupItems(section).map(([group, items]) => (
          <div key={group || "_"} className="mb-3">
            {group && (
              <p className="px-4 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {group}
              </p>
            )}
            <ul>
              {items.map((item) => {
                const active = item.key === activeItem;
                return (
                  <li key={item.key}>
                    <Link
                      href={`/${section.key}/${item.key}`}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2 border-l-2 px-4 py-1.5 text-sm transition-colors",
                        active
                          ? "border-foreground bg-muted font-medium text-foreground"
                          : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!panelOpen && (
        <button
          type="button"
          onClick={onTogglePanel}
          aria-label="Expand navigation"
          className="self-start p-3 text-muted-foreground hover:text-foreground"
        >
          <PanelLeftOpen size={15} />
        </button>
      )}
    </div>
  );
}

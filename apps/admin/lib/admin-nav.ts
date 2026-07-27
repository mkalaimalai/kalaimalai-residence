/**
 * Two-level navigation for the admin app.
 *
 * Level 1 is the icon rail (sections); level 2 is the panel listing that section's
 * items, optionally grouped. Every item maps to `/<section>/<item>`, so the URL
 * is shareable and the static export can prerender each one.
 *
 * Item keys are either a key from `ENTITIES` in `lib/admin-schema.ts` (rendered by the
 * generic EntityAdmin) or one of the purpose-built views listed in `CUSTOM_ITEMS`.
 */

export interface NavItem {
  key: string;
  label: string;
  /** Optional heading this item sits under in the level-2 panel. */
  group?: string;
}

export interface NavSection {
  key: string;
  label: string;
  /** lucide-react icon name, resolved in the sidebar. */
  icon: "boxes" | "hammer" | "receipt" | "images" | "settings";
  description: string;
  items: NavItem[];
}

/** Views with a bespoke component rather than the generic entity form. */
export const CUSTOM_ITEMS = ["quotes", "media", "users"] as const;

export const ADMIN_NAV: NavSection[] = [
  {
    key: "catalog",
    label: "Catalog",
    icon: "boxes",
    description: "The project and everything designed into it.",
    items: [
      { key: "projects", label: "Projects", group: "Tenancy" },
      { key: "spaces", label: "Spaces", group: "Design" },
      { key: "domains", label: "Domains", group: "Design" },
      { key: "materials", label: "Materials", group: "Design" },
      { key: "drawings", label: "Drawings", group: "Design" },
      { key: "gallery", label: "Gallery", group: "Published" },
      { key: "lessons", label: "Lessons", group: "Published" },
    ],
  },
  {
    key: "delivery",
    label: "Delivery",
    icon: "hammer",
    description: "Execution on site — who, when, and what went wrong.",
    items: [
      { key: "vendors", label: "Vendors", group: "Supply" },
      { key: "procurement", label: "Procurement", group: "Supply" },
      { key: "progress", label: "Progress", group: "Site" },
      { key: "snags", label: "Snags", group: "Site" },
      { key: "decisions", label: "Decisions", group: "Governance" },
      { key: "warranties", label: "Warranties", group: "Governance" },
    ],
  },
  {
    key: "commercial",
    label: "Commercial",
    icon: "receipt",
    description: "Money: quotes, line items and the bill of quantities.",
    items: [
      { key: "quotes", label: "Quotes" },
      { key: "boq", label: "BOQ" },
    ],
  },
  {
    key: "media",
    label: "Media",
    icon: "images",
    description: "Renderings and drawing sheets, and the files behind them.",
    items: [{ key: "media", label: "Renderings & sheets" }],
  },
  {
    key: "settings",
    label: "Settings",
    icon: "settings",
    // Not project-scoped, unlike every section above: a person belongs to the
    // installation, not to one project.
    description: "Who can sign in, and what they are allowed to do.",
    items: [{ key: "users", label: "Users" }],
  },
];

export const SECTION_BY_KEY: Record<string, NavSection> = Object.fromEntries(
  ADMIN_NAV.map((s) => [s.key, s]),
);

/** Every `/<section>/<item>` pair — the static export needs them all up front. */
export const ADMIN_ROUTES = ADMIN_NAV.flatMap((s) =>
  s.items.map((i) => ({ section: s.key, item: i.key })),
);

export function findItem(section: string, item: string): NavItem | null {
  return SECTION_BY_KEY[section]?.items.find((i) => i.key === item) ?? null;
}

/** Group a section's items in declaration order, preserving first-seen group order. */
export function groupItems(section: NavSection): [string, NavItem[]][] {
  const groups = new Map<string, NavItem[]>();
  for (const item of section.items) {
    const key = item.group ?? "";
    const existing = groups.get(key);
    if (existing) existing.push(item);
    else groups.set(key, [item]);
  }
  return [...groups.entries()];
}

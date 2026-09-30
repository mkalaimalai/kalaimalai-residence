/**
 * Public navigation for the 1.0 tree — only routes that exist, so no link 404s.
 * The 1.0 site lives under `/1.0`; `/` is the multi-project portfolio index.
 */
export const PUBLIC_NAV = [
  { label: "Vision", href: "/1.0/vision" },
  { label: "Spaces", href: "/1.0/spaces" },
  { label: "Domains", href: "/1.0/domains" },
  { label: "Materials", href: "/1.0/materials" },
  { label: "Journey", href: "/1.0/journey" },
  { label: "Gallery", href: "/1.0/gallery" },
  { label: "Lessons", href: "/1.0/lessons" },
] as const;

export const PORTAL_LINK = { label: "Private Portal", href: "/portal" } as const;

/** Portal modules (build doc §6). Order = sidebar order. */
export const PORTAL_NAV = [
  { label: "Dashboard", href: "/portal" },
  { label: "Drawings", href: "/portal/drawings" },
  { label: "Room Matrix", href: "/portal/room-matrix" },
  { label: "Vendors", href: "/portal/vendors" },
  { label: "Procurement", href: "/portal/procurement" },
  { label: "BOQ", href: "/portal/boq" },
  { label: "Decisions", href: "/portal/decisions" },
  { label: "Progress", href: "/portal/progress" },
  { label: "Snags", href: "/portal/snags" },
  { label: "Warranties", href: "/portal/warranties" },
  { label: "Marketplace", href: "/portal/marketplace" },
] as const;

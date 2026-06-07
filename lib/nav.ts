/** Public navigation — only routes that exist, so no link 404s. */
export const PUBLIC_NAV = [
  { label: "Vision", href: "/vision" },
  { label: "Spaces", href: "/spaces" },
  { label: "Domains", href: "/domains" },
  { label: "Materials", href: "/materials" },
  { label: "Journey", href: "/journey" },
  { label: "Gallery", href: "/gallery" },
  { label: "Lessons", href: "/lessons" },
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
] as const;

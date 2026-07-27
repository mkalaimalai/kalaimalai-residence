/**
 * Entity interfaces — the data contract for the whole project (build doc §7).
 *
 * LOCKED after Feature 001. Features 002 (public site) and 003 (portal) read these;
 * they do not change them. All cross-references are `*Ids` / `*Id` (never display
 * names) and resolve to records at render time via `lib/relations`.
 */

export type SpaceStatus = "Concept" | "Design" | "Execution" | "Completed";

export interface Space {
  /** Owning project. Tenant boundary — see api/migrations/002_project_scope.sql. */
  projectId: string;
  id: string;
  slug: string;
  name: string;
  description: string;
  designIntent: string;
  image: string;
  domainIds: string[];
  materialIds: string[];
  furniture: string[]; // free text — not a linked entity
  lighting: string[];
  vendorIds: string[];
  drawingIds: string[];
  decisionIds: string[];
  status: SpaceStatus;
  lessonIds: string[];
}

export type DomainStatus =
  | "Not Started"
  | "In Progress"
  | "Approved"
  | "Completed";

export interface Domain {
  /** Owning project. Tenant boundary — see api/migrations/002_project_scope.sql. */
  projectId: string;
  id: string;
  slug: string;
  name: string;
  description: string;
  spaceIds: string[];
  drawingIds: string[];
  vendorIds: string[];
  status: DomainStatus;
  lessonIds: string[];
}

export type DrawingStatus =
  | "Draft"
  | "For Review"
  | "Approved"
  | "Superseded"
  | "Issued for Construction";

export interface Drawing {
  /** Owning project. Tenant boundary — see api/migrations/002_project_scope.sql. */
  projectId: string;
  id: string;
  title: string;
  domainId: string;
  spaceId: string; // "" if not room-specific
  revision: string;
  date: string; // ISO yyyy-mm-dd
  status: DrawingStatus;
  consultant: string;
  fileUrl: string;
  notes: string;
}

export interface Vendor {
  /** Owning project. Tenant boundary — see api/migrations/002_project_scope.sql. */
  projectId: string;
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  location: string;
  website: string;
  quoteUrl: string;
  finalized: boolean;
  rating: number; // 0–5
  notes: string;
}

export type Currency = "INR" | "EUR" | "USD";

export type ProcurementStatus =
  | "Identified"
  | "Quoted"
  | "Negotiating"
  | "Ordered"
  | "Shipped"
  | "Delivered"
  | "Installed"
  | "Closed";

export interface ProcurementItem {
  /** Owning project. Tenant boundary — see api/migrations/002_project_scope.sql. */
  projectId: string;
  id: string;
  item: string;
  category: string;
  spaceId: string;
  brand: string;
  vendorId: string;
  country: string;
  quantity: number;
  estimatedPrice: number; // store as numbers; format at render
  quotedPrice: number;
  negotiatedPrice: number;
  finalPrice: number;
  currency: Currency;
  status: ProcurementStatus;
  deliveryDate: string;
  installationDate: string;
  warranty: string;
  notes: string;
}

export type DecisionType =
  | "Design"
  | "Material"
  | "Vendor"
  | "Cost"
  | "Technical"
  | "Schedule"
  | "Quality";

export type DecisionStatus = "Open" | "Decided" | "Revisit" | "Closed";

export interface Decision {
  /** Owning project. Tenant boundary — see api/migrations/002_project_scope.sql. */
  projectId: string;
  id: string;
  title: string;
  domainId: string;
  spaceId: string;
  type: DecisionType;
  optionsConsidered: string[];
  finalDecision: string;
  reason: string;
  costImpact: string;
  timeImpact: string;
  qualityImpact: string;
  date: string;
  owner: string;
  status: DecisionStatus;
}

export type SnagPriority = "Low" | "Medium" | "High" | "Critical";

export type SnagStatus = "Open" | "In Progress" | "Fixed" | "Verified" | "Closed";

export interface Snag {
  /** Owning project. Tenant boundary — see api/migrations/002_project_scope.sql. */
  projectId: string;
  id: string;
  spaceId: string;
  category: string;
  description: string;
  photoUrl: string;
  assignedTo: string;
  priority: SnagPriority;
  status: SnagStatus;
  targetClosureDate: string;
  actualClosureDate: string;
  notes: string;
}

export type PaymentStatus =
  | "Unpaid"
  | "Advance Paid"
  | "Part Paid"
  | "Fully Paid";

export interface BOQ {
  /** Owning project. Tenant boundary — see api/migrations/002_project_scope.sql. */
  projectId: string;
  id: string;
  vendorId: string;
  category: string;
  quoteDate: string;
  originalAmount: number;
  negotiatedAmount: number;
  gst: number;
  total: number;
  paymentStatus: PaymentStatus;
  fileUrl: string;
  notes: string;
}

export interface Material {
  /** Owning project. Tenant boundary — see api/migrations/002_project_scope.sql. */
  projectId: string;
  id: string;
  name: string;
  category: string;
  spaceIds: string[];
  vendorId: string;
  status: string;
  image: string;
  notes: string;
}

export interface Lesson {
  /** Owning project. Tenant boundary — see api/migrations/002_project_scope.sql. */
  projectId: string;
  id: string;
  title: string;
  category: string;
  summary: string;
  domainId: string;
  spaceId: string;
  impact: { cost: string; time: string; quality: string; design: string };
}

export interface ProgressEntry {
  /** Owning project. Tenant boundary — see api/migrations/002_project_scope.sql. */
  projectId: string;
  id: string;
  date: string;
  phase: string;
  spaceId: string;
  workCompleted: string;
  photos: string[];
  issues: string;
  nextAction: string;
  owner: string;
  status: string;
}

export interface Warranty {
  /** Owning project. Tenant boundary — see api/migrations/002_project_scope.sql. */
  projectId: string;
  id: string;
  item: string;
  category: string;
  vendorId: string;
  brand: string;
  purchaseDate: string;
  warrantyStart: string;
  warrantyEnd: string;
  invoiceUrl: string;
  manualUrl: string;
  serviceContact: string;
  notes: string;
}

/**
 * Project — single record describing the residence.
 * Public fields are anonymized; `villaNo` / `address` are portal-only (constitution §5).
 */
export interface Project {
  id: string;
  // Public, anonymized identity
  publicTitle: string;
  publicSubtitle: string;
  city: string;
  designer: string;
  direction: string;
  heroImage: string;
  conceptStatement: string;
  // Internal / portal-only
  internalName: string;
  villaNo: string;
  community: string;
  address: string;
  plotArea: string;
  builtUpArea: string;
  floors: number;
  status: string;
  startDate: string;
}

export type GalleryCategory =
  | "render"
  | "drawing"
  | "progress"
  | "final"
  | "material"
  | "furniture"
  | "lighting"
  | "landscape";

export interface GalleryItem {
  /** Owning project. Tenant boundary — see api/migrations/002_project_scope.sql. */
  projectId: string;
  id: string;
  title: string;
  category: GalleryCategory;
  image: string;
  spaceId: string; // "" if not space-specific
  domainId: string; // "" if not domain-specific
  caption: string;
}

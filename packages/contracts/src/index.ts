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

/**
 * ISO 19650 suitability code — what a revision may be *used for*, which is a separate
 * question from where it sits in our workflow (`DrawingStatus`).
 *
 * The distinction is the point of the standard: "Approved" says an internal review
 * finished, while `A1` says the site may build from it. Keeping both means a drawing
 * can be approved-but-not-yet-released without that state being inexpressible.
 *
 *   S0  work in progress, not shared
 *   S1  shared for coordination
 *   S2  shared for information
 *   S3  shared for review and comment
 *   S4  shared for stage approval
 *   A1  authorized and accepted — build from this
 *   B1  partial sign-off, with comments
 *   CR  construction record (as-built)
 */
export type Suitability =
  | "S0"
  | "S1"
  | "S2"
  | "S3"
  | "S4"
  | "A1"
  | "B1"
  | "CR";

export interface Drawing {
  /** Owning project. Tenant boundary — see api/migrations/002_project_scope.sql. */
  projectId: string;
  id: string;
  title: string;
  domainId: string;
  spaceId: string; // "" if not room-specific
  /**
   * Code of the current revision. Kept as a plain string so existing readers are
   * unaffected; the authoritative history is `DrawingRevision[]`, and this mirrors
   * the `code` of the latest one.
   */
  revision: string;
  date: string; // ISO yyyy-mm-dd
  status: DrawingStatus;
  /** ISO 19650 code for the current revision. Mirrors the latest `DrawingRevision`. */
  suitability: Suitability;
  consultant: string;
  fileUrl: string;
  notes: string;
}

/**
 * One issue of a drawing.
 *
 * A `Drawing` used to carry `revision: "R3"` and a single `fileUrl`, which meant R1 and
 * R2 did not exist anywhere — every revision overwrote its predecessor. That makes the
 * questions worth asking unanswerable: when was this approved, what changed, was that
 * wall built from a superseded sheet.
 *
 * So the file belongs to the revision, not to the drawing. The drawing is the stable
 * register entry (IFC calls it `IfcDocumentInformation`); this is the versioned issue,
 * the same shape Speckle models as a commit.
 */
export interface DrawingRevision {
  /** Owning project. Tenant boundary — see api/migrations/002_project_scope.sql. */
  projectId: string;
  id: string;
  drawingId: string;
  /** Revision code as issued: "R1", "P01", "C02". Unique per drawing. */
  code: string;
  issuedOn: string; // ISO yyyy-mm-dd
  suitability: Suitability;
  /** The file as issued. Superseded revisions keep their own file. */
  fileUrl: string;
  /** Revision this one replaces. "" for the first issue. */
  supersedesId: string;
  issuedBy: string;
  changeNote: string;
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

/**
 * API-only entities (architecture.md §6) — Quote→PO flow, deliveries, inspections and
 * the notification audit log. These exist only in the backend (no seed modules), so they
 * live here rather than in the locked `types/index.ts` contract. Shapes mirror the
 * camelCase wire format of the FastAPI Pydantic response models.
 */

export interface Quote {
  id: string;
  projectId: string;
  vendorId: string;
  boqId: string;
  quoteNumber: string;
  quoteDate: string;
  validUntil: string;
  totalAmount: number;
  currency: string;
  taxAmount: number;
  scopeSummary: string;
  terms: string;
  documentId: string;
  /** Pending → Accepted | Rejected | Negotiated (set by the quote actions). */
  comparisonStatus: string;
  approvedAmount: number;
  approvedBy: string;
  approvalNote: string;
}

export interface QuoteLineItem {
  id: string;
  quoteId: string;
  boqLineId: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  brand: string;
  specification: string;
  inclusions: string;
  exclusions: string;
  negotiationTargetPrice: number;
}

export interface PurchaseOrder {
  id: string;
  projectId: string;
  quoteId: string;
  vendorId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  notes: string;
}

/** Result of POST /quotes/{id}/approve — the §9 Quote-approval → PO flow. */
export interface QuoteApproval {
  quote: Quote;
  purchaseOrder: PurchaseOrder;
  message: string;
}

export interface Delivery {
  id: string;
  purchaseOrderId: string;
  projectId: string;
  expectedDate: string;
  actualDate: string;
  status: string;
  notes: string;
}

export interface Inspection {
  id: string;
  spaceId: string;
  workPackageId: string;
  inspector: string;
  inspectionDate: string;
  result: string;
  notes: string;
}

export interface NotificationRecord {
  id: string;
  channel: string;
  recipient: string;
  subject: string;
  body: string;
  status: string;
  relatedEntity: string;
  createdAt: string;
}

/**
 * Rendering / drawing-sheet media sets (`GET|POST|PATCH|DELETE /media-sets`). The shape
 * deliberately mirrors `RenderingSet` in `data/renderings.ts` so `RenderingGallery` can
 * render DB rows unchanged. Owner is project-level unless `domainId`/`spaceId` is set.
 */
export type MediaKind = "rendering" | "drawing_sheet";

export interface MediaSubsection {
  title: string;
  images: string[];
}

export interface MediaSet {
  id: string;
  projectId: string;
  kind: MediaKind;
  title: string;
  width: number;
  height: number;
  images: string[];
  subsections: MediaSubsection[] | null;
  domainId: string | null;
  spaceId: string | null;
  sortOrder: number;
}

/** One file uploaded to Drive via `POST /uploads` or `/media-sets/{id}/files`. */
export interface UploadedFile {
  name: string;
  fileId: string;
  url: string;
  mimeType: string;
  size: number;
}

/** App role. Authorization reads `app_metadata.role` on the token; the profile row
 * below only mirrors it for display. */
export type UserRole = "viewer" | "admin";

/** A `user_profiles` row — the app's record of a signed-up person. Credentials,
 * email verification and sessions all stay in Supabase Auth. */
export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type ProfessionalType =
  | "Architect"
  | "Interior Designer"
  | "Structural Consultant"
  | "Electrical Consultant"
  | "Plumbing Consultant"
  | "HVAC Consultant"
  | "Lighting Consultant"
  | "Automation Specialist"
  | "Landscape Architect"
  | "General Contractor"
  | "Subcontractor"
  | "Supplier"
  | "Trade";

export type ProfessionalStatus = "Active" | "Inactive" | "On Hold" | "Blacklisted";

export interface Professional {
  projectId: string;
  id: string;
  userId?: string;
  name: string;
  company: string;
  type: ProfessionalType;
  specializations: string[];
  contactPerson: string;
  phone: string;
  email: string;
  location: string;
  serviceAreas: string[];
  website: string;
  portfolioImages: string[];
  certifications: string[];
  licenseNumber: string;
  rating: number;
  reviewCount: number;
  status: ProfessionalStatus;
  availability: string;
  hourlyRate?: number;
  currency?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalReview {
  projectId: string;
  id: string;
  professionalId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  title: string;
  content: string;
  projectName: string;
  date: string;
  verified: boolean;
}

export type BriefStatus = "Draft" | "Published" | "In Progress" | "Closed";

export interface ProjectBrief {
  projectId: string;
  id: string;
  title: string;
  description: string;
  requiredProfessionalTypes: ProfessionalType[];
  budgetMin: number;
  budgetMax: number;
  budgetCurrency: string;
  timeline: string;
  location: string;
  status: BriefStatus;
  responses: BriefResponse[];
  createdAt: string;
  updatedAt: string;
}

export type ResponseStatus = "Pending" | "Shortlisted" | "Rejected" | "Accepted";

export interface BriefResponse {
  id: string;
  briefId: string;
  professionalId: string;
  professionalName: string;
  proposedFee: number;
  currency: string;
  timeline: string;
  approach: string;
  portfolioItems: string[];
  status: ResponseStatus;
  submittedAt: string;
}

/**
 * Admin field registry — drives the generic EntityForm so there is no per-entity form
 * code. Field shapes are derived from the locked `types/index.ts`; enum options mirror
 * the union types there. Relation fields (`*Id` / `*Ids`) are id-select / id-multiselect
 * inputs populated from live reference lists, so admins pick by name but store ids
 * (constitution rule 2 — relations by id, never display name).
 */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "date"
  | "enum"
  | "idSelect"
  | "idMultiSelect"
  | "stringList";

/** Reference collections loaded once for relation selects. */
export type RefKey =
  | "spaces"
  | "domains"
  | "vendors"
  | "materials"
  | "drawings"
  | "decisions"
  | "lessons";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  options?: readonly string[];
  ref?: RefKey;
}

export interface EntityDef {
  key: string;
  label: string;
  endpoint: string;
  titleField: string;
  fields: FieldDef[];
  /** Map an API row → flat form values (default: identity). */
  fromRow?: (row: Record<string, unknown>) => Record<string, unknown>;
  /** Map flat form values → request body (default: identity). */
  toPayload?: (values: Record<string, unknown>) => Record<string, unknown>;
}

const SPACE_STATUS = ["Concept", "Design", "Execution", "Completed"] as const;
const DOMAIN_STATUS = ["Not Started", "In Progress", "Approved", "Completed"] as const;
const DRAWING_STATUS = [
  "Draft", "For Review", "Approved", "Superseded", "Issued for Construction",
] as const;
const PROCUREMENT_STATUS = [
  "Identified", "Quoted", "Negotiating", "Ordered", "Shipped", "Delivered",
  "Installed", "Closed",
] as const;
const CURRENCY = ["INR", "EUR", "USD"] as const;
const DECISION_TYPE = [
  "Design", "Material", "Vendor", "Cost", "Technical", "Schedule", "Quality",
] as const;
const DECISION_STATUS = ["Open", "Decided", "Revisit", "Closed"] as const;
const SNAG_PRIORITY = ["Low", "Medium", "High", "Critical"] as const;
const SNAG_STATUS = ["Open", "In Progress", "Fixed", "Verified", "Closed"] as const;
const PAYMENT_STATUS = ["Unpaid", "Advance Paid", "Part Paid", "Fully Paid"] as const;
const GALLERY_CATEGORY = [
  "render", "drawing", "progress", "final", "material", "furniture",
  "lighting", "landscape",
] as const;

export const ENTITIES: EntityDef[] = [
  {
    key: "projects",
    label: "Projects",
    endpoint: "/projects",
    titleField: "publicTitle",
    fields: [
      { name: "publicTitle", label: "Public title", type: "text" },
      { name: "publicSubtitle", label: "Public subtitle", type: "text" },
      { name: "city", label: "City", type: "text" },
      { name: "designer", label: "Designer", type: "text" },
      { name: "direction", label: "Direction", type: "textarea" },
      { name: "heroImage", label: "Hero image", type: "text" },
      { name: "conceptStatement", label: "Concept statement", type: "textarea" },
      { name: "plotArea", label: "Plot area", type: "text" },
      { name: "builtUpArea", label: "Built-up area", type: "text" },
      { name: "floors", label: "Floors", type: "number" },
      { name: "status", label: "Status", type: "text" },
      { name: "startDate", label: "Start date", type: "date" },
      { name: "internalName", label: "Internal name (private)", type: "text" },
      { name: "villaNo", label: "Villa no. (private)", type: "text" },
      { name: "community", label: "Community (private)", type: "text" },
      { name: "address", label: "Address (private)", type: "text" },
    ],
  },
  {
    key: "spaces",
    label: "Spaces",
    endpoint: "/spaces",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "slug", label: "Slug (auto if blank)", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "designIntent", label: "Design intent", type: "textarea" },
      { name: "image", label: "Image", type: "text" },
      { name: "status", label: "Status", type: "enum", options: SPACE_STATUS },
      { name: "domainIds", label: "Domains", type: "idMultiSelect", ref: "domains" },
      { name: "materialIds", label: "Materials", type: "idMultiSelect", ref: "materials" },
      { name: "vendorIds", label: "Vendors", type: "idMultiSelect", ref: "vendors" },
      { name: "drawingIds", label: "Drawings", type: "idMultiSelect", ref: "drawings" },
      { name: "decisionIds", label: "Decisions", type: "idMultiSelect", ref: "decisions" },
      { name: "lessonIds", label: "Lessons", type: "idMultiSelect", ref: "lessons" },
      { name: "furniture", label: "Furniture (one per line)", type: "stringList" },
      { name: "lighting", label: "Lighting (one per line)", type: "stringList" },
    ],
  },
  {
    key: "domains",
    label: "Domains",
    endpoint: "/domains",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "slug", label: "Slug (auto if blank)", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "status", label: "Status", type: "enum", options: DOMAIN_STATUS },
      { name: "spaceIds", label: "Spaces", type: "idMultiSelect", ref: "spaces" },
      { name: "drawingIds", label: "Drawings", type: "idMultiSelect", ref: "drawings" },
      { name: "vendorIds", label: "Vendors", type: "idMultiSelect", ref: "vendors" },
      { name: "lessonIds", label: "Lessons", type: "idMultiSelect", ref: "lessons" },
    ],
  },
  {
    key: "vendors",
    label: "Vendors",
    endpoint: "/vendors",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "category", label: "Category", type: "text" },
      { name: "contactPerson", label: "Contact person", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "location", label: "Location", type: "text" },
      { name: "website", label: "Website", type: "text" },
      { name: "quoteUrl", label: "Quote URL", type: "text" },
      { name: "finalized", label: "Finalized", type: "boolean" },
      { name: "rating", label: "Rating (0–5)", type: "number" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "drawings",
    label: "Drawings",
    endpoint: "/drawings",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "domainId", label: "Domain", type: "idSelect", ref: "domains" },
      { name: "spaceId", label: "Space", type: "idSelect", ref: "spaces" },
      { name: "revision", label: "Revision", type: "text" },
      { name: "date", label: "Date", type: "date" },
      { name: "status", label: "Status", type: "enum", options: DRAWING_STATUS },
      { name: "consultant", label: "Consultant", type: "text" },
      { name: "fileUrl", label: "File URL", type: "text" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "decisions",
    label: "Decisions",
    endpoint: "/decisions",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "domainId", label: "Domain", type: "idSelect", ref: "domains" },
      { name: "spaceId", label: "Space", type: "idSelect", ref: "spaces" },
      { name: "type", label: "Type", type: "enum", options: DECISION_TYPE },
      { name: "optionsConsidered", label: "Options (one per line)", type: "stringList" },
      { name: "finalDecision", label: "Final decision", type: "textarea" },
      { name: "reason", label: "Reason", type: "textarea" },
      { name: "costImpact", label: "Cost impact", type: "text" },
      { name: "timeImpact", label: "Time impact", type: "text" },
      { name: "qualityImpact", label: "Quality impact", type: "text" },
      { name: "date", label: "Date", type: "date" },
      { name: "owner", label: "Owner", type: "text" },
      { name: "status", label: "Status", type: "enum", options: DECISION_STATUS },
    ],
  },
  {
    key: "snags",
    label: "Snags",
    endpoint: "/snags",
    titleField: "description",
    fields: [
      { name: "spaceId", label: "Space", type: "idSelect", ref: "spaces" },
      { name: "category", label: "Category", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "photoUrl", label: "Photo URL", type: "text" },
      { name: "assignedTo", label: "Assigned to", type: "text" },
      { name: "priority", label: "Priority", type: "enum", options: SNAG_PRIORITY },
      { name: "status", label: "Status", type: "enum", options: SNAG_STATUS },
      { name: "targetClosureDate", label: "Target closure", type: "date" },
      { name: "actualClosureDate", label: "Actual closure", type: "date" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "boq",
    label: "BOQ",
    endpoint: "/boq",
    titleField: "category",
    fields: [
      { name: "vendorId", label: "Vendor", type: "idSelect", ref: "vendors" },
      { name: "category", label: "Category", type: "text" },
      { name: "quoteDate", label: "Quote date", type: "date" },
      { name: "originalAmount", label: "Original amount", type: "number" },
      { name: "negotiatedAmount", label: "Negotiated amount", type: "number" },
      { name: "gst", label: "GST", type: "number" },
      { name: "total", label: "Total", type: "number" },
      { name: "paymentStatus", label: "Payment status", type: "enum", options: PAYMENT_STATUS },
      { name: "fileUrl", label: "File URL", type: "text" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "procurement",
    label: "Procurement",
    endpoint: "/procurement",
    titleField: "item",
    fields: [
      { name: "item", label: "Item", type: "text" },
      { name: "category", label: "Category", type: "text" },
      { name: "spaceId", label: "Space", type: "idSelect", ref: "spaces" },
      { name: "brand", label: "Brand", type: "text" },
      { name: "vendorId", label: "Vendor", type: "idSelect", ref: "vendors" },
      { name: "country", label: "Country", type: "text" },
      { name: "quantity", label: "Quantity", type: "number" },
      { name: "estimatedPrice", label: "Estimated price", type: "number" },
      { name: "quotedPrice", label: "Quoted price", type: "number" },
      { name: "negotiatedPrice", label: "Negotiated price", type: "number" },
      { name: "finalPrice", label: "Final price", type: "number" },
      { name: "currency", label: "Currency", type: "enum", options: CURRENCY },
      { name: "status", label: "Status", type: "enum", options: PROCUREMENT_STATUS },
      { name: "deliveryDate", label: "Delivery date", type: "date" },
      { name: "installationDate", label: "Installation date", type: "date" },
      { name: "warranty", label: "Warranty", type: "text" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "materials",
    label: "Materials",
    endpoint: "/materials",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "category", label: "Category", type: "text" },
      { name: "spaceIds", label: "Spaces", type: "idMultiSelect", ref: "spaces" },
      { name: "vendorId", label: "Vendor", type: "idSelect", ref: "vendors" },
      { name: "status", label: "Status", type: "text" },
      { name: "image", label: "Image", type: "text" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "lessons",
    label: "Lessons",
    endpoint: "/lessons",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "category", label: "Category", type: "text" },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "domainId", label: "Domain", type: "idSelect", ref: "domains" },
      { name: "spaceId", label: "Space", type: "idSelect", ref: "spaces" },
      { name: "impactCost", label: "Impact — cost", type: "text" },
      { name: "impactTime", label: "Impact — time", type: "text" },
      { name: "impactQuality", label: "Impact — quality", type: "text" },
      { name: "impactDesign", label: "Impact — design", type: "text" },
    ],
    fromRow: (row) => {
      const impact = (row.impact ?? {}) as Record<string, unknown>;
      return {
        ...row,
        impactCost: impact.cost ?? "",
        impactTime: impact.time ?? "",
        impactQuality: impact.quality ?? "",
        impactDesign: impact.design ?? "",
      };
    },
    toPayload: (v) => {
      const { impactCost, impactTime, impactQuality, impactDesign, ...rest } = v;
      return {
        ...rest,
        impact: {
          cost: impactCost ?? "",
          time: impactTime ?? "",
          quality: impactQuality ?? "",
          design: impactDesign ?? "",
        },
      };
    },
  },
  {
    key: "progress",
    label: "Progress",
    endpoint: "/progress",
    titleField: "workCompleted",
    fields: [
      { name: "date", label: "Date", type: "date" },
      { name: "phase", label: "Phase", type: "text" },
      { name: "spaceId", label: "Space", type: "idSelect", ref: "spaces" },
      { name: "workCompleted", label: "Work completed", type: "textarea" },
      { name: "photos", label: "Photos (one per line)", type: "stringList" },
      { name: "issues", label: "Issues", type: "textarea" },
      { name: "nextAction", label: "Next action", type: "textarea" },
      { name: "owner", label: "Owner", type: "text" },
      { name: "status", label: "Status", type: "text" },
    ],
  },
  {
    key: "warranties",
    label: "Warranties",
    endpoint: "/warranties",
    titleField: "item",
    fields: [
      { name: "item", label: "Item", type: "text" },
      { name: "category", label: "Category", type: "text" },
      { name: "vendorId", label: "Vendor", type: "idSelect", ref: "vendors" },
      { name: "brand", label: "Brand", type: "text" },
      { name: "purchaseDate", label: "Purchase date", type: "date" },
      { name: "warrantyStart", label: "Warranty start", type: "date" },
      { name: "warrantyEnd", label: "Warranty end", type: "date" },
      { name: "invoiceUrl", label: "Invoice URL", type: "text" },
      { name: "manualUrl", label: "Manual URL", type: "text" },
      { name: "serviceContact", label: "Service contact", type: "text" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "gallery",
    label: "Gallery",
    endpoint: "/gallery",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "category", label: "Category", type: "enum", options: GALLERY_CATEGORY },
      { name: "image", label: "Image", type: "text" },
      { name: "spaceId", label: "Space", type: "idSelect", ref: "spaces" },
      { name: "domainId", label: "Domain", type: "idSelect", ref: "domains" },
      { name: "caption", label: "Caption", type: "textarea" },
    ],
  },
];

export const ENTITY_BY_KEY: Record<string, EntityDef> = Object.fromEntries(
  ENTITIES.map((e) => [e.key, e]),
);

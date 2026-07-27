/**
 * Controlled construction vocabulary — schema.md §4.
 *
 * The agreed terms for project domains, work-package types, document types and product
 * categories. Used as `keywords` in the Schema.org JSON-LD layer and as a reference for
 * categorising content. Public-safe (no project-identifying data).
 */

export const PROJECT_DOMAINS = [
  "Architecture", "Structural", "Civil", "Plumbing", "Electrical", "Lighting",
  "False Ceiling", "Carpentry", "Flooring", "Painting", "Wall Treatment",
  "Furniture", "Kitchen", "Appliances", "Automation", "HVAC", "Security",
  "Landscaping", "Procurement", "Project Management", "Quality Control", "Handover",
] as const;

export const WORK_PACKAGE_TYPES = [
  "Design", "Consulting", "Supply", "Installation", "Fabrication", "Inspection",
  "Repair", "Maintenance", "Warranty",
] as const;

export const DOCUMENT_TYPES = [
  "Architectural Plan", "Structural Drawing", "Electrical Drawing", "Plumbing Layout",
  "Lighting Plan", "False Ceiling Plan", "Carpentry Drawing", "Furniture Layout",
  "Material Specification", "BOQ", "Quotation", "Invoice", "Purchase Order",
  "Warranty Document", "Site Photo", "Progress Report", "Approval Note", "Snag List",
  "Handover Document",
] as const;

export const PRODUCT_CATEGORIES = [
  "Tile", "Stone", "Wood", "Plywood", "Veneer", "Paint", "Light Fixture", "Switch",
  "Wire", "Sanitaryware", "Faucet", "Furniture", "Appliance", "Hardware", "Glass",
  "Metal", "Automation Device", "Sensor", "Curtain Motor", "Outdoor Fixture",
  "Landscape Product",
] as const;

/** Keywords for the residence Project JSON-LD (public, generic). */
export const RESIDENCE_KEYWORDS = [
  "home construction", "residential architecture", "interior design",
  "vendor management", "Bangalore home project", "home automation", "lighting design",
] as const;

import type { Vendor } from "@/types";

/**
 * Vendors. Contact details are representative placeholders; `// TODO: confirm`
 * marks fields awaiting the homeowner's actuals. Sensitive figures live in BOQ/
 * procurement, not here.
 */
export const vendors: Vendor[] = [
  {
    projectId: "proj-kr",
    id: "ven-paint",
    name: "Bengaluru Painting & Finishes",
    category: "Painting & Microcement",
    contactPerson: "Ramesh K.", // TODO: confirm
    phone: "+91 90000 00001", // TODO: confirm
    email: "contact@blr-finishes.example",
    location: "Bengaluru",
    website: "",
    quoteUrl: "",
    finalized: true,
    rating: 4,
    notes: "Quoted painting + microcement application. Negotiated ~8% off list.",
  },
  {
    projectId: "proj-kr",
    id: "ven-steel",
    name: "Precision Steel Fabricators",
    category: "Metal Fabrication",
    contactPerson: "Imran S.", // TODO: confirm
    phone: "+91 90000 00002", // TODO: confirm
    email: "works@precisionsteel.example",
    location: "Bengaluru",
    website: "",
    quoteUrl: "",
    finalized: false,
    rating: 4,
    notes:
      "Steel staircase fabrication + terrace pergola. Comparing against an RCC stair option.",
  },
  {
    projectId: "proj-kr",
    id: "ven-lighting",
    name: "Lumen Lighting Studio",
    category: "Lighting Supply",
    contactPerson: "Anita R.", // TODO: confirm
    phone: "+91 90000 00003", // TODO: confirm
    email: "sales@lumenstudio.example",
    location: "Bengaluru",
    website: "",
    quoteUrl: "",
    finalized: false,
    rating: 5,
    notes: "Architectural fixtures quotation — line items per room.",
  },
  {
    projectId: "proj-kr",
    id: "ven-sync",
    name: "Sync Technologies",
    category: "Home Automation (KNX / BAB)",
    contactPerson: "Sales Desk", // TODO: confirm
    phone: "+91 90000 00004", // TODO: confirm
    email: "info@synctech.example",
    location: "Bengaluru",
    website: "",
    quoteUrl: "",
    finalized: true,
    rating: 5,
    notes:
      "Selected automation partner — KNX backbone with BAB integration. See decision dec-automation.",
  },
  {
    projectId: "proj-kr",
    id: "ven-htp",
    name: "Home Theatre Plus",
    category: "Home Automation (KNX / Control4)",
    contactPerson: "Sales Desk", // TODO: confirm
    phone: "+91 90000 00005", // TODO: confirm
    email: "info@hometheatreplus.example",
    location: "Bengaluru",
    website: "",
    quoteUrl: "",
    finalized: false,
    rating: 4,
    notes:
      "Alternative automation bid — KNX with Control4 AV. Strong AV, higher licensing cost.",
  },
  {
    projectId: "proj-kr",
    id: "ven-italy",
    name: "Italian Furniture Export House",
    category: "Furniture (Import — Italy)",
    contactPerson: "Export Desk", // TODO: confirm
    phone: "+39 000 000 000", // TODO: confirm
    email: "export@italyfurniture.example",
    location: "Italy",
    website: "",
    quoteUrl: "",
    finalized: false,
    rating: 5,
    notes:
      "13 candidate brands, EUR ex-works. Landed INR ≈ 1.7–1.8× after freight/duty/GST.",
  },
  {
    projectId: "proj-kr",
    id: "ven-turkey",
    name: "Turkey Furniture & Joinery",
    category: "Furniture (Import — Turkey)",
    contactPerson: "Export Desk", // TODO: confirm
    phone: "+90 000 000 000", // TODO: confirm
    email: "export@turkeyfurniture.example",
    location: "Türkiye",
    website: "",
    quoteUrl: "",
    finalized: false,
    rating: 4,
    notes: "Upholstery, outdoor lounge and kitchen joinery options.",
  },
  {
    projectId: "proj-kr",
    id: "ven-stone",
    name: "Heritage Stone & Marble",
    category: "Stone & Flooring",
    contactPerson: "Yard Manager", // TODO: confirm
    phone: "+91 90000 00006", // TODO: confirm
    email: "sales@heritagestone.example",
    location: "Bengaluru",
    website: "",
    quoteUrl: "",
    finalized: false,
    rating: 4,
    notes: "Marble and natural stone for living, baths and the courtyard edge.",
  },
];

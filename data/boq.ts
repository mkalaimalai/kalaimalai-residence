import type { BOQ } from "@/types";

/**
 * Bills of Quantity tied to vendors. Amounts in INR. Values are representative
 * pending the homeowner's actual quotes (`// TODO: confirm`). GST at 18%.
 */
export const boqs: BOQ[] = [
  {
    projectId: "proj-kr",
    id: "boq-paint",
    vendorId: "ven-paint",
    category: "Painting & Microcement",
    quoteDate: "2025-02-10",
    originalAmount: 850000, // TODO: confirm
    negotiatedAmount: 782000,
    gst: 140760,
    total: 922760,
    paymentStatus: "Advance Paid",
    fileUrl: "",
    notes: "Whole-house painting + microcement to living, baths, master.",
  },
  {
    projectId: "proj-kr",
    id: "boq-steel",
    vendorId: "ven-steel",
    category: "Steel Staircase Fabrication",
    quoteDate: "2025-03-05",
    originalAmount: 640000, // TODO: confirm
    negotiatedAmount: 595000,
    gst: 107100,
    total: 702100,
    paymentStatus: "Unpaid",
    fileUrl: "",
    notes: "Folded-plate steel stair + terrace pergola fabrication & install.",
  },
  {
    projectId: "proj-kr",
    id: "boq-lighting",
    vendorId: "ven-lighting",
    category: "Architectural Lighting",
    quoteDate: "2025-03-20",
    originalAmount: 520000, // TODO: confirm
    negotiatedAmount: 498000,
    gst: 89640,
    total: 587640,
    paymentStatus: "Unpaid",
    fileUrl: "",
    notes: "Fixtures only (excludes wiring). Line items per room.",
  },
];

import type { Warranty } from "@/types";

export const warranties: Warranty[] = [
  {
    projectId: "proj-kr",
    id: "war-lighting",
    item: "Architectural Lighting Fixtures",
    category: "Lighting",
    vendorId: "ven-lighting",
    brand: "Lumen Studio", // TODO: confirm
    purchaseDate: "2025-04-01",
    warrantyStart: "2025-04-01",
    warrantyEnd: "2027-04-01",
    invoiceUrl: "",
    manualUrl: "",
    serviceContact: "+91 90000 00003", // TODO: confirm
    notes: "2-year driver & fixture warranty.",
  },
  {
    projectId: "proj-kr",
    id: "war-automation",
    item: "KNX Automation System",
    category: "Home Automation",
    vendorId: "ven-sync",
    brand: "KNX / BAB", // TODO: confirm
    purchaseDate: "2025-04-15",
    warrantyStart: "2025-04-15",
    warrantyEnd: "2030-04-15",
    invoiceUrl: "",
    manualUrl: "",
    serviceContact: "+91 90000 00004", // TODO: confirm
    notes: "5-year hardware warranty; AMC optional after year 1.",
  },
  {
    projectId: "proj-kr",
    id: "war-appliances",
    item: "Kitchen Appliances Suite",
    category: "Appliances",
    vendorId: "ven-turkey",
    brand: "TBD", // TODO: confirm
    purchaseDate: "2025-05-01",
    warrantyStart: "2025-05-01",
    warrantyEnd: "2027-05-01",
    invoiceUrl: "",
    manualUrl: "",
    serviceContact: "+90 000 000 000", // TODO: confirm
    notes: "2-year standard manufacturer warranty.",
  },
];

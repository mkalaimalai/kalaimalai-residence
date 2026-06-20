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

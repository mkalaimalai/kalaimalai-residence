import type { QuoteLineItem } from "@/lib/api-types";
import { formatINR } from "@kr/api-client";
import { ApiError } from "@/lib/api-client";

export interface RefRow {
  id: string;
  name: string;
}

export const CURRENCIES = ["INR", "EUR", "USD"] as const;
export const COMPARISON_STATUSES = ["Pending", "Accepted", "Rejected", "Negotiated"] as const;

export const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground";
export const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";
export const primaryButton =
  "rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50";
export const secondaryButton =
  "rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted disabled:opacity-50";

export const money = (amount: number, currency: string): string => {
  if (!amount) return "\u2014";
  if (currency === "EUR") return `\u20AC${amount.toLocaleString("en-IN")}`;
  if (currency === "USD") return `$${amount.toLocaleString("en-IN")}`;
  return formatINR(amount);
};

export const errorMessage = (err: unknown, fallback: string): string =>
  err instanceof ApiError ? err.message : err instanceof Error ? err.message : fallback;

export interface HeaderDraft {
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
  comparisonStatus: string;
}

export const emptyHeader = (): HeaderDraft => ({
  vendorId: "",
  boqId: "",
  quoteNumber: "",
  quoteDate: "",
  validUntil: "",
  totalAmount: 0,
  currency: "INR",
  taxAmount: 0,
  scopeSummary: "",
  terms: "",
  documentId: "",
  comparisonStatus: "Pending",
});

export interface LineDraft {
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

export const emptyLine = (): LineDraft => ({
  boqLineId: "",
  description: "",
  quantity: 0,
  unit: "",
  unitPrice: 0,
  totalPrice: 0,
  brand: "",
  specification: "",
  inclusions: "",
  exclusions: "",
  negotiationTargetPrice: 0,
});

export const lineToDraft = (li: QuoteLineItem): LineDraft => ({
  boqLineId: li.boqLineId,
  description: li.description,
  quantity: li.quantity,
  unit: li.unit,
  unitPrice: li.unitPrice,
  totalPrice: li.totalPrice,
  brand: li.brand,
  specification: li.specification,
  inclusions: li.inclusions,
  exclusions: li.exclusions,
  negotiationTargetPrice: li.negotiationTargetPrice,
});

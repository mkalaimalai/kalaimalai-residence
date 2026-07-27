"use client";

import type { ProcurementItem } from "@/types";
import { DataTable, type Column, type Filter } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { formatINR, landedFromEUR } from "@/lib/utils";

// Build-time FX assumption for landed-cost estimates (EUR ex-works → INR).
// Obscurity-only seed data; refine when real invoices land.
const EUR_TO_INR = 92;

const unitPrice = (p: ProcurementItem): number =>
  p.negotiatedPrice || p.quotedPrice || p.estimatedPrice;

/** Estimated landed INR per the build doc's 1.75× ex-works rule for EUR goods. */
const landedINR = (p: ProcurementItem): number => {
  const unit = unitPrice(p);
  const inr = p.currency === "EUR" ? landedFromEUR(unit, EUR_TO_INR) : unit;
  return inr * (p.quantity || 1);
};

const fmtUnit = (p: ProcurementItem): string => {
  const unit = unitPrice(p);
  if (!unit) return "—";
  if (p.currency === "EUR") return `€${unit.toLocaleString("en-IN")}`;
  if (p.currency === "USD") return `$${unit.toLocaleString("en-IN")}`;
  return formatINR(unit);
};

export function ProcurementTable({
  rows,
  spaceNames,
  vendorNames,
}: {
  rows: ProcurementItem[];
  spaceNames: Record<string, string>;
  vendorNames: Record<string, string>;
}) {
  const columns: Column<ProcurementItem>[] = [
    {
      id: "item",
      header: "Item",
      cell: (p) => (
        <span>
          <span className="font-medium text-foreground">{p.item}</span>
          <span className="block text-xs text-muted-foreground">
            {p.brand}
            {p.country ? ` · ${p.country}` : ""}
          </span>
        </span>
      ),
      sortValue: (p) => p.item,
    },
    { id: "space", header: "Space", cell: (p) => (p.spaceId ? spaceNames[p.spaceId] ?? "—" : "—") },
    { id: "vendor", header: "Vendor", cell: (p) => vendorNames[p.vendorId] ?? "—" },
    { id: "qty", header: "Qty", align: "right", cell: (p) => p.quantity, sortValue: (p) => p.quantity },
    {
      id: "unit",
      header: "Unit (ex-works)",
      align: "right",
      cell: (p) => fmtUnit(p),
      sortValue: (p) => unitPrice(p),
    },
    {
      id: "landed",
      header: "Landed (est. ₹)",
      align: "right",
      cell: (p) => (
        <span className="font-medium text-foreground">{formatINR(landedINR(p))}</span>
      ),
      sortValue: (p) => landedINR(p),
    },
    {
      id: "status",
      header: "Status",
      cell: (p) => <StatusBadge status={p.status} />,
      sortValue: (p) => p.status,
    },
  ];

  const filters: Filter<ProcurementItem>[] = [
    { id: "status", label: "Status", value: (p) => p.status },
    { id: "country", label: "Country", value: (p) => p.country || "—" },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      filters={filters}
      searchValues={(p) => `${p.item} ${p.brand} ${p.category} ${vendorNames[p.vendorId] ?? ""}`}
      initialSort={{ id: "landed", dir: "desc" }}
    />
  );
}

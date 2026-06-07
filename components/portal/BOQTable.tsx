"use client";

import type { BOQ } from "@/types";
import { DataTable, type Column, type Filter } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { formatINR } from "@/lib/utils";

export function BOQTable({
  rows,
  vendorNames,
}: {
  rows: BOQ[];
  vendorNames: Record<string, string>;
}) {
  const columns: Column<BOQ>[] = [
    {
      id: "vendor",
      header: "Vendor",
      cell: (b) => (
        <span className="font-medium text-foreground">
          {vendorNames[b.vendorId] ?? "—"}
        </span>
      ),
      sortValue: (b) => vendorNames[b.vendorId] ?? "",
    },
    { id: "category", header: "Category", cell: (b) => b.category, sortValue: (b) => b.category },
    { id: "quoteDate", header: "Quoted", cell: (b) => b.quoteDate, sortValue: (b) => b.quoteDate },
    {
      id: "original",
      header: "Original",
      align: "right",
      cell: (b) => formatINR(b.originalAmount),
      sortValue: (b) => b.originalAmount,
    },
    {
      id: "negotiated",
      header: "Negotiated",
      align: "right",
      cell: (b) => formatINR(b.negotiatedAmount),
      sortValue: (b) => b.negotiatedAmount,
    },
    {
      id: "total",
      header: "Total (incl. GST)",
      align: "right",
      cell: (b) => <span className="font-medium text-foreground">{formatINR(b.total)}</span>,
      sortValue: (b) => b.total,
    },
    {
      id: "payment",
      header: "Payment",
      cell: (b) => <StatusBadge status={b.paymentStatus} />,
      sortValue: (b) => b.paymentStatus,
    },
  ];

  const filters: Filter<BOQ>[] = [
    { id: "payment", label: "Payment", value: (b) => b.paymentStatus },
    { id: "category", label: "Category", value: (b) => b.category },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      filters={filters}
      searchValues={(b) => `${vendorNames[b.vendorId] ?? ""} ${b.category}`}
      initialSort={{ id: "total", dir: "desc" }}
    />
  );
}

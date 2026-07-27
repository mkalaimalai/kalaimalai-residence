"use client";

import type { Warranty } from "@/types";
import { DataTable, type Column, type Filter } from "@/components/DataTable";

export function WarrantyTable({
  rows,
  vendorNames,
}: {
  rows: Warranty[];
  vendorNames: Record<string, string>;
}) {
  const columns: Column<Warranty>[] = [
    {
      id: "item",
      header: "Item",
      cell: (w) => <span className="font-medium text-foreground">{w.item}</span>,
      sortValue: (w) => w.item,
    },
    { id: "brand", header: "Brand", cell: (w) => w.brand || "—", sortValue: (w) => w.brand },
    { id: "vendor", header: "Vendor", cell: (w) => vendorNames[w.vendorId] ?? "—" },
    { id: "category", header: "Category", cell: (w) => w.category, sortValue: (w) => w.category },
    { id: "start", header: "Start", cell: (w) => w.warrantyStart || "—", sortValue: (w) => w.warrantyStart },
    {
      id: "end",
      header: "Expires",
      cell: (w) => w.warrantyEnd || "—",
      sortValue: (w) => w.warrantyEnd,
    },
    { id: "service", header: "Service contact", cell: (w) => w.serviceContact || "—" },
  ];

  const filters: Filter<Warranty>[] = [
    { id: "category", label: "Category", value: (w) => w.category },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      filters={filters}
      searchValues={(w) => `${w.item} ${w.brand} ${w.category} ${vendorNames[w.vendorId] ?? ""}`}
      initialSort={{ id: "end", dir: "asc" }}
    />
  );
}

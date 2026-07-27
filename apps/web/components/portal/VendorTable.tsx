"use client";

import type { Vendor } from "@/types";
import { DataTable, type Column, type Filter } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";

const columns: Column<Vendor>[] = [
  {
    id: "name",
    header: "Vendor",
    cell: (v) => <span className="font-medium text-foreground">{v.name}</span>,
    sortValue: (v) => v.name,
  },
  { id: "category", header: "Category", cell: (v) => v.category, sortValue: (v) => v.category },
  {
    id: "contact",
    header: "Contact",
    cell: (v) => (
      <span>
        {v.contactPerson || "—"}
        <span className="block text-xs text-muted-foreground">{v.phone}</span>
      </span>
    ),
  },
  { id: "location", header: "Location", cell: (v) => v.location || "—", sortValue: (v) => v.location },
  {
    id: "rating",
    header: "Rating",
    align: "right",
    cell: (v) => (v.rating ? `★ ${v.rating.toFixed(1)}` : "—"),
    sortValue: (v) => v.rating,
  },
  {
    id: "finalized",
    header: "Status",
    cell: (v) => <StatusBadge status={v.finalized ? "Approved" : "For Review"} />,
    sortValue: (v) => (v.finalized ? 1 : 0),
  },
];

const filters: Filter<Vendor>[] = [
  { id: "category", label: "Category", value: (v) => v.category },
  { id: "finalized", label: "Finalized", value: (v) => (v.finalized ? "Yes" : "No") },
];

export function VendorTable({ rows }: { rows: Vendor[] }) {
  return (
    <DataTable
      rows={rows}
      columns={columns}
      filters={filters}
      searchValues={(v) => `${v.name} ${v.category} ${v.contactPerson} ${v.location}`}
      initialSort={{ id: "name", dir: "asc" }}
    />
  );
}

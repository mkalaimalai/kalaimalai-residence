"use client";

import type { Drawing } from "@/types";
import { DataTable, type Column, type Filter } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";

export function DrawingTable({
  rows,
  domainNames,
  spaceNames,
}: {
  rows: Drawing[];
  domainNames: Record<string, string>;
  spaceNames: Record<string, string>;
}) {
  const columns: Column<Drawing>[] = [
    {
      id: "title",
      header: "Title",
      cell: (d) => <span className="font-medium text-foreground">{d.title}</span>,
      sortValue: (d) => d.title,
    },
    {
      id: "domain",
      header: "Domain",
      cell: (d) => domainNames[d.domainId] ?? "—",
      sortValue: (d) => domainNames[d.domainId] ?? "",
    },
    {
      id: "space",
      header: "Space",
      cell: (d) => (d.spaceId ? (spaceNames[d.spaceId] ?? "—") : "—"),
    },
    { id: "rev", header: "Rev", cell: (d) => d.revision, sortValue: (d) => d.revision },
    { id: "date", header: "Date", cell: (d) => d.date, sortValue: (d) => d.date },
    { id: "consultant", header: "Consultant", cell: (d) => d.consultant || "—" },
    {
      id: "status",
      header: "Status",
      cell: (d) => <StatusBadge status={d.status} />,
      sortValue: (d) => d.status,
    },
  ];

  const filters: Filter<Drawing>[] = [
    { id: "status", label: "Status", value: (d) => d.status },
    { id: "domain", label: "Domain", value: (d) => domainNames[d.domainId] ?? "—" },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      filters={filters}
      searchValues={(d) => `${d.title} ${d.consultant} ${d.revision}`}
      initialSort={{ id: "date", dir: "desc" }}
    />
  );
}

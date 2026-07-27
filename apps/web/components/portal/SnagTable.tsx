"use client";

import type { Snag } from "@/types";
import { DataTable, type Column, type Filter } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";

// Priority rank so sorting goes Critical → Low, not alphabetical.
const PRIORITY_RANK: Record<string, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

export function SnagTable({
  rows,
  spaceNames,
}: {
  rows: Snag[];
  spaceNames: Record<string, string>;
}) {
  const columns: Column<Snag>[] = [
    { id: "space", header: "Space", cell: (s) => (s.spaceId ? spaceNames[s.spaceId] ?? "—" : "—"), sortValue: (s) => spaceNames[s.spaceId] ?? "" },
    { id: "category", header: "Category", cell: (s) => s.category, sortValue: (s) => s.category },
    {
      id: "description",
      header: "Description",
      cell: (s) => <span className="block max-w-md text-foreground">{s.description}</span>,
    },
    { id: "assigned", header: "Assigned", cell: (s) => s.assignedTo || "—" },
    {
      id: "priority",
      header: "Priority",
      cell: (s) => <StatusBadge status={s.priority} />,
      sortValue: (s) => PRIORITY_RANK[s.priority] ?? 0,
    },
    { id: "target", header: "Target", cell: (s) => s.targetClosureDate || "—", sortValue: (s) => s.targetClosureDate },
    {
      id: "status",
      header: "Status",
      cell: (s) => <StatusBadge status={s.status} />,
      sortValue: (s) => s.status,
    },
  ];

  const filters: Filter<Snag>[] = [
    { id: "priority", label: "Priority", value: (s) => s.priority },
    { id: "status", label: "Status", value: (s) => s.status },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      filters={filters}
      searchValues={(s) => `${s.category} ${s.description} ${s.assignedTo}`}
      initialSort={{ id: "priority", dir: "desc" }}
    />
  );
}

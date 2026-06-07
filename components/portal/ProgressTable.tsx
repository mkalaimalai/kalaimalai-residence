"use client";

import type { ProgressEntry } from "@/types";
import { DataTable, type Column, type Filter } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";

export function ProgressTable({
  rows,
  spaceNames,
}: {
  rows: ProgressEntry[];
  spaceNames: Record<string, string>;
}) {
  const columns: Column<ProgressEntry>[] = [
    { id: "date", header: "Date", cell: (p) => p.date, sortValue: (p) => p.date },
    { id: "phase", header: "Phase", cell: (p) => p.phase, sortValue: (p) => p.phase },
    { id: "space", header: "Space", cell: (p) => (p.spaceId ? spaceNames[p.spaceId] ?? "—" : "—") },
    {
      id: "work",
      header: "Work completed",
      cell: (p) => (
        <span>
          <span className="text-foreground">{p.workCompleted}</span>
          {p.nextAction && (
            <span className="block text-xs text-muted-foreground">
              Next: {p.nextAction}
            </span>
          )}
        </span>
      ),
    },
    { id: "owner", header: "Owner", cell: (p) => p.owner || "—" },
    {
      id: "status",
      header: "Status",
      cell: (p) => <StatusBadge status={p.status} />,
      sortValue: (p) => p.status,
    },
  ];

  const filters: Filter<ProgressEntry>[] = [
    { id: "phase", label: "Phase", value: (p) => p.phase },
    { id: "status", label: "Status", value: (p) => p.status },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      filters={filters}
      searchValues={(p) => `${p.phase} ${p.workCompleted} ${p.nextAction} ${p.owner}`}
      initialSort={{ id: "date", dir: "desc" }}
    />
  );
}

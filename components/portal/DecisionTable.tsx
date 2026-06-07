"use client";

import type { Decision } from "@/types";
import { DataTable, type Column, type Filter } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";

export function DecisionTable({
  rows,
  domainNames,
}: {
  rows: Decision[];
  domainNames: Record<string, string>;
}) {
  const columns: Column<Decision>[] = [
    {
      id: "title",
      header: "Decision",
      cell: (d) => (
        <span>
          <span className="font-medium text-foreground">{d.title}</span>
          <span className="block max-w-md text-xs text-muted-foreground">
            {d.finalDecision || d.reason}
          </span>
        </span>
      ),
      sortValue: (d) => d.title,
    },
    {
      id: "domain",
      header: "Domain",
      cell: (d) => domainNames[d.domainId] ?? "—",
      sortValue: (d) => domainNames[d.domainId] ?? "",
    },
    { id: "type", header: "Type", cell: (d) => d.type, sortValue: (d) => d.type },
    { id: "owner", header: "Owner", cell: (d) => d.owner || "—" },
    { id: "date", header: "Date", cell: (d) => d.date || "—", sortValue: (d) => d.date },
    {
      id: "status",
      header: "Status",
      cell: (d) => <StatusBadge status={d.status} />,
      sortValue: (d) => d.status,
    },
  ];

  const filters: Filter<Decision>[] = [
    { id: "status", label: "Status", value: (d) => d.status },
    { id: "type", label: "Type", value: (d) => d.type },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      filters={filters}
      searchValues={(d) => `${d.title} ${d.finalDecision} ${d.reason} ${d.owner}`}
      initialSort={{ id: "date", dir: "desc" }}
    />
  );
}

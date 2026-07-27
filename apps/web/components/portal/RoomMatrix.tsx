"use client";

import type { Space } from "@/types";
import { DataTable, type Column, type Filter } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";

const has = (s: Space, domainId: string) => s.domainIds.includes(domainId);
const mark = (on: boolean) =>
  on ? (
    <span className="text-foreground">✓</span>
  ) : (
    <span className="text-muted-foreground/40">—</span>
  );

const list = (items: string[]) =>
  items.length ? (
    <span className="block max-w-[16rem] text-xs text-muted-foreground">
      {items.join(", ")}
    </span>
  ) : (
    <span className="text-muted-foreground/40">—</span>
  );

/**
 * Keystone room matrix (build doc §6): one row per space, with the systems and
 * finishes that apply to it. Material/vendor IDs are resolved to names on the
 * server and passed in as lookup maps.
 */
export function RoomMatrix({
  rows,
  materialNames,
  vendorNames,
}: {
  rows: Space[];
  materialNames: Record<string, string>;
  vendorNames: Record<string, string>;
}) {
  const columns: Column<Space>[] = [
    {
      id: "name",
      header: "Space",
      cell: (s) => <span className="font-medium text-foreground">{s.name}</span>,
      sortValue: (s) => s.name,
    },
    {
      id: "materials",
      header: "Materials / finishes",
      cell: (s) => list(s.materialIds.map((id) => materialNames[id] ?? id)),
    },
    { id: "furniture", header: "Furniture", cell: (s) => list(s.furniture) },
    { id: "lighting", header: "Lighting", cell: (s) => list(s.lighting) },
    {
      id: "automation",
      header: "Auto",
      align: "right",
      cell: (s) => mark(has(s, "dom-automation")),
    },
    {
      id: "plumbing",
      header: "Plumb",
      align: "right",
      cell: (s) => mark(has(s, "dom-plumbing")),
    },
    {
      id: "electrical",
      header: "Elec",
      align: "right",
      cell: (s) => mark(has(s, "dom-electrical")),
    },
    {
      id: "vendors",
      header: "Vendors",
      cell: (s) => list(s.vendorIds.map((id) => vendorNames[id] ?? id)),
    },
    {
      id: "status",
      header: "Status",
      cell: (s) => <StatusBadge status={s.status} />,
      sortValue: (s) => s.status,
    },
  ];

  const filters: Filter<Space>[] = [
    { id: "status", label: "Status", value: (s) => s.status },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      filters={filters}
      searchValues={(s) => `${s.name} ${s.furniture.join(" ")} ${s.lighting.join(" ")}`}
      initialSort={{ id: "name", dir: "asc" }}
      emptyMessage="No spaces."
    />
  );
}

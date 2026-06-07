"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  id: string;
  header: string;
  /** Cell renderer. */
  cell: (row: T) => ReactNode;
  /** Provide to make the column sortable. */
  sortValue?: (row: T) => string | number;
  /** Right-align (typically numeric columns). */
  align?: "left" | "right";
  className?: string;
}

export interface Filter<T> {
  id: string;
  label: string;
  /** The value used for both the dropdown options and matching. */
  value: (row: T) => string;
}

interface DataTableProps<T extends { id: string }> {
  rows: T[];
  columns: Column<T>[];
  /** Keys/accessors searched by the text box. Omit to hide search. */
  searchValues?: (row: T) => string;
  filters?: Filter<T>[];
  initialSort?: { id: string; dir: "asc" | "desc" };
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  searchValues,
  filters = [],
  initialSort,
  emptyMessage = "No records.",
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ id: string; dir: "asc" | "desc" } | null>(
    initialSort ?? null,
  );

  const filterOptions = useMemo(
    () =>
      filters.map((f) => ({
        ...f,
        options: Array.from(new Set(rows.map(f.value).filter(Boolean))).sort(),
      })),
    [filters, rows],
  );

  const visible = useMemo(() => {
    let out = rows;

    const q = query.trim().toLowerCase();
    if (q && searchValues) {
      out = out.filter((r) => searchValues(r).toLowerCase().includes(q));
    }

    for (const f of filters) {
      const sel = active[f.id];
      if (sel) out = out.filter((r) => f.value(r) === sel);
    }

    if (sort) {
      const col = columns.find((c) => c.id === sort.id);
      if (col?.sortValue) {
        const dir = sort.dir === "asc" ? 1 : -1;
        out = [...out].sort((a, b) => {
          const av = col.sortValue!(a);
          const bv = col.sortValue!(b);
          if (av < bv) return -1 * dir;
          if (av > bv) return 1 * dir;
          return 0;
        });
      }
    }

    return out;
  }, [rows, query, active, filters, sort, columns, searchValues]);

  const toggleSort = (id: string) =>
    setSort((s) =>
      s?.id === id
        ? s.dir === "asc"
          ? { id, dir: "desc" }
          : null
        : { id, dir: "asc" },
    );

  return (
    <div className="space-y-4">
      {(searchValues || filterOptions.length > 0) && (
        <div className="flex flex-wrap items-center gap-3">
          {searchValues && (
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-56 rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none focus:border-foreground"
              />
            </div>
          )}
          {filterOptions.map((f) => (
            <select
              key={f.id}
              value={active[f.id] ?? ""}
              onChange={(e) =>
                setActive((a) => ({ ...a, [f.id]: e.target.value }))
              }
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground"
            >
              <option value="">{f.label}: All</option>
              {f.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">
            {visible.length} of {rows.length}
          </span>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map((c) => (
                <th
                  key={c.id}
                  className={cn(
                    "whitespace-nowrap px-3 py-2.5 font-medium text-muted-foreground",
                    c.align === "right" ? "text-right" : "text-left",
                  )}
                >
                  {c.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(c.id)}
                      className={cn(
                        "inline-flex items-center gap-1 hover:text-foreground",
                        c.align === "right" && "flex-row-reverse",
                      )}
                    >
                      {c.header}
                      {sort?.id === c.id ? (
                        sort.dir === "asc" ? (
                          <ChevronUp size={13} />
                        ) : (
                          <ChevronDown size={13} />
                        )
                      ) : (
                        <ChevronsUpDown size={13} className="opacity-40" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border last:border-0 hover:bg-muted/30"
              >
                {columns.map((c) => (
                  <td
                    key={c.id}
                    className={cn(
                      "px-3 py-2.5 align-top text-foreground",
                      c.align === "right" && "text-right tabular-nums",
                      c.className,
                    )}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-10 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

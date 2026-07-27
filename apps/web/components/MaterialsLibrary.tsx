"use client";

import { useMemo, useState } from "react";
import type { Material } from "@/types";
import { MaterialCard } from "@/components/MaterialCard";
import { cn } from "@/lib/utils";

export function MaterialsLibrary({ materials }: { materials: Material[] }) {
  const [filter, setFilter] = useState<string>("all");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(materials.map((m) => m.category)))],
    [materials],
  );

  const visible = useMemo(
    () =>
      filter === "all"
        ? materials
        : materials.filter((m) => m.category === filter),
    [materials, filter],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              filter === c
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {c === "all" ? "All" : c}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((m) => (
          <MaterialCard key={m.id} material={m} />
        ))}
      </div>
    </div>
  );
}

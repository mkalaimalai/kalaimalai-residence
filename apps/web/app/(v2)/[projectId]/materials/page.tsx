"use client";

import { useEffect, useMemo, useState } from "react";
import type { Material } from "@/types";
import { api } from "@/lib/api-v2";
import { useProject } from "../V2ProjectChrome";
import { cn } from "@kr/api-client";
import { SectionHeading } from "@/components/SectionHeading";
import { MaterialCard } from "@/components/MaterialCard";

export default function V2Materials() {
  const { selectedId } = useProject();
  const [materials, setMaterials] = useState<Material[] | null>(null);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.materials(selectedId).then(setMaterials).catch((e) => setError(e.message));
  }, [selectedId]);

  const categories = useMemo(
    () => materials ? ["all", ...Array.from(new Set(materials.map((m) => m.category)))] : [],
    [materials],
  );

  const visible = useMemo(
    () => filter === "all" ? materials || [] : (materials || []).filter((m) => m.category === filter),
    [materials, filter],
  );

  if (error) return <p className="p-6 text-destructive">{error}</p>;
  if (!materials) return <LoadingState />;

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeading eyebrow="The palette" title="Materials" description="A quiet, warm and tactile palette — filter by category to explore each finish and where it lives in the home." className="mb-10" />
      <div className="space-y-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c} type="button" onClick={() => setFilter(c)}
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
          {visible.map((m) => <MaterialCard key={m.id} material={m} />)}
        </div>
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-1 items-center justify-center py-32">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
    </div>
  );
}

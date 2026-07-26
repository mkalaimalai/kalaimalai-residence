"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { GalleryItem, GalleryCategory } from "@/types";
import { api } from "@/lib/api-v2";
import { useProject } from "../V2ProjectChrome";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/SectionHeading";

const LABELS: Record<GalleryCategory | "all", string> = {
  all: "All", render: "Renders", drawing: "Drawings", progress: "Progress",
  final: "Final", material: "Materials", furniture: "Furniture", lighting: "Lighting", landscape: "Landscape",
};

export default function V2Gallery() {
  const { selectedId } = useProject();
  const [items, setItems] = useState<GalleryItem[] | null>(null);
  const [filter, setFilter] = useState<GalleryCategory | "all">("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.gallery(selectedId).then(setItems).catch((e) => setError(e.message));
  }, [selectedId]);

  const categories = useMemo(() => {
    if (!items) return [];
    return ["all", ...Array.from(new Set(items.map((i) => i.category)))] as (GalleryCategory | "all")[];
  }, [items]);

  const visible = useMemo(
    () => filter === "all" ? items || [] : (items || []).filter((i) => i.category === filter),
    [items, filter],
  );

  if (error) return <p className="p-6 text-destructive">{error}</p>;
  if (!items) return <LoadingState />;

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeading eyebrow="The visual archive" title="Gallery" description="Exterior renders and interior visualisations across the home. Filter by category." className="mb-10" />
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
              {LABELS[c]}
            </button>
          ))}
        </div>
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {visible.map((item) => (
            <figure key={item.id} className="break-inside-avoid overflow-hidden rounded-xl border border-border bg-card">
              <div className="relative aspect-[4/3] bg-muted">
                <Image src={item.image} alt={item.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
              </div>
              <figcaption className="space-y-1 p-4">
                <p className="font-serif text-base text-foreground">{item.title}</p>
                {item.caption && <p className="text-sm text-muted-foreground">{item.caption}</p>}
              </figcaption>
            </figure>
          ))}
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

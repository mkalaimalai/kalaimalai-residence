"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { GalleryItem, GalleryCategory } from "@/types";
import { cn } from "@/lib/utils";

const LABELS: Record<GalleryCategory | "all", string> = {
  all: "All",
  render: "Renders",
  drawing: "Drawings",
  progress: "Progress",
  final: "Final",
  material: "Materials",
  furniture: "Furniture",
  lighting: "Lighting",
  landscape: "Landscape",
};

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState<GalleryCategory | "all">("all");

  // Only show filters that actually have items.
  const categories = useMemo(() => {
    const present = Array.from(new Set(items.map((i) => i.category)));
    return ["all", ...present] as (GalleryCategory | "all")[];
  }, [items]);

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.category === filter)),
    [items, filter],
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
            {LABELS[c]}
          </button>
        ))}
      </div>

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {visible.map((item) => (
          <figure
            key={item.id}
            className="break-inside-avoid overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="relative aspect-[4/3] bg-muted">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            <figcaption className="space-y-1 p-4">
              <p className="font-serif text-base text-foreground">{item.title}</p>
              {item.caption && (
                <p className="text-sm text-muted-foreground">{item.caption}</p>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

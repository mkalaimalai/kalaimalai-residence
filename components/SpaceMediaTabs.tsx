"use client";

import { useState } from "react";
import Image from "next/image";
import { SectionHeading } from "@/components/SectionHeading";
import { RenderingGallery } from "@/components/RenderingGallery";
import { Chip, ChipGroup } from "@/components/Chip";
import type { GalleryItem } from "@/types";
import type { RenderingSet } from "@/data/renderings";
import { cn } from "@/lib/utils";

type Tab = "renderings" | "drawings";

export function SpaceMediaTabs({
  galleryItems,
  drawingSets,
  drawingChips,
  renderingSets = [],
}: {
  galleryItems: GalleryItem[];
  drawingSets: RenderingSet[];
  drawingChips: { id: string; label: string }[];
  /**
   * Rendering-kind `media_sets` owned by this space. Optional and empty by default
   * because 1.0 has no such thing — its space renderings only ever exist as gallery
   * items. 2.0 passes these because the admin panel can upload renderings per space,
   * and without rendering them here those uploads would vanish from the site.
   */
  renderingSets?: RenderingSet[];
}) {
  const hasRenderings = galleryItems.length > 0 || renderingSets.length > 0;
  const hasDrawings = drawingSets.length > 0 || drawingChips.length > 0;
  const [active, setActive] = useState<Tab>(
    hasRenderings ? "renderings" : "drawings",
  );

  if (!hasRenderings && !hasDrawings) return null;

  const tabs = (
    [
      hasRenderings && { id: "renderings", label: "Renderings" },
      hasDrawings && { id: "drawings", label: "Drawings" },
    ] as const
  ).filter(Boolean) as { id: Tab; label: string }[];

  return (
    <section className="mx-auto max-w-5xl px-6 pb-20">
      <div role="tablist" className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              active === t.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {active === "renderings" && hasRenderings && (
          <>
            <SectionHeading
              eyebrow="Studio Anagami"
              title="Design renderings"
              description="Presentation renders for this space."
            />
            {/* Uploaded rendering sets first, rendered exactly as a domain page does,
                then any seed gallery items for this space. */}
            {renderingSets.length > 0 && (
              <div className="mt-8">
                <RenderingGallery sets={renderingSets} />
              </div>
            )}
            <div className="mt-8 space-y-6">
              {galleryItems.map((item) => (
                <figure
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-border bg-muted"
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={3300}
                    height={2550}
                    sizes="(max-width: 1024px) 100vw, 896px"
                    className="h-auto w-full"
                  />
                  <figcaption className="p-4 text-sm text-muted-foreground">
                    {item.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </>
        )}

        {active === "drawings" && hasDrawings && (
          <>
            {drawingChips.length > 0 && (
              <ChipGroup label="Referenced drawings">
                {drawingChips.map((d) => (
                  <Chip key={d.id} label={d.label} />
                ))}
              </ChipGroup>
            )}

            {drawingSets.length > 0 && (
              <div className="mt-8">
                <SectionHeading
                  eyebrow="Technical sheets"
                  title="Drawing sheets"
                  description="Production drawings and detail layouts."
                />
                <div className="mt-8">
                  <RenderingGallery sets={drawingSets} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

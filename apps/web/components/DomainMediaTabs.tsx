"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { RenderingGallery } from "@/components/RenderingGallery";
import type { RenderingSet } from "@/data/renderings";
import { cn } from "@/lib/utils";

type Tab = "renderings" | "drawings";

/**
 * Tabbed media for a domain page: a "Renderings" tab and a "Drawings" tab, each
 * wrapping a RenderingGallery. Only tabs with content render; the default
 * selection is Renderings when present, otherwise Drawings.
 */
export function DomainMediaTabs({
  renderingSets,
  drawingSets,
}: {
  renderingSets: RenderingSet[];
  drawingSets: RenderingSet[];
}) {
  const hasRenderings = renderingSets.length > 0;
  const hasDrawings = drawingSets.length > 0;
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
    <section className="mt-14">
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
              title="Renderings"
              description="Interior presentation decks — scroll through each space."
            />
            <div className="mt-8">
              <RenderingGallery sets={renderingSets} />
            </div>
          </>
        )}
        {active === "drawings" && hasDrawings && (
          <>
            <SectionHeading
              eyebrow="Working drawings"
              title="Drawings"
              description="Technical layout plans and detail sheets, by floor and space."
            />
            <div className="mt-8">
              <RenderingGallery sets={drawingSets} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

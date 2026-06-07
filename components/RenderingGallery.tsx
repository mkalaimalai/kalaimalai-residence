import Image from "next/image";
import type { RenderingSet } from "@/data/renderings";

/**
 * Vertical, scrollable gallery of rendering decks. Each deck is a section with a
 * heading and its pages stacked full-width in order. Images keep their intrinsic
 * aspect ratio (no crop) and lazy-load as the reader scrolls.
 */
export function RenderingGallery({ sets }: { sets: RenderingSet[] }) {
  return (
    <div className="space-y-14">
      {sets.map((set) => (
        <section key={set.title} className="space-y-5">
          <h3 className="font-serif text-2xl text-foreground sm:text-3xl">
            {set.title}
          </h3>
          <div className="space-y-6">
            {set.images.map((src, i) => (
              <figure
                key={src}
                className="overflow-hidden rounded-xl border border-border bg-muted"
              >
                <Image
                  src={src}
                  alt={`${set.title} — view ${i + 1}`}
                  width={set.width}
                  height={set.height}
                  sizes="(max-width: 1024px) 100vw, 896px"
                  className="h-auto w-full"
                />
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

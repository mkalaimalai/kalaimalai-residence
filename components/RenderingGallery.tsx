import Image from "next/image";
import type { RenderingSet } from "@/data/renderings";

/** One stacked, lazy-loaded, aspect-correct rendering image. */
function RenderImage({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-muted">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 1024px) 100vw, 896px"
        className="h-auto w-full"
      />
    </figure>
  );
}

/**
 * Vertical, scrollable gallery of rendering decks. Each set is a section with a
 * heading; a set is either a flat list of images or a group of titled
 * sub-sections (e.g. bedrooms by room). Images keep their intrinsic aspect ratio
 * and lazy-load as the reader scrolls.
 */
export function RenderingGallery({ sets }: { sets: RenderingSet[] }) {
  return (
    <div className="space-y-16">
      {sets.map((set) => (
        <section key={set.title} className="space-y-5">
          <h3 className="font-serif text-2xl text-foreground sm:text-3xl">
            {set.title}
          </h3>

          {set.images && (
            <div className="space-y-6">
              {set.images.map((src, i) => (
                <RenderImage
                  key={src}
                  src={src}
                  alt={`${set.title} — view ${i + 1}`}
                  width={set.width}
                  height={set.height}
                />
              ))}
            </div>
          )}

          {set.subsections?.map((sub) => (
            <section key={sub.title} className="space-y-5 pt-2">
              <h4 className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {sub.title}
              </h4>
              <div className="space-y-6">
                {sub.images.map((src, i) => (
                  <RenderImage
                    key={src}
                    src={src}
                    alt={`${sub.title} — view ${i + 1}`}
                    width={set.width}
                    height={set.height}
                  />
                ))}
              </div>
            </section>
          ))}
        </section>
      ))}
    </div>
  );
}

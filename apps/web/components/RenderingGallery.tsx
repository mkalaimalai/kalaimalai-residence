import Image from "next/image";
import type { RenderingSet } from "@/data/renderings";

/** Stable anchor id from a section title (e.g. "Master Bedroom" → "master-bedroom"). */
const sectionId = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

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
 *
 * When there is more than one section, a sticky "jump to section" bar lets the
 * reader skip down a long gallery; each section carries an anchor id and a
 * scroll-margin that clears the sticky site header + this bar.
 */
export function RenderingGallery({ sets }: { sets: RenderingSet[] }) {
  return (
    <div>
      {sets.length > 1 && (
        <nav
          aria-label="Jump to section"
          className="sticky top-16 z-40 -mx-6 mb-10 border-b border-border bg-background/90 px-6 py-3 backdrop-blur"
        >
          <ul className="flex gap-2 overflow-x-auto">
            {sets.map((set) => (
              <li key={set.title}>
                <a
                  href={`#${sectionId(set.title)}`}
                  className="inline-block whitespace-nowrap rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  {set.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="space-y-16">
        {sets.map((set) => (
          <section
            key={set.title}
            id={sectionId(set.title)}
            className="scroll-mt-32 space-y-5"
          >
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
    </div>
  );
}

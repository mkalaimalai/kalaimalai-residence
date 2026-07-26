/**
 * `media_sets` rows → the `RenderingSet` shape the galleries render.
 *
 * The DB table was deliberately modelled on `RenderingSet`, so this is a narrowing, not
 * a translation: drop the ownership columns, and turn the nullable `subsections` into
 * the optional field the component expects. Keeping it in one place means the 1.0
 * (build-time, from `data/`) and 2.0 (runtime, from the API) paths feed the same
 * `RenderingGallery` with identical input.
 */
import type { MediaSet } from "@/lib/api-v2";
import type { RenderingSet } from "@/data/renderings";

export function toRenderingSets(sets: MediaSet[]): RenderingSet[] {
  return [...sets]
    // The API already orders by sort_order, but a caller that merges two filtered
    // queries would lose that — sorting here makes the output independent of how the
    // rows arrived.
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title))
    .map((m) => ({
      title: m.title,
      width: m.width,
      height: m.height,
      images: m.images,
      subsections: m.subsections ?? undefined,
    }));
}

/** Split a mixed list into the two tabs, preserving each one's order. */
export function splitByKind(sets: MediaSet[]): {
  renderings: RenderingSet[];
  drawings: RenderingSet[];
} {
  return {
    renderings: toRenderingSets(sets.filter((m) => m.kind === "rendering")),
    drawings: toRenderingSets(sets.filter((m) => m.kind === "drawing_sheet")),
  };
}

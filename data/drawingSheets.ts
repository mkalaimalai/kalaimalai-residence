import type { RenderingSet } from "@/data/renderings";

/**
 * Technical drawing sheets shown inline on a domain page, keyed by domain slug.
 * Each sheet is an A2 PDF (artifacts/.../drawings) converted to a portrait JPG:
 *   pdftoppm -jpeg -jpegopt quality=88 -scale-to 1600 -singlefile "<sheet>.pdf" "<out>"
 * Reuses the RenderingSet shape so the existing RenderingGallery can render them.
 */
const FLOOR = "/images/drawings/flooring";

export const drawingSheetsByDomain: Record<string, RenderingSet[]> = {
  flooring: [
    {
      title: "Ground Floor — Flooring Layout",
      width: 1132,
      height: 1600,
      images: [`${FLOOR}/gf-flooring.jpg`],
    },
    {
      title: "First Floor — Flooring Layout",
      width: 1132,
      height: 1600,
      images: [`${FLOOR}/ff-flooring.jpg`],
    },
    {
      title: "Terrace Floor — Flooring Layout",
      width: 1132,
      height: 1600,
      images: [`${FLOOR}/tf-flooring.jpg`],
    },
    {
      title: "Detail Sheet 1",
      width: 1132,
      height: 1600,
      images: [`${FLOOR}/detail-1.jpg`],
    },
    {
      title: "Detail Sheet 2",
      width: 1132,
      height: 1600,
      images: [`${FLOOR}/detail-2.jpg`],
    },
    {
      title: "Detail Sheet 3",
      width: 1132,
      height: 1600,
      images: [`${FLOOR}/detail-3.jpg`],
    },
  ],
};

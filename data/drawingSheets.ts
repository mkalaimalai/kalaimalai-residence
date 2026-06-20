import type { RenderingSet } from "@/data/renderings";

/**
 * Technical drawing sheets shown inline on a domain page, keyed by domain slug.
 * Each sheet is a PDF (artifacts/.../drawings) rendered at 200 DPI and saved as
 * WebP — high enough resolution to stay crisp on Retina and zoom into dimension
 * text, lossless/near-lossless so line work and text have no JPEG artifacts:
 *   pdftocairo -png -r 200 "<sheet>.pdf" "<out>"   # multi-page → <out>-N.png
 *   # then PIL WebP, keeping the smaller of lossless vs quality=90 per page
 * Reuses the RenderingSet shape so the existing RenderingGallery can render them.
 */
const FLOOR = "/images/drawings/flooring";
const INT = "/images/drawings/interior-design";
const ARCH = "/images/drawings/architecture";

/** Build `<INT>/<key>-N.webp` for an inclusive page range. `pad` matches pdftocairo. */
const seq = (key: string, from: number, to: number, pad = 1): string[] => {
  const out: string[] = [];
  for (let n = from; n <= to; n++) {
    out.push(`${INT}/${key}-${String(n).padStart(pad, "0")}.webp`);
  }
  return out;
};

// Interior-design working drawings, one section per room (artifacts/
// interior-drawings/<room>/). Where a room has several source PDFs they are
// concatenated into one section in revision order. Image keys retain their
// gf-/ff- floor prefix from conversion; the section title is the room name.
const interiorDesign: RenderingSet[] = [
  {
    title: "Living Room",
    width: 1132,
    height: 1600,
    images: seq("gf-common", 1, 22, 2),
  },
  {
    title: "Parents' Bedroom",
    width: 1132,
    height: 1600,
    images: [
      ...seq("gf-parents-set", 1, 10, 2),
      ...seq("gf-parents-tv", 1, 4),
      ...seq("gf-parents-bed", 1, 1),
      ...seq("gf-parents-wardrobe", 1, 1),
    ],
  },
  {
    title: "Master Bedroom",
    width: 1132,
    height: 1600,
    images: [...seq("ff-master-int", 1, 6), ...seq("ff-master-headboard", 1, 4)],
  },
  {
    title: "Elder Daughter's Bedroom",
    width: 1132,
    height: 1600,
    images: [...seq("ff-elder-int", 1, 9), ...seq("ff-elder-layout", 1, 1)],
  },
  {
    title: "Younger Daughter's Bedroom",
    width: 1132,
    height: 1600,
    images: seq("ff-younger", 1, 9),
  },
  {
    title: "Puja Room",
    width: 1132,
    height: 1600,
    images: seq("gf-puja", 1, 2),
  },
  {
    title: "Office Room",
    width: 1132,
    height: 1600,
    images: seq("ff-office", 1, 3),
  },
];

export const drawingSheetsByDomain: Record<string, RenderingSet[]> = {
  architecture: [
    {
      title: "Ground Floor Plan",
      width: 1132,
      height: 1600,
      images: [`${ARCH}/gf-plan.webp`],
    },
    {
      title: "First Floor Plan",
      width: 1132,
      height: 1600,
      images: [`${ARCH}/ff-plan.webp`],
    },
    {
      title: "Second Floor Plan",
      width: 1132,
      height: 1600,
      images: [`${ARCH}/sf-plan.webp`],
    },
  ],
  "interior-design": interiorDesign,
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

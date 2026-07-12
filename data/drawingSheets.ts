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
const FC = "/images/drawings/false-ceiling";
const LT = "/images/drawings/lighting";

const KIT = "/images/drawings/kitchen";

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

// False-ceiling drawing sheets from Final revision folder
const falseCeiling: RenderingSet[] = [
  {
    title: "False Ceiling Drawings (Complete Set)",
    width: 1132,
    height: 1600,
    images: [
      `${FC}/fc-full-set-1.webp`,
      `${FC}/fc-full-set-2.webp`,
      `${FC}/fc-full-set-3.webp`,
      `${FC}/fc-full-set-4.webp`,
      `${FC}/fc-full-set-5.webp`,
      `${FC}/fc-full-set-6.webp`,
      `${FC}/fc-full-set-7.webp`,
      `${FC}/fc-full-set-8.webp`,
      `${FC}/fc-full-set-9.webp`,
    ],
  },
  {
    title: "First Floor Common Spaces",
    width: 1132,
    height: 1600,
    images: [`${FC}/fc-ff-common.webp`],
  },
  {
    title: "Ground & First Floor Common Spaces — Details",
    width: 1132,
    height: 1600,
    images: [
      `${FC}/fc-gf-ff-detail-1.webp`,
      `${FC}/fc-gf-ff-detail-2.webp`,
      `${FC}/fc-gf-ff-detail-3.webp`,
    ],
  },
  {
    title: "Puja Room",
    width: 1132,
    height: 1600,
    images: [`${FC}/fc-puja.webp`],
  },
  {
    title: "Second Floor",
    width: 1132,
    height: 1600,
    images: [`${FC}/fc-sf.webp`],
  },
];

// Lighting drawings from Jun-2026 revision
const lighting: RenderingSet[] = [
  {
    title: "Detailed Drawings Set",
    width: 1132,
    height: 1600,
    images: [
      `${LT}/lt-detailed-set-1.webp`,
      `${LT}/lt-detailed-set-2.webp`,
      `${LT}/lt-detailed-set-3.webp`,
      `${LT}/lt-detailed-set-4.webp`,
      `${LT}/lt-detailed-set-5.webp`,
      `${LT}/lt-detailed-set-6.webp`,
      `${LT}/lt-detailed-set-7.webp`,
      `${LT}/lt-detailed-set-8.webp`,
    ],
  },
  {
    title: "Detailed Drawings Set — V1",
    width: 1132,
    height: 1600,
    images: [
      `${LT}/lt-v1-01.webp`,
      `${LT}/lt-v1-02.webp`,
      `${LT}/lt-v1-03.webp`,
      `${LT}/lt-v1-04.webp`,
      `${LT}/lt-v1-05.webp`,
      `${LT}/lt-v1-06.webp`,
      `${LT}/lt-v1-07.webp`,
      `${LT}/lt-v1-08.webp`,
      `${LT}/lt-v1-09.webp`,
      `${LT}/lt-v1-10.webp`,
      `${LT}/lt-v1-11.webp`,
      `${LT}/lt-v1-12.webp`,
      `${LT}/lt-v1-13.webp`,
      `${LT}/lt-v1-14.webp`,
      `${LT}/lt-v1-15.webp`,
    ],
  },
];

export const drawingSheetsByDomain: Record<string, RenderingSet[]> = {
  "false-ceiling": falseCeiling,
  lighting,
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
      images: [`${FLOOR}/gf-flooring.webp`],
    },
    {
      title: "First Floor — Flooring Layout",
      width: 1132,
      height: 1600,
      images: [`${FLOOR}/ff-flooring.webp`],
    },
    {
      title: "Terrace Floor — Flooring Layout",
      width: 1132,
      height: 1600,
      images: [`${FLOOR}/tf-flooring.webp`],
    },
    {
      title: "Detail Sheet 1",
      width: 1132,
      height: 1600,
      images: [`${FLOOR}/detail-1.webp`],
    },
    {
      title: "Detail Sheet 2",
      width: 1132,
      height: 1600,
      images: [`${FLOOR}/detail-2.webp`],
    },
    {
      title: "Detail Sheet 3",
      width: 1132,
      height: 1600,
      images: [`${FLOOR}/detail-3.webp`],
    },
  ],
};

// Kitchen production drawings — displayed on the kitchen space page.
const kitchenDrawings: RenderingSet[] = [
  {
    title: "Final Production Drawing",
    width: 1132,
    height: 1600,
    images: [
      `${KIT}/kit-dwg-1.webp`,
      `${KIT}/kit-dwg-2.webp`,
      `${KIT}/kit-dwg-3.webp`,
      `${KIT}/kit-dwg-4.webp`,
      `${KIT}/kit-dwg-5.webp`,
      `${KIT}/kit-dwg-6.webp`,
      `${KIT}/kit-dwg-7.webp`,
      `${KIT}/kit-dwg-8.webp`,
    ],
  },
];

/** Drawing sheets shown inline on a space detail page, keyed by space slug. */
export const drawingSheetsBySpace: Record<string, RenderingSet[]> = {
  kitchen: kitchenDrawings,
};

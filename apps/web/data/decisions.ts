import type { Decision } from "@/types";

export const decisions: Decision[] = [
  {
    projectId: "proj-kr",
    id: "dec-automation",
    title: "Home automation platform & integrator",
    domainId: "dom-automation",
    spaceId: "",
    type: "Vendor",
    optionsConsidered: [
      "Sync Technologies — KNX backbone with BAB integration",
      "Home Theatre Plus — KNX with Control4 AV",
    ],
    finalDecision:
      "Sync Technologies (KNX/BAB). Open KNX backbone avoids proprietary lock-in; BAB bridges AV/IP without recurring licensing. Selected at a comparable hardware cost with lower lifetime cost.",
    reason:
      "KNX is an open standard, so future devices and a different integrator remain possible. Control4's AV polish didn't justify its per-room licensing and dependency on a single dealer for changes.",
    costImpact: "Comparable upfront; ~10–12% lower lifetime cost (no AV licensing).",
    timeImpact: "Neutral — both ~6–8 week programming lead.",
    qualityImpact:
      "Slightly less turnkey AV than Control4, offset by openness and serviceability.",
    date: "2025-03-28",
    owner: "Owner + Studio Anagami",
    status: "Decided",
  },
  {
    projectId: "proj-kr",
    id: "dec-flooring",
    title: "Living room flooring — marble vs large-format porcelain",
    domainId: "dom-flooring",
    spaceId: "sp-living",
    type: "Material",
    optionsConsidered: [
      "Italian marble (book-matched)",
      "Large-format porcelain (marble-look)",
    ],
    finalDecision:
      "Italian marble in the living/courtyard-facing zone; porcelain reserved for service areas.",
    reason:
      "The double-height living volume is the hero space; natural marble's depth justifies the premium there. Porcelain elsewhere balances the budget.",
    costImpact: "+₹3–4 lakh vs all-porcelain.",
    timeImpact: "+1 week for slab selection and book-matching.",
    qualityImpact: "Higher-end finish in the most-seen space.",
    date: "2025-02-22",
    owner: "Owner + Studio Anagami",
    status: "Decided",
  },
  {
    projectId: "proj-kr",
    id: "dec-staircase",
    title: "Main staircase — steel folded-plate vs RCC",
    domainId: "dom-civil",
    spaceId: "sp-terrace",
    type: "Technical",
    optionsConsidered: [
      "Steel folded-plate (fabricated, lighter, slimmer)",
      "Cast RCC (heavier, more formwork)",
    ],
    finalDecision: "Pending — leaning steel for the slimmer profile and faster install.",
    reason:
      "Steel keeps the stair visually light against the slat screen and shortens site time, but needs a reliable fabricator and protective coating.",
    costImpact: "Steel ~+8% over RCC material, offset by labour/time savings.",
    timeImpact: "Steel saves ~2 weeks on site.",
    qualityImpact: "Slimmer, more refined profile if fabrication is precise.",
    date: "2025-03-12",
    owner: "Owner + Structural Consultant",
    status: "Open",
  },
];

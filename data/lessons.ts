import type { Lesson } from "@/types";

export const lessons: Lesson[] = [
  {
    projectId: "proj-kr",
    id: "les-automation-negotiation",
    title: "Compare automation bids on lifetime cost, not just hardware",
    category: "Negotiation",
    summary:
      "The two KNX bids looked similar on hardware, but Control4's per-room AV licensing and single-dealer dependency added meaningful lifetime cost. Pricing the 5-year picture — not the install quote — flipped the decision toward an open KNX/BAB stack.",
    domainId: "dom-automation",
    spaceId: "sp-living",
    impact: {
      cost: "~10–12% lower lifetime cost by avoiding AV licensing",
      time: "No schedule change",
      quality: "Marginally less turnkey AV, far better serviceability",
      design: "No visible change; same KNX keypads and scenes",
    },
  },
  {
    projectId: "proj-kr",
    id: "les-import-hidden-costs",
    title: "Model landed cost, not ex-works, for imported furniture",
    category: "Procurement",
    summary:
      "Italian ex-works EUR prices hide ~1.7–1.8× of freight, duty, GST and last-mile once landed in Bengaluru. Budgeting against ex-works quotes understated the real spend; every imported line now carries a landed-INR multiplier.",
    domainId: "dom-procurement",
    spaceId: "sp-dining",
    impact: {
      cost: "Avoided a ~70–80% budget undershoot on imports",
      time: "Added 8–12 week shipping lead to the schedule",
      quality: "No change — same product, realistic budget",
      design: "Kept the curated brand list without late substitutions",
    },
  },
  {
    projectId: "proj-kr",
    id: "les-contractor-quote",
    title: "Normalise contractor quotes before comparing",
    category: "Project Management",
    summary:
      "Painting and steel quotes bundled scope differently (materials, GST, site prep). Re-stating each on a like-for-like basis before negotiating surfaced an ~8% gap that was otherwise invisible.",
    domainId: "dom-pm",
    spaceId: "",
    impact: {
      cost: "~8% saved on painting after normalisation",
      time: "Half a day of analysis",
      quality: "Scope clarity reduced later variation claims",
      design: "No change",
    },
  },
];

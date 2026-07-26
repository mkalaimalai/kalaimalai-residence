import type { Metadata } from "next";
import { getProgress } from "@/lib/repository";
import { SectionHeading } from "@/components/SectionHeading";
import { Timeline, type TimelineStage } from "@/components/Timeline";
import { StatusBadge } from "@/components/StatusBadge";

export const metadata: Metadata = {
  title: "Journey · A Contemporary Zen Residence",
  description:
    "The build journey in thirteen stages — from concept and approvals through structure, finishes and final handover.",
};

const STAGES: TimelineStage[] = [
  { title: "Concept & brief", description: "The family's brief, lifestyle goals and the contemporary-Zen direction.", status: "Completed" },
  { title: "Site & feasibility", description: "Plot study, orientation, climate response and massing of the three volumes.", status: "Completed" },
  { title: "Schematic design", description: "Plans, the courtyard section and the indoor-outdoor strategy.", status: "Completed" },
  { title: "Design development", description: "Material palette, interiors language and the lighting approach.", status: "Completed" },
  { title: "Working drawings", description: "Issued-for-construction drawings across architecture and MEP.", status: "Completed" },
  { title: "Approvals & permits", description: "Statutory approvals and sanction.", status: "Completed" },
  { title: "Structure & RCC frame", description: "Foundation, columns, slabs and the gable volume.", status: "Completed" },
  { title: "Masonry & blockwork", description: "Walls, openings and substrate preparation.", status: "In Progress" },
  { title: "MEP rough-in", description: "Plumbing, electrical and the KNX automation backbone.", status: "In Progress" },
  { title: "Waterproofing & courtyard pool", description: "Tanking, the reflecting-pool tank and ponding tests.", status: "In Progress" },
  { title: "Finishes & joinery", description: "Microcement, flooring, ceilings and bespoke carpentry.", status: "Upcoming" },
  { title: "Furniture, lighting & automation", description: "Imported furniture, fixtures and the commissioned smart-home scenes.", status: "Upcoming" },
  { title: "Snagging & handover", description: "Defect closure, warranties and the final handover.", status: "Upcoming" },
];

export default async function JourneyPage() {
  const progress = await getProgress();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <SectionHeading
        eyebrow="Concept to handover"
        title="The build journey"
        description="Thirteen stages from first sketch to final handover. The home is currently in execution."
        className="mb-12"
      />

      <Timeline stages={STAGES} />

      <section className="mt-20">
        <h2 className="mb-6 font-serif text-2xl text-foreground">
          Recent site updates
        </h2>
        <div className="space-y-4">
          {progress.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-muted-foreground">{p.date}</span>
                <span className="font-serif text-lg text-foreground">
                  {p.phase}
                </span>
                <StatusBadge status={p.status} />
              </div>
              <p className="mt-2 text-muted-foreground">{p.workCompleted}</p>
              {p.nextAction && (
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Next:</span>{" "}
                  {p.nextAction}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

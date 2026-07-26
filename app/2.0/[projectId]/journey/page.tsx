"use client";

import { useEffect, useState } from "react";
import type { ProgressEntry } from "@/types";
import { api } from "@/lib/api-v2";
import { useProject } from "../V2ProjectChrome";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusBadge } from "@/components/StatusBadge";

const STAGES = [
  { title: "Concept & brief", description: "The family's brief, lifestyle goals and the contemporary-Zen direction.", status: "Completed" as const },
  { title: "Site & feasibility", description: "Plot study, orientation, climate response and massing of the three volumes.", status: "Completed" as const },
  { title: "Schematic design", description: "Plans, the courtyard section and the indoor-outdoor strategy.", status: "Completed" as const },
  { title: "Design development", description: "Material palette, interiors language and the lighting approach.", status: "Completed" as const },
  { title: "Working drawings", description: "Issued-for-construction drawings across architecture and MEP.", status: "Completed" as const },
  { title: "Approvals & permits", description: "Statutory approvals and sanction.", status: "Completed" as const },
  { title: "Structure & RCC frame", description: "Foundation, columns, slabs and the gable volume.", status: "Completed" as const },
  { title: "Masonry & blockwork", description: "Walls, openings and substrate preparation.", status: "In Progress" as const },
  { title: "MEP rough-in", description: "Plumbing, electrical and the KNX automation backbone.", status: "In Progress" as const },
  { title: "Waterproofing & courtyard pool", description: "Tanking, the reflecting-pool tank and ponding tests.", status: "In Progress" as const },
  { title: "Finishes & joinery", description: "Microcement, flooring, ceilings and bespoke carpentry.", status: "Upcoming" as const },
  { title: "Furniture, lighting & automation", description: "Imported furniture, fixtures and the commissioned smart-home scenes.", status: "Upcoming" as const },
  { title: "Snagging & handover", description: "Defect closure, warranties and the final handover.", status: "Upcoming" as const },
];

const STATUS_COLORS: Record<string, string> = {
  Completed: "bg-emerald-500",
  "In Progress": "bg-amber-500",
  Upcoming: "bg-muted-foreground/30",
};

export default function V2Journey() {
  const { selectedId } = useProject();
  const [progress, setProgress] = useState<ProgressEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.progress(selectedId).then(setProgress).catch((e) => setError(e.message));
  }, [selectedId]);

  if (error) return <p className="p-6 text-destructive">{error}</p>;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <SectionHeading eyebrow="Concept to handover" title="The build journey" description="Thirteen stages from first sketch to final handover. The home is currently in execution." className="mb-12" />

      <div className="relative pl-8">
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
        <div className="space-y-8">
          {STAGES.map((stage, i) => (
            <div key={i} className="relative flex items-start gap-4">
              <div className={`absolute -left-8 mt-1.5 h-[22px] w-[22px] rounded-full border-2 border-background ${STATUS_COLORS[stage.status]}`} />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-serif text-lg text-foreground">{stage.title}</h3>
                  <StatusBadge status={stage.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{stage.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {progress && progress.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-serif text-2xl text-foreground">Recent site updates</h2>
          <div className="space-y-4">
            {progress.map((p) => (
              <div key={p.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-muted-foreground">{p.date}</span>
                  <span className="font-serif text-lg text-foreground">{p.phase}</span>
                  <StatusBadge status={p.status} />
                </div>
                <p className="mt-2 text-muted-foreground">{p.workCompleted}</p>
                {p.nextAction && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Next:</span> {p.nextAction}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

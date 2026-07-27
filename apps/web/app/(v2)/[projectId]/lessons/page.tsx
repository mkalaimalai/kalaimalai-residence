"use client";

import { useEffect, useState } from "react";
import type { Lesson } from "@/types";
import { api } from "@/lib/api-v2";
import { useProject } from "../V2ProjectChrome";
import { SectionHeading } from "@/components/SectionHeading";

const IMPACT_LABELS: { key: "cost" | "time" | "quality" | "design"; label: string }[] = [
  { key: "cost", label: "Cost" },
  { key: "time", label: "Time" },
  { key: "quality", label: "Quality" },
  { key: "design", label: "Design" },
];

export default function V2Lessons() {
  const { selectedId } = useProject();
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.lessons(selectedId).then(setLessons).catch((e) => setError(e.message));
  }, [selectedId]);

  if (error) return <p className="p-6 text-destructive">{error}</p>;
  if (!lessons) return <LoadingState />;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <SectionHeading eyebrow="Hard-won" title="Lessons from the build" description="What we'd tell anyone building a home like this — captured against the decisions they shaped." className="mb-12" />
      <div className="space-y-8">
        {lessons.map((l) => (
          <article key={l.id} id={l.id} className="scroll-mt-24 rounded-xl border border-border bg-card p-7">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{l.category}</p>
            <h2 className="mt-2 font-serif text-2xl text-foreground">{l.title}</h2>
            <p className="mt-3 text-muted-foreground">{l.summary}</p>
            <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {IMPACT_LABELS.map(({ key, label }) => (
                <div key={key} className="rounded-lg bg-surface p-3">
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
                  <dd className="mt-1 text-sm text-foreground">{l.impact[key]}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-1 items-center justify-center py-32">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
    </div>
  );
}

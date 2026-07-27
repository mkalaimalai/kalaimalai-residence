import type { Metadata } from "next";
import { getLessons } from "@/lib/repository";
import { SectionHeading } from "@/components/SectionHeading";
import { JsonLd } from "@/components/JsonLd";
import { articleJsonLd, itemListJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Lessons · A Contemporary Zen Residence",
  description:
    "Hard-won learnings from the build — negotiation, hidden import costs, and normalising contractor quotes — each with its cost, time, quality and design impact.",
};

const IMPACT_LABELS: { key: "cost" | "time" | "quality" | "design"; label: string }[] = [
  { key: "cost", label: "Cost" },
  { key: "time", label: "Time" },
  { key: "quality", label: "Quality" },
  { key: "design", label: "Design" },
];

export default async function LessonsPage() {
  const lessons = await getLessons();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <JsonLd
        data={itemListJsonLd(lessons.map(articleJsonLd), { name: "Lessons" })}
      />
      <SectionHeading
        eyebrow="Hard-won"
        title="Lessons from the build"
        description="What we'd tell anyone building a home like this — captured against the decisions they shaped."
        className="mb-12"
      />

      <div className="space-y-8">
        {lessons.map((l) => (
          <article
            key={l.id}
            id={l.id}
            className="scroll-mt-24 rounded-xl border border-border bg-card p-7"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {l.category}
            </p>
            <h2 className="mt-2 font-serif text-2xl text-foreground">{l.title}</h2>
            <p className="mt-3 text-muted-foreground">{l.summary}</p>

            <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {IMPACT_LABELS.map(({ key, label }) => (
                <div key={key} className="rounded-lg bg-surface p-3">
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                    {label}
                  </dt>
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

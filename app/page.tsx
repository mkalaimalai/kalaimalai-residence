import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  getProject,
  getSpaces,
  getDomains,
  getLessons,
} from "@/lib/repository";
import { SectionHeading } from "@/components/SectionHeading";
import { SpaceCard } from "@/components/SpaceCard";
import { DomainCard } from "@/components/DomainCard";
import { JsonLd } from "@/components/JsonLd";
import { houseJsonLd, projectJsonLd, webSiteJsonLd } from "@/lib/jsonld";

export default async function Home() {
  const [project, spaces, domains, lessons] = await Promise.all([
    getProject(),
    getSpaces(),
    getDomains(),
    getLessons(),
  ]);

  const snapshot = [
    { label: "Spaces", value: `${spaces.length}` },
    { label: "Work domains", value: `${domains.length}` },
    { label: "Built-up area", value: project.builtUpArea },
    { label: "Floors", value: `${project.floors}` },
  ];

  return (
    <main className="flex flex-col">
      <JsonLd
        data={[webSiteJsonLd(project), projectJsonLd(project), houseJsonLd(project)]}
      />
      {/* Hero */}
      <section className="relative h-[78vh] min-h-[520px] w-full">
        <Image
          src={project.heroImage}
          alt={project.publicTitle}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-6xl px-6 pb-14">
            <p className="mb-4 text-sm uppercase tracking-[0.25em] text-white/80">
              {project.city}
            </p>
            <h1 className="max-w-3xl font-serif text-4xl leading-tight text-white sm:text-6xl">
              {project.publicTitle}
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/85 sm:text-lg">
              {project.publicSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/spaces"
                className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Explore the spaces <ArrowRight size={16} />
              </Link>
              <Link
                href="/vision"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                The vision
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Snapshot */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-12 sm:grid-cols-4">
          {snapshot.map((s) => (
            <div key={s.label}>
              <div className="font-serif text-3xl text-foreground">{s.value}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vision teaser */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Design vision
        </p>
        <p className="mt-5 font-serif text-2xl leading-relaxed text-foreground sm:text-3xl">
          {project.conceptStatement}
        </p>
        <Link
          href="/vision"
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Read the philosophy <ArrowRight size={16} />
        </Link>
      </section>

      {/* Explore by space */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Room by room"
            title="Explore by space"
            description="Each room as an archive — design intent, palette, lighting, and the people and decisions behind it."
          />
          <Link
            href="/spaces"
            className="hidden shrink-0 items-center gap-1 text-sm text-muted-foreground hover:text-foreground sm:inline-flex"
          >
            All spaces <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.slice(0, 6).map((s) => (
            <SpaceCard key={s.id} space={s} />
          ))}
        </div>
      </section>

      {/* Explore by domain */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Discipline by discipline"
            title="Explore by domain"
            description="From architecture and structure to automation and procurement."
          />
          <Link
            href="/domains"
            className="hidden shrink-0 items-center gap-1 text-sm text-muted-foreground hover:text-foreground sm:inline-flex"
          >
            All domains <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {domains.slice(0, 6).map((d) => (
            <DomainCard key={d.id} domain={d} />
          ))}
        </div>
      </section>

      {/* Featured lessons */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <SectionHeading
          eyebrow="Hard-won"
          title="Lessons from the build"
          description="The negotiation and hidden-cost learnings that shaped key decisions."
          className="mb-8"
        />
        <div className="grid gap-6 sm:grid-cols-3">
          {lessons.map((l) => (
            <Link
              key={l.id}
              href="/lessons"
              className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground/20 hover:bg-accent/20"
            >
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {l.category}
              </p>
              <h3 className="mt-2 font-serif text-lg text-foreground">{l.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                {l.summary}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

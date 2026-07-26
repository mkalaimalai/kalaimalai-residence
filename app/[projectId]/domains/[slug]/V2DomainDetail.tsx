"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Space, Domain, Drawing, Vendor, Lesson } from "@/types";
import { api } from "@/lib/api-v2";
import { useProject } from "../../V2ProjectChrome";
import { byIds, drawingsByIds, vendorsByIds, lessonsByIds } from "@/lib/relations";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusBadge } from "@/components/StatusBadge";
import { Chip, ChipGroup } from "@/components/Chip";

interface SeedData {
  spaces: Space[]; domains: Domain[]; drawings: Drawing[]; vendors: Vendor[]; lessons: Lesson[];
}

export function V2DomainDetail({ slug, seed }: { slug: string; seed: SeedData }) {
  const { selectedId } = useProject();
  const [domain, setDomain] = useState<Domain | undefined>(seed.domains.find(d => d.slug === slug));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.domainBySlug(slug, selectedId).then(d => { if (d) setDomain(d); }).catch((e) => setError(e.message));
  }, [slug, selectedId]);

  if (error) return <p className="p-6 text-destructive">{error}</p>;
  if (!domain) return null;

  const { spaces, drawings, vendors, lessons } = seed;
  const relSpaces = byIds(domain.spaceIds, spaces);
  const relDrawings = drawingsByIds(domain.drawingIds, drawings);
  const relVendors = vendorsByIds(domain.vendorIds, vendors);
  const relLessons = lessonsByIds(domain.lessonIds, lessons);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <Link href={`/${selectedId}/domains`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={15} /> All domains
      </Link>

      <div className="mb-10 flex flex-wrap items-center gap-4">
        <div>
          <h1 className="font-serif text-4xl text-foreground sm:text-5xl">{domain.name}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{domain.description}</p>
        </div>
        <StatusBadge status={domain.status} />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          {relSpaces.length > 0 && (
            <section>
              <SectionHeading eyebrow="Connected to" title="Spaces" className="mb-4" />
              <div className="space-y-3">
                {relSpaces.map((s) => (
                  <Link key={s.id} href={`/${selectedId}/spaces/${s.slug}`} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-accent/20">
                    <div>
                      <h3 className="font-serif text-lg text-foreground">{s.name}</h3>
                      <p className="text-sm text-muted-foreground">{s.description}</p>
                    </div>
                    <ArrowUpRight size={18} className="shrink-0 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-8">
          {relVendors.length > 0 && (
            <ChipGroup label="Vendors">
              {relVendors.map((v) => <Chip key={v.id} label={v.name} />)}
            </ChipGroup>
          )}
          {relDrawings.length > 0 && (
            <ChipGroup label="Drawings">
              {relDrawings.map((d) => <Chip key={d.id} label={`${d.title} (${d.revision})`} />)}
            </ChipGroup>
          )}
          {relLessons.length > 0 && (
            <ChipGroup label="Lessons">
              {relLessons.map((l) => <Chip key={l.id} label={l.title} href={`/${selectedId}/lessons`} />)}
            </ChipGroup>
          )}
        </aside>
      </div>
    </main>
  );
}

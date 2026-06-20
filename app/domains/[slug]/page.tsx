import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getDomainBySlug,
  getDomains,
  getSpaces,
  getDrawings,
  getVendors,
  getLessons,
} from "@/lib/repository";
import {
  spacesByIds,
  drawingsByIds,
  vendorsByIds,
  lessonsByIds,
} from "@/lib/relations";
import { StatusBadge } from "@/components/StatusBadge";
import { Chip, ChipGroup } from "@/components/Chip";
import { JsonLd } from "@/components/JsonLd";
import { domainJsonLd, itemListJsonLd, vendorJsonLd } from "@/lib/jsonld";
import { DomainMediaTabs } from "@/components/DomainMediaTabs";
import { renderingsByDomain } from "@/data/renderings";
import { drawingSheetsByDomain } from "@/data/drawingSheets";

export async function generateStaticParams() {
  const domains = await getDomains();
  return domains.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const domain = await getDomainBySlug(slug);
  if (!domain) return { title: "Domain not found" };
  return {
    title: `${domain.name} · A Contemporary Zen Residence`,
    description: domain.description,
  };
}

export default async function DomainDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const domain = await getDomainBySlug(slug);
  if (!domain) notFound();

  const [spaces, drawings, vendors, lessons] = await Promise.all([
    getSpaces(),
    getDrawings(),
    getVendors(),
    getLessons(),
  ]);

  const relSpaces = spacesByIds(domain.spaceIds, spaces);
  const relDrawings = drawingsByIds(domain.drawingIds, drawings);
  const relVendors = vendorsByIds(domain.vendorIds, vendors);
  const relLessons = lessonsByIds(domain.lessonIds, lessons);

  const renderingSets = renderingsByDomain[domain.slug] ?? [];
  const drawingSets = drawingSheetsByDomain[domain.slug] ?? [];

  const domainLd = domainJsonLd(domain);
  const jsonLd = relVendors.length
    ? [domainLd, itemListJsonLd(relVendors.map(vendorJsonLd), {
        name: `${domain.name} vendors`,
      })]
    : domainLd;

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <JsonLd data={jsonLd} />
      <Link
        href="/domains"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={15} /> All domains
      </Link>

      <div className="flex flex-wrap items-center gap-4">
        <h1 className="font-serif text-4xl text-foreground sm:text-5xl">
          {domain.name}
        </h1>
        <StatusBadge status={domain.status} />
      </div>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        {domain.description}
      </p>

      <DomainMediaTabs
        renderingSets={renderingSets}
        drawingSets={drawingSets}
      />

      <div className="mt-12 grid gap-10 sm:grid-cols-2">
        {relSpaces.length > 0 && (
          <ChipGroup label="Related spaces">
            {relSpaces.map((s) => (
              <Chip key={s.id} label={s.name} href={`/spaces/${s.slug}`} />
            ))}
          </ChipGroup>
        )}

        {relVendors.length > 0 && (
          <ChipGroup label="Vendors">
            {relVendors.map((v) => (
              <Chip key={v.id} label={v.name} />
            ))}
          </ChipGroup>
        )}

        {relDrawings.length > 0 && (
          <ChipGroup label="Drawings">
            {relDrawings.map((d) => (
              <Chip key={d.id} label={`${d.title} (${d.revision})`} />
            ))}
          </ChipGroup>
        )}

        {relLessons.length > 0 && (
          <ChipGroup label="Lessons">
            {relLessons.map((l) => (
              <Chip key={l.id} label={l.title} href="/lessons" />
            ))}
          </ChipGroup>
        )}
      </div>

      {relSpaces.length === 0 &&
        relVendors.length === 0 &&
        relDrawings.length === 0 &&
        relLessons.length === 0 && (
          <p className="mt-8 text-sm text-muted-foreground">
            Details for this domain are being documented.
          </p>
        )}
    </main>
  );
}

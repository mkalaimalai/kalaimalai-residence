import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getSpaceBySlug,
  getSpaces,
  getDomains,
  getDrawings,
  getVendors,
  getDecisions,
  getLessons,
  getMaterials,
  getProject,
  getGallery,
} from "@/lib/repository";
import {
  byIds,
  drawingsByIds,
  vendorsByIds,
  decisionsByIds,
  lessonsByIds,
  materialsByIds,
} from "@/lib/relations";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusBadge } from "@/components/StatusBadge";
import { Chip, ChipGroup } from "@/components/Chip";
import { JsonLd } from "@/components/JsonLd";
import { drawingSheetsBySpace } from "@/data/drawingSheets";
import { roomJsonLd } from "@/lib/jsonld";
import { SpaceMediaTabs } from "@/components/SpaceMediaTabs";

export async function generateStaticParams() {
  const spaces = await getSpaces();
  return spaces.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const space = await getSpaceBySlug(slug);
  if (!space) return { title: "Space not found" };
  return {
    title: `${space.name} · A Contemporary Zen Residence`,
    description: space.description,
  };
}

export default async function SpaceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const space = await getSpaceBySlug(slug);
  if (!space) notFound();

  const [allSpaces, domains, drawings, vendors, decisions, lessons, materials, project, gallery] =
    await Promise.all([
      getSpaces(),
      getDomains(),
      getDrawings(),
      getVendors(),
      getDecisions(),
      getLessons(),
      getMaterials(),
      getProject(),
      getGallery(),
    ]);

  const relDomains = byIds(space.domainIds, domains);
  const relMaterials = materialsByIds(space.materialIds, materials);
  const relDrawings = drawingsByIds(space.drawingIds, drawings);
  const relVendors = vendorsByIds(space.vendorIds, vendors);
  const relDecisions = decisionsByIds(space.decisionIds, decisions);
  const relLessons = lessonsByIds(space.lessonIds, lessons);

  // Related spaces = others sharing at least one domain.
  const domainSet = new Set(space.domainIds);
  const relatedSpaces = allSpaces
    .filter((s) => s.id !== space.id && s.domainIds.some((d) => domainSet.has(d)))
    .slice(0, 3);

  // Gallery items specific to this space.
  const spaceGallery = gallery.filter((g) => g.spaceId === space.id);

  return (
    <main className="flex flex-col">
      <JsonLd data={roomJsonLd(space, project, relDrawings)} />
      <section className="relative h-[56vh] min-h-[400px] w-full">
        <Image
          src={space.image}
          alt={space.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-5xl px-6 pb-12">
            <Link
              href="/spaces"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white"
            >
              <ArrowLeft size={15} /> All spaces
            </Link>
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="font-serif text-4xl text-white sm:text-5xl">
                {space.name}
              </h1>
              <StatusBadge status={space.status} />
            </div>
            <p className="mt-3 max-w-xl text-white/85">{space.description}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-12 px-6 py-16 lg:grid-cols-[1.4fr_1fr]">
        {/* Main column */}
        <div className="space-y-10">
          <div className="space-y-3">
            <SectionHeading eyebrow="Design intent" title="The idea" />
            <p className="text-lg leading-relaxed text-muted-foreground">
              {space.designIntent}
            </p>
          </div>

          {relMaterials.length > 0 && (
            <ChipGroup label="Palette & materials">
              {relMaterials.map((m) => (
                <Chip key={m.id} label={m.name} />
              ))}
            </ChipGroup>
          )}

          {space.furniture.length > 0 && (
            <ChipGroup label="Furniture">
              {space.furniture.map((f) => (
                <Chip key={f} label={f} />
              ))}
            </ChipGroup>
          )}

          {space.lighting.length > 0 && (
            <ChipGroup label="Lighting & scenes">
              {space.lighting.map((l) => (
                <Chip key={l} label={l} />
              ))}
            </ChipGroup>
          )}
        </div>

        {/* Side column — connections */}
        <aside className="space-y-8">
          {relDomains.length > 0 && (
            <ChipGroup label="Domains">
              {relDomains.map((d) => (
                <Chip key={d.id} label={d.name} href={`/domains/${d.slug}`} />
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

          {relDecisions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Decisions
              </h3>
              <ul className="space-y-2">
                {relDecisions.map((d) => (
                  <li
                    key={d.id}
                    className="rounded-lg border border-border bg-card p-3 text-sm"
                  >
                    <span className="text-foreground">{d.title}</span>
                    <span className="mt-1 block text-muted-foreground">
                      {d.finalDecision}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {relLessons.length > 0 && (
            <ChipGroup label="Lessons">
              {relLessons.map((l) => (
                <Chip key={l.id} label={l.title} href="/lessons" />
              ))}
            </ChipGroup>
          )}
        </aside>
      </div>

      <SpaceMediaTabs
        galleryItems={spaceGallery}
        drawingSets={drawingSheetsBySpace[space.slug] ?? []}
        drawingChips={relDrawings.map((d) => ({
          id: d.id,
          label: `${d.title} (${d.revision})`,
        }))}
      />

      {/* Related spaces */}
      {relatedSpaces.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-20">
          <h2 className="mb-6 font-serif text-2xl text-foreground">
            Related spaces
          </h2>
          <div className="flex flex-wrap gap-3">
            {relatedSpaces.map((s) => (
              <Chip key={s.id} label={s.name} href={`/spaces/${s.slug}`} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

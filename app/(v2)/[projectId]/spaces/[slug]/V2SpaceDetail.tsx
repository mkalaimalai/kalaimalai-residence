"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Space, Domain, Drawing, Vendor, Decision, Lesson, Material, GalleryItem } from "@/types";
import { api, type MediaSet } from "@/lib/api-v2";
import { useProject } from "../../V2ProjectChrome";
import { byIds, drawingsByIds, vendorsByIds, decisionsByIds, lessonsByIds, materialsByIds } from "@/lib/relations";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusBadge } from "@/components/StatusBadge";
import { Chip, ChipGroup } from "@/components/Chip";
import { SpaceMediaTabs } from "@/components/SpaceMediaTabs";
import { splitByKind } from "@/lib/media";

interface SeedData {
  spaces: Space[]; domains: Domain[]; drawings: Drawing[]; vendors: Vendor[];
  decisions: Decision[]; lessons: Lesson[]; materials: Material[]; gallery: GalleryItem[];
}

export function V2SpaceDetail({ slug, seed }: { slug: string; seed: SeedData }) {
  const { selectedId } = useProject();
  const [space, setSpace] = useState<Space | undefined>(seed.spaces.find(s => s.slug === slug));
  const [media, setMedia] = useState<MediaSet[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.spaceBySlug(slug, selectedId).then(s => { if (s) setSpace(s); }).catch((e) => setError(e.message));
  }, [slug, selectedId]);

  // By resolved space **id**, not slug — slugs are unique per project only. Kept in its
  // own effect so a media failure (the endpoint is behind require_user) costs the tabs
  // and nothing else.
  useEffect(() => {
    if (!space) return;
    let live = true;
    api
      .mediaSets({ projectId: selectedId, spaceId: space.id })
      .then((sets) => { if (live) setMedia(sets); })
      .catch(() => { if (live) setMedia([]); });
    return () => { live = false; };
  }, [space, selectedId]);

  if (error) return <p className="p-6 text-destructive">{error}</p>;
  if (!space) return null;

  const { spaces, domains, drawings, vendors, decisions, lessons, materials, gallery } = seed;

  const relDomains = byIds(space.domainIds, domains);
  const relMaterials = materialsByIds(space.materialIds, materials);
  const relDrawings = drawingsByIds(space.drawingIds, drawings);
  const relVendors = vendorsByIds(space.vendorIds, vendors);
  const relDecisions = decisionsByIds(space.decisionIds, decisions);
  const relLessons = lessonsByIds(space.lessonIds, lessons);

  const domainSet = new Set(space.domainIds);
  const relatedSpaces = spaces.filter((s) => s.id !== space.id && s.domainIds.some((d) => domainSet.has(d))).slice(0, 3);
  const spaceGallery = gallery.filter((g) => g.spaceId === space.id);
  // Spaces own drawing sheets only; renderings are grouped by domain, and the
  // "Renderings" tab here is the space's gallery items (same split as 1.0).
  const { drawings: drawingSets } = splitByKind(media);

  return (
    <main className="flex flex-col">
      <section className="relative h-[56vh] min-h-[400px] w-full">
        <Image src={space.image} alt={space.name} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-5xl px-6 pb-12">
            <Link href={`/${selectedId}/spaces`} className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white">
              <ArrowLeft size={15} /> All spaces
            </Link>
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="font-serif text-4xl text-white sm:text-5xl">{space.name}</h1>
              <StatusBadge status={space.status} />
            </div>
            <p className="mt-3 max-w-xl text-white/85">{space.description}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-12 px-6 py-16 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-10">
          <div className="space-y-3">
            <SectionHeading eyebrow="Design intent" title="The idea" />
            <p className="text-lg leading-relaxed text-muted-foreground">{space.designIntent}</p>
          </div>
          {relMaterials.length > 0 && (
            <ChipGroup label="Palette & materials">
              {relMaterials.map((m) => <Chip key={m.id} label={m.name} />)}
            </ChipGroup>
          )}
          {space.furniture.length > 0 && (
            <ChipGroup label="Furniture">
              {space.furniture.map((f) => <Chip key={f} label={f} />)}
            </ChipGroup>
          )}
          {space.lighting.length > 0 && (
            <ChipGroup label="Lighting & scenes">
              {space.lighting.map((l) => <Chip key={l} label={l} />)}
            </ChipGroup>
          )}
        </div>

        <aside className="space-y-8">
          {relDomains.length > 0 && (
            <ChipGroup label="Domains">
              {relDomains.map((d) => <Chip key={d.id} label={d.name} href={`/${selectedId}/domains/${d.slug}`} />)}
            </ChipGroup>
          )}
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
          {relDecisions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Decisions</h3>
              <ul className="space-y-2">
                {relDecisions.map((d) => (
                  <li key={d.id} className="rounded-lg border border-border bg-card p-3 text-sm">
                    <span className="text-foreground">{d.title}</span>
                    <span className="mt-1 block text-muted-foreground">{d.finalDecision}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {relLessons.length > 0 && (
            <ChipGroup label="Lessons">
              {relLessons.map((l) => <Chip key={l.id} label={l.title} href={`/${selectedId}/lessons`} />)}
            </ChipGroup>
          )}
        </aside>
      </div>

      {/* Replaces the old standalone gallery grid: 1.0 folds the space's gallery items
          into the "Renderings" tab and its drawing sheets into "Drawings", and both
          trees should present the same thing the same way. */}
      <SpaceMediaTabs
        galleryItems={spaceGallery}
        drawingSets={drawingSets}
        drawingChips={relDrawings.map((d) => ({
          id: d.id,
          label: `${d.title} (${d.revision})`,
        }))}
      />

      {relatedSpaces.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-20">
          <h2 className="mb-6 font-serif text-2xl text-foreground">Related spaces</h2>
          <div className="flex flex-wrap gap-3">
            {relatedSpaces.map((s) => (
              <Chip key={s.id} label={s.name} href={`/${selectedId}/spaces/${s.slug}`} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

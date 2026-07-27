import type { Metadata } from "next";
import { getGallery } from "@/lib/repository";
import { SectionHeading } from "@/components/SectionHeading";
import { GalleryGrid } from "@/components/GalleryGrid";
import { JsonLd } from "@/components/JsonLd";
import { imageObjectJsonLd, itemListJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Gallery · A Contemporary Zen Residence",
  description:
    "Renders, drawings, progress and final imagery — filter the full visual archive of the residence.",
};

export default async function GalleryPage() {
  const gallery = await getGallery();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <JsonLd
        data={itemListJsonLd(gallery.map(imageObjectJsonLd), { name: "Gallery" })}
      />
      <SectionHeading
        eyebrow="The visual archive"
        title="Gallery"
        description="Exterior renders and interior visualisations across the home. Filter by category."
        className="mb-10"
      />
      <GalleryGrid items={gallery} />
    </main>
  );
}

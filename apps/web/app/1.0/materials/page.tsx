import type { Metadata } from "next";
import { getMaterials } from "@/lib/repository";
import { SectionHeading } from "@/components/SectionHeading";
import { MaterialsLibrary } from "@/components/MaterialsLibrary";
import { JsonLd } from "@/components/JsonLd";
import { itemListJsonLd, productJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Materials · A Contemporary Zen Residence",
  description:
    "The material library — microcement, marble, teak veneer, the exterior slat screen and engineered quartz.",
};

export default async function MaterialsPage() {
  const materials = await getMaterials();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <JsonLd
        data={itemListJsonLd(materials.map(productJsonLd), { name: "Materials" })}
      />
      <SectionHeading
        eyebrow="The palette"
        title="Materials"
        description="A quiet, warm and tactile palette — filter by category to explore each finish and where it lives in the home."
        className="mb-10"
      />
      <MaterialsLibrary materials={materials} />
    </main>
  );
}

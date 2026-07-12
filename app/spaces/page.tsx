import type { Metadata } from "next";
import { getSpaces, getProject } from "@/lib/repository";
import { SectionHeading } from "@/components/SectionHeading";
import { SpaceCard } from "@/components/SpaceCard";
import { JsonLd } from "@/components/JsonLd";
import { itemListJsonLd, roomJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Spaces · A Contemporary Zen Residence",
  description:
    "Room by room — living, dining, kitchen, bedrooms, toilets, courtyard, terrace, landscape and the multipurpose room.",
};

export default async function SpacesPage() {
  const [spaces, project] = await Promise.all([getSpaces(), getProject()]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <JsonLd
        data={itemListJsonLd(
          spaces.map((s) => roomJsonLd(s, project)),
          { name: "Spaces" },
        )}
      />
      <SectionHeading
        eyebrow="Room by room"
        title="Spaces"
        description="Each room as a living archive — design intent, palette, lighting, furniture, and the decisions and people behind it."
        className="mb-10"
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {spaces.map((s) => (
          <SpaceCard key={s.id} space={s} />
        ))}
      </div>
    </main>
  );
}

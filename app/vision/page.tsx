import type { Metadata } from "next";
import Image from "next/image";
import { getProject } from "@/lib/repository";
import { SectionHeading } from "@/components/SectionHeading";
import { JsonLd } from "@/components/JsonLd";
import { houseJsonLd, projectJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Vision · A Contemporary Zen Residence",
  description:
    "The philosophy behind the residence — lifestyle goals, site and climate response, indoor-outdoor living, the courtyard, material and light, and the smart home.",
};

const concepts = [
  "Contemporary Minimalism",
  "Biophilic Design",
  "Zen Minimalism",
  "Japandi",
  "Contemporary Zen",
  "Scandinavian",
];

const pillars = [
  {
    title: "Lifestyle goals",
    body: "A calm family home that slows the day down — spaces that flow into one another, framed views, and a quiet material palette that ages gracefully.",
  },
  {
    title: "Site & climate response",
    body: "Three board-formed concrete volumes step around a central court to shade and cross-ventilate. Vertical teak slats filter the harsh western sun while keeping the interiors open.",
  },
  {
    title: "Indoor–outdoor living",
    body: "Full-height sliding glass dissolves the line between living spaces and the courtyard. The garden, terrace and pergola extend the home outward.",
  },
  {
    title: "The courtyard",
    body: "A still reflecting pool and a single frangipani anchor the plan — cooling the section, mirroring the sky, and tying every room back to a shared centre.",
  },
  {
    title: "Material & light",
    body: "Microcement, teak veneer, natural marble and warm metals; daylight as the primary ornament, layered after dark with cove, accent and sculptural fixtures.",
  },
  {
    title: "The smart home",
    body: "An open KNX backbone runs lighting, climate, shading and AV scenes — chosen for serviceability and freedom from proprietary lock-in.",
  },
];

export default async function VisionPage() {
  const project = await getProject();

  return (
    <main className="flex flex-col">
      <JsonLd data={[projectJsonLd(project), houseJsonLd(project)]} />
      <section className="relative h-[60vh] min-h-[400px] w-full">
        <Image
          src={project.heroImage}
          alt={project.publicTitle}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-4xl px-6 pb-12">
            <p className="mb-3 text-sm uppercase tracking-[0.25em] text-white/80">
              Vision
            </p>
            <h1 className="font-serif text-4xl text-white sm:text-5xl">
              A calm, contemporary Zen home
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-serif text-2xl leading-relaxed text-foreground">
          {project.conceptStatement}
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <SectionHeading
          eyebrow="Design language"
          title="Key design concepts"
          className="mb-8"
        />
        <ul className="mb-10 flex flex-wrap gap-3">
          {concepts.map((c) => (
            <li
              key={c}
              className="rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground"
            >
              {c}
            </li>
          ))}
        </ul>
        <div className="max-w-3xl space-y-6 text-muted-foreground">
          <p>
            The residence blends sleek, minimalist geometries with cohesive
            masses. By thoughtfully situating openings and transition areas, the
            home achieves a seamless fusion of indoor and outdoor spaces. The
            tranquil north-east green court — with its serene water body and lush
            greenery — floods the interiors with soft, diffused sunlight while
            offering an intimate open area for family life. The private spaces on
            the upper floors enjoy picturesque views of this inviting courtyard.
          </p>
          <p>
            Embracing the edge, where minimalist geometry meets architectural
            mastery: behind every simple form lies a complex tapestry of effort —
            unseen but vital. Clean lines and a restrained material palette of
            neutral tones and seamless finishes give the home its spatial
            clarity, with light and indoor–outdoor flow as the defining ornament.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <SectionHeading
          eyebrow="Principles"
          title="What guided every decision"
          className="mb-10"
        />
        <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {pillars.map((p) => (
            <div key={p.title} className="space-y-2">
              <h3 className="font-serif text-xl text-foreground">{p.title}</h3>
              <p className="text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import { getDomains } from "@/lib/repository";
import { SectionHeading } from "@/components/SectionHeading";
import { DomainCard } from "@/components/DomainCard";
import { JsonLd } from "@/components/JsonLd";
import { domainJsonLd, itemListJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Domains · A Contemporary Zen Residence",
  description:
    "The disciplines behind the home — architecture, interiors, structure, MEP, lighting, carpentry, automation, procurement and project management.",
};

export default async function DomainsPage() {
  const domains = await getDomains();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <JsonLd
        data={itemListJsonLd(domains.map(domainJsonLd), { name: "Domains" })}
      />
      <SectionHeading
        eyebrow="Discipline by discipline"
        title="Domains"
        description="How the home came together across fourteen domains of work — each with its drawings, vendors, related spaces and status."
        className="mb-10"
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {domains.map((d) => (
          <DomainCard key={d.id} domain={d} />
        ))}
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { Domain } from "@/types";
import { api } from "@/lib/api-v2";
import { useProject } from "../V2ProjectChrome";
import { SectionHeading } from "@/components/SectionHeading";
import { DomainCard } from "@/components/DomainCard";

export default function V2Domains() {
  const { selectedId } = useProject();
  const [domains, setDomains] = useState<Domain[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.domains(selectedId).then(setDomains).catch((e) => setError(e.message));
  }, [selectedId]);

  if (error) return <p className="p-6 text-destructive">{error}</p>;
  if (!domains) return <LoadingState />;

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeading eyebrow="Discipline by discipline" title="Domains" description="The fourteen work domains that shaped the home — from architecture to project management." className="mb-10" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {domains.map((d) => <DomainCard key={d.id} domain={d} basePath={`/${selectedId}`} />)}
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-1 items-center justify-center py-32">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
    </div>
  );
}

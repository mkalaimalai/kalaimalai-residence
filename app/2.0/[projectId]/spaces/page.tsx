"use client";

import { useEffect, useState } from "react";
import type { Space } from "@/types";
import { api } from "@/lib/api-v2";
import { useProject } from "../V2ProjectChrome";
import { SectionHeading } from "@/components/SectionHeading";
import { SpaceCard } from "@/components/SpaceCard";

export default function V2Spaces() {
  const { selectedId } = useProject();
  const [spaces, setSpaces] = useState<Space[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.spaces(selectedId).then(setSpaces).catch((e) => setError(e.message));
  }, [selectedId]);

  if (error) return <p className="p-6 text-destructive">{error}</p>;
  if (!spaces) return <LoadingState />;

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeading eyebrow="Room by room" title="Spaces" description="Each room as a living archive — design intent, palette, lighting, furniture, and the decisions and people behind it." className="mb-10" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {spaces.map((s) => <SpaceCard key={s.id} space={s} />)}
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

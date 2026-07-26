"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api, type PublicProject } from "@/lib/api-v2";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusBadge } from "@/components/StatusBadge";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function V2Projects() {
  const [projects, setProjects] = useState<PublicProject[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.publicProjects().then(setProjects).catch((e) => setError(e.message));
  }, []);

  // The portfolio index carries no project chrome, so it owns the theme switcher itself.
  const themeBar = (
    <div className="mx-auto flex w-full max-w-6xl justify-end px-6 pt-6">
      <ThemeToggle />
    </div>
  );

  if (error)
    return (
      <>
        {themeBar}
        <p className="p-6 text-destructive">{error}</p>
      </>
    );
  if (!projects)
    return (
      <>
        {themeBar}
        <LoadingState />
      </>
    );

  return (
    <>
      {themeBar}
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-10">
        <SectionHeading
          eyebrow="Portfolio"
          title="Projects"
          description="Every residence in the archive. Open one to explore its spaces, materials, and gallery."
          className="mb-10"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/2.0/${p.id}`}
              className="group block overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <Image
                  src={p.heroImage}
                  alt={p.publicTitle}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="space-y-2 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-serif text-xl text-foreground">{p.publicTitle}</h3>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-sm text-muted-foreground">{p.city}</p>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {p.publicSubtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-1 items-center justify-center py-32">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
    </div>
  );
}

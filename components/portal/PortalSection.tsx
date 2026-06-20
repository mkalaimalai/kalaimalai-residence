"use client";

import { usePortalData } from "./PortalDataProvider";

/**
 * Shared portal page chrome: title + subtitle, with loading/error states driven by the
 * PortalDataProvider. Children (the data tables) render only once live data has loaded,
 * so the static shell stays empty.
 */
export function PortalSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { loading, error } = usePortalData();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-serif text-3xl text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </header>
      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Couldn’t load data: {error}
        </p>
      ) : loading ? (
        <p className="px-1 py-8 text-sm text-muted-foreground">Loading…</p>
      ) : (
        children
      )}
    </div>
  );
}

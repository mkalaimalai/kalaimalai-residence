import type { Metadata } from "next";
import { getSnags, getSpaces } from "@/lib/repository";
import { SnagTable } from "@/components/portal/SnagTable";

export const metadata: Metadata = { title: "Snags" };

export default async function SnagsPage() {
  const [snags, spaces] = await Promise.all([getSnags(), getSpaces()]);
  const spaceNames = Object.fromEntries(spaces.map((s) => [s.id, s.name]));

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-serif text-3xl text-foreground">Snags</h1>
        <p className="text-sm text-muted-foreground">
          Defect and punch list by space, priority and closure status.
        </p>
      </header>
      <SnagTable rows={snags} spaceNames={spaceNames} />
    </div>
  );
}

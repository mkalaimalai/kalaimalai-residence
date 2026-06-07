import type { Metadata } from "next";
import { getDrawings, getDomains, getSpaces } from "@/lib/repository";
import { DrawingTable } from "@/components/portal/DrawingTable";

export const metadata: Metadata = { title: "Drawings" };

export default async function DrawingsPage() {
  const [drawings, domains, spaces] = await Promise.all([
    getDrawings(),
    getDomains(),
    getSpaces(),
  ]);
  const domainNames = Object.fromEntries(domains.map((d) => [d.id, d.name]));
  const spaceNames = Object.fromEntries(spaces.map((s) => [s.id, s.name]));

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-serif text-3xl text-foreground">Drawings</h1>
        <p className="text-sm text-muted-foreground">
          All drawing sheets across domains and rooms, with revision and status.
        </p>
      </header>
      <DrawingTable rows={drawings} domainNames={domainNames} spaceNames={spaceNames} />
    </div>
  );
}

import type { Metadata } from "next";
import { getDecisions, getDomains } from "@/lib/repository";
import { DecisionTable } from "@/components/portal/DecisionTable";

export const metadata: Metadata = { title: "Decisions" };

export default async function DecisionsPage() {
  const [decisions, domains] = await Promise.all([getDecisions(), getDomains()]);
  const domainNames = Object.fromEntries(domains.map((d) => [d.id, d.name]));

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-serif text-3xl text-foreground">Decisions</h1>
        <p className="text-sm text-muted-foreground">
          The decision log — options considered, the call made, and why.
        </p>
      </header>
      <DecisionTable rows={decisions} domainNames={domainNames} />
    </div>
  );
}

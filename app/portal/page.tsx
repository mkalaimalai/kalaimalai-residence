import {
  getDrawings,
  getDecisions,
  getVendors,
  getProcurement,
  getSnags,
  getBOQs,
  getProgress,
  getSpaces,
} from "@/lib/repository";
import { spaceById } from "@/lib/relations";
import { DashboardMetricCard } from "@/components/portal/DashboardMetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { formatINR } from "@/lib/utils";

const OPEN_DECISIONS = new Set(["Open", "Revisit"]);
const PENDING_PROCUREMENT = new Set([
  "Identified",
  "Quoted",
  "Negotiating",
  "Ordered",
  "Shipped",
]);
const CLOSED_SNAGS = new Set(["Fixed", "Verified", "Closed"]);

export default async function PortalDashboard() {
  const [drawings, decisions, vendors, procurement, snags, boqs, progress, spaces] =
    await Promise.all([
      getDrawings(),
      getDecisions(),
      getVendors(),
      getProcurement(),
      getSnags(),
      getBOQs(),
      getProgress(),
      getSpaces(),
    ]);

  const openDecisions = decisions.filter((d) => OPEN_DECISIONS.has(d.status));
  const activeVendors = vendors.filter((v) => v.finalized);
  const pendingProcurement = procurement.filter((p) =>
    PENDING_PROCUREMENT.has(p.status),
  );
  const openSnags = snags.filter((s) => !CLOSED_SNAGS.has(s.status));
  const unpaidBoqs = boqs.filter((b) => b.paymentStatus !== "Fully Paid");
  const outstanding = unpaidBoqs.reduce(
    (sum, b) => sum + (b.paymentStatus === "Part Paid" ? b.total / 2 : b.total),
    0,
  );

  const recent = [...progress]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="font-serif text-3xl text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Live snapshot across drawings, decisions, vendors, procurement and site
          progress.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <DashboardMetricCard
          label="Drawings"
          value={drawings.length}
          hint="issued & in review"
          href="/portal/drawings"
        />
        <DashboardMetricCard
          label="Open decisions"
          value={openDecisions.length}
          hint={`of ${decisions.length} logged`}
          href="/portal/decisions"
        />
        <DashboardMetricCard
          label="Active vendors"
          value={activeVendors.length}
          hint={`of ${vendors.length} total`}
          href="/portal/vendors"
        />
        <DashboardMetricCard
          label="Pending procurement"
          value={pendingProcurement.length}
          hint={`of ${procurement.length} items`}
          href="/portal/procurement"
        />
        <DashboardMetricCard
          label="Open snags"
          value={openSnags.length}
          hint={`of ${snags.length} raised`}
          href="/portal/snags"
        />
        <DashboardMetricCard
          label="Outstanding"
          value={formatINR(Math.round(outstanding))}
          hint={`${unpaidBoqs.length} BOQ(s) due`}
          href="/portal/boq"
        />
      </div>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-foreground">Recent updates</h2>
        <div className="divide-y divide-border rounded-xl border border-border">
          {recent.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              No progress entries yet.
            </p>
          )}
          {recent.map((p) => {
            const space = spaceById(p.spaceId, spaces);
            return (
              <div
                key={p.id}
                className="flex flex-wrap items-start justify-between gap-2 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{p.workCompleted}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.date} · {p.phase}
                    {space ? ` · ${space.name}` : ""}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

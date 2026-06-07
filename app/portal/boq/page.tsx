import type { Metadata } from "next";
import { getBOQs, getVendors } from "@/lib/repository";
import { BOQTable } from "@/components/portal/BOQTable";

export const metadata: Metadata = { title: "BOQ" };

export default async function BOQPage() {
  const [boqs, vendors] = await Promise.all([getBOQs(), getVendors()]);
  const vendorNames = Object.fromEntries(vendors.map((v) => [v.id, v.name]));

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-serif text-3xl text-foreground">
          Bills of Quantity
        </h1>
        <p className="text-sm text-muted-foreground">
          Quotes by vendor — original vs negotiated, totals incl. GST, and
          payment status.
        </p>
      </header>
      <BOQTable rows={boqs} vendorNames={vendorNames} />
    </div>
  );
}

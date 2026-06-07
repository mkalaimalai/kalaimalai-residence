import type { Metadata } from "next";
import { getProcurement, getSpaces, getVendors } from "@/lib/repository";
import { ProcurementTable } from "@/components/portal/ProcurementTable";

export const metadata: Metadata = { title: "Procurement" };

export default async function ProcurementPage() {
  const [procurement, spaces, vendors] = await Promise.all([
    getProcurement(),
    getSpaces(),
    getVendors(),
  ]);
  const spaceNames = Object.fromEntries(spaces.map((s) => [s.id, s.name]));
  const vendorNames = Object.fromEntries(vendors.map((v) => [v.id, v.name]));

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-serif text-3xl text-foreground">Procurement</h1>
        <p className="text-sm text-muted-foreground">
          Sourcing pipeline. EUR items show an estimated landed ₹ cost (≈1.75×
          ex-works incl. freight, duty and GST).
        </p>
      </header>
      <ProcurementTable rows={procurement} spaceNames={spaceNames} vendorNames={vendorNames} />
    </div>
  );
}

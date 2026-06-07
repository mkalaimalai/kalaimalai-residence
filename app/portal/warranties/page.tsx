import type { Metadata } from "next";
import { getWarranties, getVendors } from "@/lib/repository";
import { WarrantyTable } from "@/components/portal/WarrantyTable";

export const metadata: Metadata = { title: "Warranties" };

export default async function WarrantiesPage() {
  const [warranties, vendors] = await Promise.all([getWarranties(), getVendors()]);
  const vendorNames = Object.fromEntries(vendors.map((v) => [v.id, v.name]));

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-serif text-3xl text-foreground">Warranties</h1>
        <p className="text-sm text-muted-foreground">
          Equipment and finish warranties, with coverage dates and service
          contacts.
        </p>
      </header>
      <WarrantyTable rows={warranties} vendorNames={vendorNames} />
    </div>
  );
}

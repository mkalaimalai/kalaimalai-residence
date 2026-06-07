import type { Metadata } from "next";
import { getVendors } from "@/lib/repository";
import { VendorTable } from "@/components/portal/VendorTable";

export const metadata: Metadata = { title: "Vendors" };

export default async function VendorsPage() {
  const vendors = await getVendors();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-serif text-3xl text-foreground">Vendors</h1>
        <p className="text-sm text-muted-foreground">
          Suppliers and contractors, with contact, location and rating.
        </p>
      </header>
      <VendorTable rows={vendors} />
    </div>
  );
}

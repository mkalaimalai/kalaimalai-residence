import type { Metadata } from "next";
import { getSpaces, getMaterials, getVendors } from "@/lib/repository";
import { RoomMatrix } from "@/components/portal/RoomMatrix";

export const metadata: Metadata = { title: "Room Matrix" };

export default async function RoomMatrixPage() {
  const [spaces, materials, vendors] = await Promise.all([
    getSpaces(),
    getMaterials(),
    getVendors(),
  ]);
  const materialNames = Object.fromEntries(materials.map((m) => [m.id, m.name]));
  const vendorNames = Object.fromEntries(vendors.map((v) => [v.id, v.name]));

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-serif text-3xl text-foreground">Room Matrix</h1>
        <p className="text-sm text-muted-foreground">
          One row per space — finishes, furniture, lighting, systems and vendors
          at a glance.
        </p>
      </header>
      <RoomMatrix rows={spaces} materialNames={materialNames} vendorNames={vendorNames} />
    </div>
  );
}

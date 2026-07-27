"use client";

import { ProcurementTable } from "@/components/portal/ProcurementTable";
import { nameMap, usePortalData } from "@/components/portal/PortalDataProvider";
import { PortalSection } from "@/components/portal/PortalSection";

export default function ProcurementPage() {
  const { data } = usePortalData();
  return (
    <PortalSection
      title="Procurement"
      subtitle="Sourcing pipeline. EUR items show an estimated landed ₹ cost (≈1.75× ex-works incl. freight, duty and GST)."
    >
      <ProcurementTable
        rows={data.procurement}
        spaceNames={nameMap(data.spaces)}
        vendorNames={nameMap(data.vendors)}
      />
    </PortalSection>
  );
}

"use client";

import { nameMap, usePortalData } from "@/components/portal/PortalDataProvider";
import { PortalSection } from "@/components/portal/PortalSection";
import { WarrantyTable } from "@/components/portal/WarrantyTable";

export default function WarrantiesPage() {
  const { data } = usePortalData();
  return (
    <PortalSection
      title="Warranties"
      subtitle="Equipment and finish warranties, with coverage dates and service contacts."
    >
      <WarrantyTable rows={data.warranties} vendorNames={nameMap(data.vendors)} />
    </PortalSection>
  );
}

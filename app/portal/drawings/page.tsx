"use client";

import { DrawingTable } from "@/components/portal/DrawingTable";
import { nameMap, usePortalData } from "@/components/portal/PortalDataProvider";
import { PortalSection } from "@/components/portal/PortalSection";

export default function DrawingsPage() {
  const { data } = usePortalData();
  return (
    <PortalSection
      title="Drawings"
      subtitle="All drawing sheets across domains and rooms, with revision and status."
    >
      <DrawingTable
        rows={data.drawings}
        domainNames={nameMap(data.domains)}
        spaceNames={nameMap(data.spaces)}
      />
    </PortalSection>
  );
}

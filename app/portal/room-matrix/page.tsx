"use client";

import { nameMap, usePortalData } from "@/components/portal/PortalDataProvider";
import { PortalSection } from "@/components/portal/PortalSection";
import { RoomMatrix } from "@/components/portal/RoomMatrix";

export default function RoomMatrixPage() {
  const { data } = usePortalData();
  return (
    <PortalSection
      title="Room Matrix"
      subtitle="One row per space — finishes, furniture, lighting, systems and vendors at a glance."
    >
      <RoomMatrix
        rows={data.spaces}
        materialNames={nameMap(data.materials)}
        vendorNames={nameMap(data.vendors)}
      />
    </PortalSection>
  );
}

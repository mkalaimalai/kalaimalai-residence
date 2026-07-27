"use client";

import { nameMap, usePortalData } from "@/components/portal/PortalDataProvider";
import { PortalSection } from "@/components/portal/PortalSection";
import { SnagTable } from "@/components/portal/SnagTable";

export default function SnagsPage() {
  const { data } = usePortalData();
  return (
    <PortalSection
      title="Snags"
      subtitle="Defect and punch list by space, priority and closure status."
    >
      <SnagTable rows={data.snags} spaceNames={nameMap(data.spaces)} />
    </PortalSection>
  );
}

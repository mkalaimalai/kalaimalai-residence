"use client";

import { nameMap, usePortalData } from "@/components/portal/PortalDataProvider";
import { PortalSection } from "@/components/portal/PortalSection";
import { ProgressTable } from "@/components/portal/ProgressTable";

export default function ProgressPage() {
  const { data } = usePortalData();
  return (
    <PortalSection
      title="Progress"
      subtitle="Site progress log by date and phase, with the next action per entry."
    >
      <ProgressTable rows={data.progress} spaceNames={nameMap(data.spaces)} />
    </PortalSection>
  );
}

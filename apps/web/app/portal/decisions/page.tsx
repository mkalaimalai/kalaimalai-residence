"use client";

import { DecisionTable } from "@/components/portal/DecisionTable";
import { nameMap, usePortalData } from "@/components/portal/PortalDataProvider";
import { PortalSection } from "@/components/portal/PortalSection";

export default function DecisionsPage() {
  const { data } = usePortalData();
  return (
    <PortalSection
      title="Decisions"
      subtitle="The decision log — options considered, the call made, and why."
    >
      <DecisionTable rows={data.decisions} domainNames={nameMap(data.domains)} />
    </PortalSection>
  );
}

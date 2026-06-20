"use client";

import { BOQTable } from "@/components/portal/BOQTable";
import { nameMap, usePortalData } from "@/components/portal/PortalDataProvider";
import { PortalSection } from "@/components/portal/PortalSection";

export default function BOQPage() {
  const { data } = usePortalData();
  return (
    <PortalSection
      title="Bills of Quantity"
      subtitle="Quotes by vendor — original vs negotiated, totals incl. GST, and payment status."
    >
      <BOQTable rows={data.boqs} vendorNames={nameMap(data.vendors)} />
    </PortalSection>
  );
}

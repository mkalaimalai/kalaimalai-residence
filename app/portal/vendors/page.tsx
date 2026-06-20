"use client";

import { usePortalData } from "@/components/portal/PortalDataProvider";
import { PortalSection } from "@/components/portal/PortalSection";
import { VendorTable } from "@/components/portal/VendorTable";

export default function VendorsPage() {
  const { data } = usePortalData();
  return (
    <PortalSection
      title="Vendors"
      subtitle="Suppliers and contractors, with contact, location and rating."
    >
      <VendorTable rows={data.vendors} />
    </PortalSection>
  );
}

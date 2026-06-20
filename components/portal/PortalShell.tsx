"use client";

import { PortalDataProvider } from "./PortalDataProvider";
import { PortalSidebar } from "./PortalSidebar";
import { SupabaseAuthGate } from "./SupabaseAuthGate";

/**
 * Portal chrome: a real Supabase auth gate wrapping a sidebar + content layout. The gate
 * is outermost so nothing renders until signed in; inside it, PortalDataProvider loads
 * live data from the API (client-side, so no portal data is baked into the static build).
 */
export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthGate>
      <PortalDataProvider>
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col md:flex-row">
          <PortalSidebar />
          <div className="min-w-0 flex-1 px-5 py-8 md:px-8">{children}</div>
        </div>
      </PortalDataProvider>
    </SupabaseAuthGate>
  );
}

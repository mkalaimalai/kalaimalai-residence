"use client";

import { PortalDataProvider } from "./PortalDataProvider";
import { PortalProjectProvider, PortalProjectPicker } from "./PortalProjectProvider";
import { PortalSidebar } from "./PortalSidebar";
import { SupabaseAuthGate } from "./SupabaseAuthGate";

/**
 * Portal chrome: a real Supabase auth gate wrapping a sidebar + content layout. The gate
 * is outermost so nothing renders until signed in; inside it, PortalProjectProvider owns
 * which project is being administered and PortalDataProvider loads that project's live
 * data from the API (client-side, so no portal data is baked into the static build).
 *
 * Project provider sits ABOVE the data provider: picking a project changes the scope the
 * data provider reads with, so it must be able to re-fetch in response.
 */
export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthGate>
      <PortalProjectProvider>
        <PortalDataProvider>
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col md:flex-row">
            <PortalSidebar />
            <div className="min-w-0 flex-1 px-5 py-8 md:px-8">
              <div className="mb-6 flex justify-end">
                <PortalProjectPicker />
              </div>
              {children}
            </div>
          </div>
        </PortalDataProvider>
      </PortalProjectProvider>
    </SupabaseAuthGate>
  );
}

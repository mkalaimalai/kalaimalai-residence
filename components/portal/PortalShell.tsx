"use client";

import { PasswordGate } from "./PasswordGate";
import { PortalSidebar } from "./PortalSidebar";

/**
 * Portal chrome: the passcode gate wrapping a sidebar + content layout. The
 * gate is outermost so the sidebar/structure stays hidden until unlocked.
 */
export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <PasswordGate>
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col md:flex-row">
        <PortalSidebar />
        <div className="min-w-0 flex-1 px-5 py-8 md:px-8">{children}</div>
      </div>
    </PasswordGate>
  );
}

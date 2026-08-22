"use client";

/**
 * Sign out of the 2.0 tree. No explicit redirect: `V2AuthGate` subscribes to
 * `onAuthStateChange`, so clearing the session is what sends the user to `/login`.
 * Routing from here as well would race that.
 */
import { useState } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-v2";
import { cn } from "@kr/api-client";

export function SignOutButton({ className }: { className?: string }) {
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      aria-label="Sign out"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await signOut();
      }}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50",
        className,
      )}
    >
      <LogOut size={16} />
      <span className="hidden sm:inline">Sign out</span>
    </button>
  );
}

/**
 * Route-group layout for the 2.0 tree. `(v2)` is a grouping only — it adds nothing to
 * the URL, so `/` and `/[projectId]/**` keep their paths while gaining a shared gate
 * that `/1.0/**` and `/portal/**` (which lives outside the group) do not inherit.
 */
import { V2AuthGate } from "@/components/v2/V2AuthGate";

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <V2AuthGate>{children}</V2AuthGate>
    </div>
  );
}

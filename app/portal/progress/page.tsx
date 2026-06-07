import type { Metadata } from "next";
import { getProgress, getSpaces } from "@/lib/repository";
import { ProgressTable } from "@/components/portal/ProgressTable";

export const metadata: Metadata = { title: "Progress" };

export default async function ProgressPage() {
  const [progress, spaces] = await Promise.all([getProgress(), getSpaces()]);
  const spaceNames = Object.fromEntries(spaces.map((s) => [s.id, s.name]));

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-serif text-3xl text-foreground">Progress</h1>
        <p className="text-sm text-muted-foreground">
          Site progress log by date and phase, with the next action per entry.
        </p>
      </header>
      <ProgressTable rows={progress} spaceNames={spaceNames} />
    </div>
  );
}

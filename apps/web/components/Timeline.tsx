import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

export interface TimelineStage {
  title: string;
  description: string;
  status: "Completed" | "In Progress" | "Upcoming";
}

export function Timeline({ stages }: { stages: TimelineStage[] }) {
  return (
    <ol className="relative space-y-8 border-l border-border pl-8">
      {stages.map((stage, i) => (
        <li key={stage.title} className="relative">
          <span
            className={cn(
              "absolute -left-[39px] flex h-5 w-5 items-center justify-center rounded-full border-2",
              stage.status === "Completed"
                ? "border-primary bg-primary"
                : stage.status === "In Progress"
                  ? "border-primary bg-background"
                  : "border-border bg-background",
            )}
            aria-hidden
          />
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-serif text-xl text-foreground">{stage.title}</h3>
              <StatusBadge status={stage.status} />
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {stage.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

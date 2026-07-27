import { cn } from "@/lib/utils";

/**
 * Status pill. Maps any status string to a tone by keyword so it works across
 * the different status enums (space, domain, drawing, procurement, snag, …).
 */
type Tone = "neutral" | "progress" | "done" | "warn" | "alert";

function toneFor(status: string): Tone {
  const s = status.toLowerCase();
  if (/(completed|approved|closed|verified|fixed|installed|delivered|fully paid)/.test(s))
    return "done";
  if (/(execution|in progress|design|negotiating|ordered|shipped|for review|advance|part paid)/.test(s))
    return "progress";
  if (/(revisit|open|draft|identified|quoted|unpaid|not started)/.test(s)) return "warn";
  if (/(critical|overdue|superseded|high)/.test(s)) return "alert";
  return "neutral";
}

const toneClasses: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  progress: "bg-accent/50 text-accent-foreground border-accent",
  done: "bg-primary/10 text-primary border-primary/20",
  warn: "bg-muted text-foreground border-border",
  alert: "bg-destructive/10 text-destructive border-destructive/30",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClasses[toneFor(status)],
        className,
      )}
    >
      {status}
    </span>
  );
}

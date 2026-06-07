import Link from "next/link";
import type { ReactNode } from "react";

/** Summary metric tile for the portal dashboard. */
export function DashboardMetricCard({
  label,
  value,
  hint,
  href,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  href?: string;
  icon?: ReactNode;
}) {
  const inner = (
    <div className="flex h-full flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/30">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-medium uppercase tracking-[0.14em]">
          {label}
        </span>
        {icon}
      </div>
      <span className="font-serif text-3xl text-foreground">{value}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

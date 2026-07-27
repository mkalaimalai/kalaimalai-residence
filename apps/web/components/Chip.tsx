import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  href?: string; // when present, renders a link; otherwise static display chip
  className?: string;
}

/**
 * Small labelled chip. Pass `href` only when a public target exists — records
 * without a public page (vendors, drawings, decisions) render as static chips,
 * which keeps every rendered link valid.
 */
export function Chip({ label, href, className }: ChipProps) {
  const base =
    "inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-sm text-foreground";
  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "transition-colors hover:border-foreground/30 hover:bg-accent/40",
          className,
        )}
      >
        {label}
      </Link>
    );
  }
  return <span className={cn(base, "text-muted-foreground", className)}>{label}</span>;
}

/** A labelled group of chips; renders nothing when empty. */
export function ChipGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const hasChildren = Array.isArray(children)
    ? children.some(Boolean)
    : Boolean(children);
  if (!hasChildren) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

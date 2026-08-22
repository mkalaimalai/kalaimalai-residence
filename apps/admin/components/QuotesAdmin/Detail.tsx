import { labelClass } from "./shared";

export function Detail({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className={labelClass}>{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

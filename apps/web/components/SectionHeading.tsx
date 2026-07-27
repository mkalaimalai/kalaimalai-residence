import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}

/** Editorial section header — eyebrow + serif title + optional lede. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "space-y-3",
        align === "center" && "text-center mx-auto max-w-2xl",
        className,
      )}
    >
      {eyebrow && (
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <h2 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

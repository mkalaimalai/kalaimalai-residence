import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Domain } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";

export function DomainCard({ domain, basePath = "" }: { domain: Domain; basePath?: string }) {
  return (
    <Link
      href={`${basePath}/domains/${domain.slug}`}
      className="group flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground/20 hover:bg-accent/20"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-xl text-foreground">{domain.name}</h3>
          <ArrowUpRight
            size={18}
            className="mt-1 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {domain.description}
        </p>
      </div>
      <StatusBadge status={domain.status} />
    </Link>
  );
}

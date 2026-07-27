import Image from "next/image";
import Link from "next/link";
import type { Space } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";

export function SpaceCard({ space, basePath = "" }: { space: Space; basePath?: string }) {
  return (
    <Link
      href={`${basePath}/spaces/${space.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={space.image}
          alt={space.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="space-y-2 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif text-xl text-foreground">{space.name}</h3>
          <StatusBadge status={space.status} />
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {space.description}
        </p>
      </div>
    </Link>
  );
}

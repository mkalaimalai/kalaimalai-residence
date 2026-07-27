import Image from "next/image";
import { Layers } from "lucide-react";
import type { Material } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";

export function MaterialCard({ material }: { material: Material }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative aspect-[3/2] bg-muted">
        {material.image ? (
          <Image
            src={material.image}
            alt={material.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Layers size={28} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="space-y-2 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif text-lg text-foreground">{material.name}</h3>
          <StatusBadge status={material.status} />
        </div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {material.category}
        </p>
        {material.notes && (
          <p className="text-sm text-muted-foreground">{material.notes}</p>
        )}
      </div>
    </div>
  );
}

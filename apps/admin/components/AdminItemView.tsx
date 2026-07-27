"use client";

/**
 * Dispatches one nav item to its view: the generic registry-driven form for entities,
 * or a purpose-built component for the aggregates the flat registry cannot express
 * (quotes carry line items; media sets carry nested subsections).
 *
 * Client-side because the reference lists these views need come from `useAuth`-scoped
 * fetches, and the whole admin app is behind the auth gate anyway.
 */
import { useCallback, useEffect, useState } from "react";
import { apiGet, scopedPath } from "@/lib/api-client";
import { ENTITY_BY_KEY } from "@/lib/admin-schema";
import { useProject } from "@/components/ProjectProvider";
import { MediaAdmin } from "@/components/MediaAdmin";
import { QuotesAdmin } from "@/components/QuotesAdmin";
import { UsersAdmin } from "@/components/UsersAdmin";
import { EntityAdmin } from "./EntityAdmin";

type NamedRow = { id: string; name: string };

/** Load one reference list (id + display name) for the bespoke views. */
function useRefList(entityKey: string, projectId: string): NamedRow[] {
  const [rows, setRows] = useState<NamedRow[]>([]);

  const load = useCallback(async () => {
    const def = ENTITY_BY_KEY[entityKey];
    if (!def) return;
    void projectId; // refetch trigger
    try {
      const data = await apiGet<Record<string, unknown>[]>(
        scopedPath(def.endpoint),
      );
      setRows(
        data.map((r) => ({
          id: String(r.id),
          name: String(r[def.titleField] ?? r.id),
        })),
      );
    } catch {
      // A missing reference list degrades the select to empty; the view still loads
      // and the server rejects an unresolvable reference anyway.
      setRows([]);
    }
  }, [entityKey, projectId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return rows;
}

export function AdminItemView({
  section,
  item,
}: {
  section: string;
  item: string;
}) {
  const { selectedId: projectId } = useProject();
  const vendors = useRefList("vendors", projectId);
  const boqs = useRefList("boq", projectId);
  const domains = useRefList("domains", projectId);
  const spaces = useRefList("spaces", projectId);

  if (item === "quotes") {
    return (
      <section className="space-y-4">
        <h1 className="font-serif text-2xl text-foreground">Quotes</h1>
        <QuotesAdmin projectId={projectId} vendors={vendors} boqs={boqs} />
      </section>
    );
  }

  if (item === "users") {
    // No project prop: users belong to the installation, not to a project.
    return <UsersAdmin />;
  }

  if (item === "media") {
    return (
      <section className="space-y-4">
        <h1 className="font-serif text-2xl text-foreground">
          Renderings &amp; sheets
        </h1>
        <MediaAdmin projectId={projectId} domains={domains} spaces={spaces} />
      </section>
    );
  }

  // Everything else is registry-driven. `section` is not needed to render — it only
  // decides where the item sits in the nav.
  void section;
  // Keyed so navigating between entities remounts: an open form or a search term must
  // not leak from Spaces into Domains.
  return <EntityAdmin key={item} entityKey={item} />;
}

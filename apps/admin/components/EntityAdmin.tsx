"use client";

/**
 * One entity's list + form, driven by the registry in `lib/admin-schema.ts`.
 *
 * This is the old `/portal/admin` page split per entity: there the whole registry was a
 * row of tabs and everything lived in one component, which meant the URL never told you
 * where you were. Here the route is the state, and this renders exactly one entity.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  apiGet,
  apiPatch,
  apiPost,
  ApiError,
  scopedPath,
  withProject,
} from "@/lib/api-client";
import { ENTITY_BY_KEY, type EntityDef, type RefKey } from "@/lib/admin-schema";
import { EntityForm } from "@/components/portal/EntityForm";
import { SpaceFilesPanel } from "@/components/portal/admin/SpaceFilesPanel";
import { useAuth } from "@/components/v2/V2AuthGate";
import { usePortalProject } from "@/components/portal/PortalProjectProvider";
import { cn } from "@/lib/utils";

type Row = Record<string, unknown>;
type RefRows = Partial<Record<RefKey, { id: string; name: string }[]>>;

/** Reference lists the forms need for their id-selects. */
const REF_KEYS: RefKey[] = [
  "spaces", "domains", "vendors", "materials", "drawings", "decisions", "lessons",
  "boq",
];

export function EntityAdmin({ entityKey }: { entityKey: string }) {
  const entity: EntityDef | undefined = ENTITY_BY_KEY[entityKey];
  const { isAdmin } = useAuth();
  const { selectedId: projectId } = usePortalProject();

  const [refs, setRefs] = useState<RefRows>({});
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadRefs = useCallback(async () => {
    void projectId; // refetch trigger; scopedPath() resolves the project internally
    const entries = await Promise.all(
      REF_KEYS.map(async (key) => {
        const def = ENTITY_BY_KEY[key];
        const data = await apiGet<Row[]>(scopedPath(def.endpoint));
        return [
          key,
          data.map((r) => ({
            id: String(r.id),
            name: String(r[def.titleField] ?? r.id),
          })),
        ] as const;
      }),
    );
    setRefs(Object.fromEntries(entries));
  }, [projectId]);

  const loadRows = useCallback(async () => {
    if (!entity) return;
    void projectId;
    setListLoading(true);
    setListError(null);
    try {
      setRows(await apiGet<Row[]>(scopedPath(entity.endpoint)));
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setListLoading(false);
    }
  }, [entity, projectId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRefs();
  }, [loadRefs]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRows();
  }, [loadRows]);
  // Note: switching entity does NOT need a state reset here — AdminItemView keys this
  // component by entity, so React remounts it and the open form/search go with it.

  const visible = useMemo(() => {
    if (!entity || !query.trim()) return rows;
    const q = query.trim().toLowerCase();
    return rows.filter((r) =>
      String(r[entity.titleField] ?? "").toLowerCase().includes(q) ||
      String(r.id ?? "").toLowerCase().includes(q),
    );
  }, [rows, query, entity]);

  if (!entity) {
    return (
      <p className="text-sm text-muted-foreground">
        Unknown entity <code>{entityKey}</code>.
      </p>
    );
  }

  const save = async (payload: Row) => {
    setBusy(true);
    setFormError(null);
    try {
      if (editing && editing !== "new") {
        await apiPatch(`${entity.endpoint}/${editing.id}`, payload);
      } else {
        // `Project` is the tenant root — it has no `projectId` of its own.
        await apiPost(
          entity.endpoint,
          withProject(payload, { scoped: entity.key !== "projects" }),
        );
      }
      setEditing(null);
      await Promise.all([loadRows(), loadRefs()]);
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Save failed. Check your inputs.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <section className="max-w-4xl space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="font-serif text-2xl text-foreground">
            {editing === "new"
              ? `New ${entity.label.replace(/s$/, "")}`
              : String(editing[entity.titleField] ?? entity.label)}
          </h1>
          {editing !== "new" && (
            <code className="text-xs text-muted-foreground">
              {String(editing.id)}
            </code>
          )}
        </div>

        <div className="rounded-xl border border-border p-5">
          <EntityForm
            entity={entity}
            row={editing === "new" ? null : editing}
            refs={refs}
            busy={busy}
            error={formError}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          >
            {/* Uploads need an id to attach to, so only on an existing space. */}
            {entity.key === "spaces" && editing !== "new" && (
              <SpaceFilesPanel
                projectId={projectId}
                spaceId={String(editing.id)}
                spaceName={String(editing.name ?? "Space")}
              />
            )}
          </EntityForm>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-foreground">{entity.label}</h1>
          <p className="text-sm text-muted-foreground">
            {listLoading ? "Loading…" : `${rows.length} record${rows.length === 1 ? "" : "s"}`}
            {entity.key !== "projects" && " in this project"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              aria-label={`Search ${entity.label}`}
              className="w-44 rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-sm text-foreground outline-none focus:border-foreground"
            />
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setEditing("new");
              }}
              className="flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              <Plus size={15} /> New
            </button>
          )}
        </div>
      </div>

      {listError ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {listError}
        </p>
      ) : listLoading ? (
        <p className="px-1 py-6 text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="hidden px-4 py-2 font-medium sm:table-cell">Id</th>
                <th className="w-20 px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-muted-foreground">
                    {rows.length === 0
                      ? `No ${entity.label.toLowerCase()} yet.`
                      : `Nothing matches “${query}”.`}
                  </td>
                </tr>
              )}
              {visible.map((r) => (
                <tr key={String(r.id)} className="hover:bg-muted/40">
                  <td className="max-w-0 truncate px-4 py-2.5 text-foreground">
                    {String(r[entity.titleField] ?? r.id)}
                  </td>
                  <td className="hidden px-4 py-2.5 sm:table-cell">
                    <code className="text-xs text-muted-foreground">
                      {String(r.id)}
                    </code>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setFormError(null);
                        setEditing(r);
                      }}
                      className={cn(
                        "rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted",
                        "text-foreground",
                      )}
                    >
                      {isAdmin ? "Edit" : "View"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

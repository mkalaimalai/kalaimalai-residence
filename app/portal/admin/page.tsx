"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { apiGet, apiPatch, apiPost, ApiError } from "@/lib/api-client";
import {
  ENTITIES,
  ENTITY_BY_KEY,
  type EntityDef,
  type RefKey,
} from "@/lib/admin-schema";
import { EntityForm } from "@/components/portal/EntityForm";
import { useAuth } from "@/components/portal/SupabaseAuthGate";
import { cn } from "@/lib/utils";

type Row = Record<string, unknown>;
type RefRows = Partial<Record<RefKey, { id: string; name: string }[]>>;

const REF_KEYS: RefKey[] = [
  "spaces", "domains", "vendors", "materials", "drawings", "decisions", "lessons",
];

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [activeKey, setActiveKey] = useState(ENTITIES[0].key);
  const [refs, setRefs] = useState<RefRows>({});
  const [rows, setRows] = useState<Row[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const entity = ENTITY_BY_KEY[activeKey];

  const loadRefs = useCallback(async () => {
    const entries = await Promise.all(
      REF_KEYS.map(async (key) => {
        const def = ENTITY_BY_KEY[key];
        const data = await apiGet<Row[]>(def.endpoint);
        const mapped = data.map((r) => ({
          id: String(r.id),
          name: String(r[def.titleField] ?? r.id),
        }));
        return [key, mapped] as const;
      }),
    );
    setRefs(Object.fromEntries(entries));
  }, []);

  const loadRows = useCallback(async (def: EntityDef) => {
    setListLoading(true);
    setListError(null);
    try {
      setRows(await apiGet<Row[]>(def.endpoint));
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    // Mount-time data fetch: state updates happen after the await inside loadRefs.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRefs();
  }, [loadRefs]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRows(entity);
  }, [entity, loadRows]);

  const save = async (payload: Row) => {
    setBusy(true);
    setFormError(null);
    try {
      if (editing && editing !== "new") {
        await apiPatch(`${entity.endpoint}/${editing.id}`, payload);
      } else {
        await apiPost(entity.endpoint, payload);
      }
      setEditing(null);
      await Promise.all([loadRows(entity), loadRefs()]);
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Save failed. Check your inputs.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="space-y-2">
        <h1 className="font-serif text-3xl text-foreground">Admin</h1>
        <p className="text-sm text-muted-foreground">
          You need the <code>admin</code> role to manage records.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-serif text-3xl text-foreground">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Create and edit records. Writes are validated server-side — references must
          resolve.
        </p>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {ENTITIES.map((e) => (
          <button
            key={e.key}
            onClick={() => {
              setActiveKey(e.key);
              setEditing(null);
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              e.key === activeKey
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {e.label}
          </button>
        ))}
      </div>

      {editing ? (
        <section className="rounded-xl border border-border p-5">
          <h2 className="mb-4 font-serif text-xl text-foreground">
            {editing === "new" ? `New ${entity.label}` : `Edit ${entity.label}`}
          </h2>
          <EntityForm
            entity={entity}
            row={editing === "new" ? null : editing}
            refs={refs}
            busy={busy}
            error={formError}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        </section>
      ) : (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-foreground">{entity.label}</h2>
            <button
              onClick={() => {
                setFormError(null);
                setEditing("new");
              }}
              className="flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              <Plus size={15} /> New
            </button>
          </div>

          {listError ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {listError}
            </p>
          ) : listLoading ? (
            <p className="px-1 py-6 text-sm text-muted-foreground">Loading…</p>
          ) : (
            <div className="divide-y divide-border rounded-xl border border-border">
              {rows.length === 0 && (
                <p className="px-4 py-6 text-sm text-muted-foreground">
                  No {entity.label.toLowerCase()} yet.
                </p>
              )}
              {rows.map((r) => (
                <div
                  key={String(r.id)}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">
                      {String(r[entity.titleField] ?? r.id)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {String(r.id)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setFormError(null);
                      setEditing(r);
                    }}
                    className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

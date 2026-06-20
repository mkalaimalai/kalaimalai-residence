"use client";

import { useState } from "react";
import type { EntityDef, FieldDef, RefKey } from "@/lib/admin-schema";

type RefRows = Partial<Record<RefKey, { id: string; name: string }[]>>;

function initialValues(
  entity: EntityDef,
  row: Record<string, unknown> | null,
): Record<string, unknown> {
  const base = row ? (entity.fromRow ? entity.fromRow(row) : row) : {};
  const values: Record<string, unknown> = {};
  for (const f of entity.fields) {
    const v = base[f.name];
    if (f.type === "boolean") values[f.name] = Boolean(v);
    else if (f.type === "number") values[f.name] = v ?? 0;
    else if (f.type === "idMultiSelect" || f.type === "stringList")
      values[f.name] = Array.isArray(v) ? v : [];
    else values[f.name] = v ?? "";
  }
  return values;
}

export function EntityForm({
  entity,
  row,
  refs,
  busy,
  error,
  onSubmit,
  onCancel,
}: {
  entity: EntityDef;
  row: Record<string, unknown> | null;
  refs: RefRows;
  busy: boolean;
  error: string | null;
  onSubmit: (payload: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState(() => initialValues(entity, row));

  const set = (name: string, v: unknown) =>
    setValues((prev) => ({ ...prev, [name]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = entity.toPayload ? entity.toPayload(values) : values;
    onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {entity.fields.map((f) => (
          <Field
            key={f.name}
            field={f}
            value={values[f.name]}
            refs={refs}
            onChange={(v) => set(f.name, v)}
          />
        ))}
      </div>
      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Saving…" : row ? "Save changes" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  field,
  value,
  refs,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  refs: RefRows;
  onChange: (v: unknown) => void;
}) {
  const label = (
    <span className="mb-1 block text-xs font-medium text-muted-foreground">
      {field.label}
    </span>
  );
  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground";

  const wide = ["textarea", "idMultiSelect", "stringList"].includes(field.type);

  const control = (() => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            rows={3}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        );
      case "number":
        return (
          <input
            type="number"
            step="any"
            value={Number(value ?? 0)}
            onChange={(e) => onChange(Number(e.target.value))}
            className={inputClass}
          />
        );
      case "boolean":
        return (
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
            />
            Yes
          </label>
        );
      case "date":
        return (
          <input
            type="date"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        );
      case "enum":
        return (
          <select
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          >
            {field.options?.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        );
      case "idSelect": {
        const rows = (field.ref && refs[field.ref]) || [];
        return (
          <select
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          >
            <option value="">— none —</option>
            {rows.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        );
      }
      case "idMultiSelect": {
        const rows = (field.ref && refs[field.ref]) || [];
        const selected = new Set((value as string[]) ?? []);
        return (
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
            {rows.length === 0 && (
              <p className="text-xs text-muted-foreground">No options</p>
            )}
            {rows.map((r) => (
              <label
                key={r.id}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <input
                  type="checkbox"
                  checked={selected.has(r.id)}
                  onChange={(e) => {
                    const next = new Set(selected);
                    if (e.target.checked) next.add(r.id);
                    else next.delete(r.id);
                    onChange([...next]);
                  }}
                />
                {r.name}
              </label>
            ))}
          </div>
        );
      }
      case "stringList":
        return (
          <textarea
            rows={3}
            value={((value as string[]) ?? []).join("\n")}
            onChange={(e) =>
              onChange(
                e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
            className={inputClass}
            placeholder="One per line"
          />
        );
      default:
        return (
          <input
            type="text"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        );
    }
  })();

  return (
    <label className={wide ? "sm:col-span-2" : undefined}>
      {label}
      {control}
    </label>
  );
}

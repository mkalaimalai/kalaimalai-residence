"use client";

import { useState } from "react";
import {
  emptyHeader,
  inputClass,
  labelClass,
  primaryButton,
  secondaryButton,
  CURRENCIES,
  COMPARISON_STATUSES,
  type HeaderDraft,
  type RefRow,
} from "./shared";

export function QuoteHeaderForm({
  vendors,
  boqs,
  busy,
  error,
  onSubmit,
  onCancel,
}: {
  vendors: RefRow[];
  boqs: RefRow[];
  busy: boolean;
  error: string | null;
  onSubmit: (draft: HeaderDraft) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<HeaderDraft>(emptyHeader);

  const set = <K extends keyof HeaderDraft>(key: K, value: HeaderDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(draft);
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Vendor *</span>
          <select
            required
            value={draft.vendorId}
            onChange={(e) => set("vendorId", e.target.value)}
            className={inputClass}
          >
            <option value="">— select —</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={labelClass}>BOQ</span>
          <select
            value={draft.boqId}
            onChange={(e) => set("boqId", e.target.value)}
            className={inputClass}
          >
            <option value="">— none —</option>
            {boqs.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={labelClass}>Quote number</span>
          <input
            type="text"
            value={draft.quoteNumber}
            onChange={(e) => set("quoteNumber", e.target.value)}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Currency</span>
          <select
            value={draft.currency}
            onChange={(e) => set("currency", e.target.value)}
            className={inputClass}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={labelClass}>Quote date</span>
          <input
            type="date"
            value={draft.quoteDate}
            onChange={(e) => set("quoteDate", e.target.value)}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Valid until</span>
          <input
            type="date"
            value={draft.validUntil}
            onChange={(e) => set("validUntil", e.target.value)}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Total amount</span>
          <input
            type="number"
            step="any"
            value={draft.totalAmount}
            onChange={(e) => set("totalAmount", Number(e.target.value))}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Tax amount</span>
          <input
            type="number"
            step="any"
            value={draft.taxAmount}
            onChange={(e) => set("taxAmount", Number(e.target.value))}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Comparison status</span>
          <select
            value={draft.comparisonStatus}
            onChange={(e) => set("comparisonStatus", e.target.value)}
            className={inputClass}
          >
            {COMPARISON_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={labelClass}>Document id</span>
          <input
            type="text"
            value={draft.documentId}
            onChange={(e) => set("documentId", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="sm:col-span-2">
          <span className={labelClass}>Scope summary</span>
          <textarea
            rows={3}
            value={draft.scopeSummary}
            onChange={(e) => set("scopeSummary", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="sm:col-span-2">
          <span className={labelClass}>Terms</span>
          <textarea
            rows={3}
            value={draft.terms}
            onChange={(e) => set("terms", e.target.value)}
            className={inputClass}
          />
        </label>
      </div>
      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? "Saving\u2026" : "Create quote"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryButton}>
          Cancel
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import {
  inputClass,
  labelClass,
  primaryButton,
  secondaryButton,
  type LineDraft,
} from "./shared";

export function LineItemForm({
  initial,
  busy,
  error,
  onSubmit,
  onCancel,
}: {
  initial: LineDraft;
  busy: boolean;
  error: string | null;
  onSubmit: (draft: LineDraft) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<LineDraft>(initial);

  const set = <K extends keyof LineDraft>(key: K, value: LineDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const setQuantity = (quantity: number) =>
    setDraft((prev) => ({
      ...prev,
      quantity,
      totalPrice: quantity * prev.unitPrice,
    }));
  const setUnitPrice = (unitPrice: number) =>
    setDraft((prev) => ({
      ...prev,
      unitPrice,
      totalPrice: prev.quantity * unitPrice,
    }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(draft);
      }}
      className="space-y-4 rounded-lg border border-border bg-muted/30 p-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className={labelClass}>Description</span>
          <input
            type="text"
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Quantity</span>
          <input
            type="number"
            step="any"
            value={draft.quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Unit</span>
          <input
            type="text"
            value={draft.unit}
            onChange={(e) => set("unit", e.target.value)}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Unit price</span>
          <input
            type="number"
            step="any"
            value={draft.unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Total price</span>
          <input
            type="number"
            step="any"
            value={draft.totalPrice}
            onChange={(e) => set("totalPrice", Number(e.target.value))}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Negotiation target price</span>
          <input
            type="number"
            step="any"
            value={draft.negotiationTargetPrice}
            onChange={(e) => set("negotiationTargetPrice", Number(e.target.value))}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Brand</span>
          <input
            type="text"
            value={draft.brand}
            onChange={(e) => set("brand", e.target.value)}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>BOQ line id</span>
          <input
            type="text"
            value={draft.boqLineId}
            onChange={(e) => set("boqLineId", e.target.value)}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Specification</span>
          <input
            type="text"
            value={draft.specification}
            onChange={(e) => set("specification", e.target.value)}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Inclusions</span>
          <input
            type="text"
            value={draft.inclusions}
            onChange={(e) => set("inclusions", e.target.value)}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Exclusions</span>
          <input
            type="text"
            value={draft.exclusions}
            onChange={(e) => set("exclusions", e.target.value)}
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
          {busy ? "Saving\u2026" : "Save line item"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryButton}>
          Cancel
        </button>
      </div>
    </form>
  );
}

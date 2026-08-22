"use client";

import { useState } from "react";
import { cn } from "@kr/api-client";
import type { Quote } from "@/lib/api-types";
import {
  inputClass,
  labelClass,
  primaryButton,
  secondaryButton,
} from "./shared";

type ActionKind = "approve" | "negotiate" | "reject";

export function WorkflowActions({
  quote,
  busy,
  error,
  onApprove,
  onNote,
}: {
  quote: Quote;
  busy: boolean;
  error: string | null;
  onApprove: (body: {
    approvedBy: string;
    approvedAmount: number | null;
    approvalNote: string;
  }) => void;
  onNote: (kind: "negotiate" | "reject", note: string) => void;
}) {
  const [kind, setKind] = useState<ActionKind | null>(null);
  const [approvedBy, setApprovedBy] = useState("");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [note, setNote] = useState("");

  const reset = () => {
    setKind(null);
    setApprovedBy("");
    setApprovedAmount("");
    setNote("");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(["approve", "negotiate", "reject"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(kind === k ? null : k)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm capitalize transition-colors",
              kind === k
                ? "bg-foreground text-background"
                : "border border-border text-foreground hover:bg-muted",
            )}
          >
            {k}
          </button>
        ))}
      </div>

      {kind && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (kind === "approve") {
              onApprove({
                approvedBy,
                approvedAmount:
                  approvedAmount.trim() === "" ? null : Number(approvedAmount),
                approvalNote: note,
              });
            } else {
              onNote(kind, note);
            }
            reset();
          }}
          className="space-y-3 rounded-lg border border-border bg-muted/30 p-4"
        >
          {kind === "approve" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className={labelClass}>Approved by</span>
                <input
                  type="text"
                  value={approvedBy}
                  onChange={(e) => setApprovedBy(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label>
                <span className={labelClass}>
                  Approved amount (blank = quote total)
                </span>
                <input
                  type="number"
                  step="any"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  placeholder={String(quote.totalAmount)}
                  className={inputClass}
                />
              </label>
            </div>
          )}
          <label>
            <span className={labelClass}>
              {kind === "approve" ? "Approval note" : "Note"}
            </span>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputClass}
            />
          </label>
          {error && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className={primaryButton}>
              {busy ? "Working\u2026" : `Confirm ${kind}`}
            </button>
            <button type="button" onClick={reset} className={secondaryButton}>
              Cancel
            </button>
          </div>
          {kind === "approve" && (
            <p className="text-xs text-muted-foreground">
              Approving also creates the purchase order and notifies the vendor.
            </p>
          )}
        </form>
      )}
    </div>
  );
}

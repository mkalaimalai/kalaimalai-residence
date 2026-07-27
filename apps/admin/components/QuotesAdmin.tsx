"use client";

/**
 * Quotes admin — a quote is a parent header plus line items, which the generic
 * `EntityForm` cannot express, so this is a purpose-built master/detail screen:
 * list quotes → select one → manage its line items → approve / negotiate / reject.
 *
 * Mounted as a tab by `app/portal/admin/page.tsx`; it owns no page chrome and takes
 * its project scope and vendor/BOQ reference rows as props (relations are stored by
 * id, only displayed by name).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { ApiError, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { StatusBadge } from "@/components/StatusBadge";
import { cn, formatINR } from "@/lib/utils";
import type { Quote, QuoteApproval, QuoteLineItem } from "@/lib/api-types";

export interface RefRow {
  id: string;
  name: string;
}

export interface QuotesAdminProps {
  /** Project every read is scoped to and every create is stamped with. */
  projectId: string;
  /** Vendor options for the select — ids are stored, names only displayed. */
  vendors: RefRow[];
  /** Optional BOQ options for the header's `boqId` and line items' `boqLineId`. */
  boqs?: RefRow[];
}

const CURRENCIES = ["INR", "EUR", "USD"] as const;
const COMPARISON_STATUSES = ["Pending", "Accepted", "Rejected", "Negotiated"] as const;

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground";
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";
const primaryButton =
  "rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50";
const secondaryButton =
  "rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted disabled:opacity-50";

const money = (amount: number, currency: string): string => {
  if (!amount) return "—";
  if (currency === "EUR") return `€${amount.toLocaleString("en-IN")}`;
  if (currency === "USD") return `$${amount.toLocaleString("en-IN")}`;
  return formatINR(amount);
};

const errorMessage = (err: unknown, fallback: string): string =>
  err instanceof ApiError ? err.message : err instanceof Error ? err.message : fallback;

// --- header form ------------------------------------------------------------------

/** The writable half of `QuoteCreate` (`projectId` is stamped on submit). */
interface HeaderDraft {
  vendorId: string;
  boqId: string;
  quoteNumber: string;
  quoteDate: string;
  validUntil: string;
  totalAmount: number;
  currency: string;
  taxAmount: number;
  scopeSummary: string;
  terms: string;
  documentId: string;
  comparisonStatus: string;
}

const emptyHeader = (): HeaderDraft => ({
  vendorId: "",
  boqId: "",
  quoteNumber: "",
  quoteDate: "",
  validUntil: "",
  totalAmount: 0,
  currency: "INR",
  taxAmount: 0,
  scopeSummary: "",
  terms: "",
  documentId: "",
  comparisonStatus: "Pending",
});

function QuoteHeaderForm({
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
          {busy ? "Saving…" : "Create quote"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryButton}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// --- line item form ---------------------------------------------------------------

/** The writable half of `QuoteLineItemCreate` (`projectId`/`quoteId` are stamped). */
interface LineDraft {
  boqLineId: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  brand: string;
  specification: string;
  inclusions: string;
  exclusions: string;
  negotiationTargetPrice: number;
}

const emptyLine = (): LineDraft => ({
  boqLineId: "",
  description: "",
  quantity: 0,
  unit: "",
  unitPrice: 0,
  totalPrice: 0,
  brand: "",
  specification: "",
  inclusions: "",
  exclusions: "",
  negotiationTargetPrice: 0,
});

const lineToDraft = (li: QuoteLineItem): LineDraft => ({
  boqLineId: li.boqLineId,
  description: li.description,
  quantity: li.quantity,
  unit: li.unit,
  unitPrice: li.unitPrice,
  totalPrice: li.totalPrice,
  brand: li.brand,
  specification: li.specification,
  inclusions: li.inclusions,
  exclusions: li.exclusions,
  negotiationTargetPrice: li.negotiationTargetPrice,
});

function LineItemForm({
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

  /** Keep the line total in step with qty × unit price unless it was typed over. */
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
          {busy ? "Saving…" : "Save line item"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryButton}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// --- workflow actions -------------------------------------------------------------

type ActionKind = "approve" | "negotiate" | "reject";

function WorkflowActions({
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
              {busy ? "Working…" : `Confirm ${kind}`}
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

// --- screen -----------------------------------------------------------------------

export function QuotesAdmin({ projectId, vendors, boqs = [] }: QuotesAdminProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [headerBusy, setHeaderBusy] = useState(false);
  const [headerError, setHeaderError] = useState<string | null>(null);

  const [lines, setLines] = useState<QuoteLineItem[]>([]);
  const [linesLoading, setLinesLoading] = useState(false);
  const [linesError, setLinesError] = useState<string | null>(null);
  const [editingLine, setEditingLine] = useState<QuoteLineItem | "new" | null>(null);
  const [lineBusy, setLineBusy] = useState(false);
  const [lineError, setLineError] = useState<string | null>(null);

  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<string | null>(null);

  const vendorNames = useMemo(
    () => Object.fromEntries(vendors.map((v) => [v.id, v.name])),
    [vendors],
  );

  const loadQuotes = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      setQuotes(
        await apiGet<Quote[]>(`/quotes?projectId=${encodeURIComponent(projectId)}`),
      );
    } catch (err) {
      setListError(errorMessage(err, "Failed to load quotes"));
    } finally {
      setListLoading(false);
    }
  }, [projectId]);

  const loadLines = useCallback(async (quoteId: string) => {
    setLinesLoading(true);
    setLinesError(null);
    try {
      setLines(
        await apiGet<QuoteLineItem[]>(
          `/quotes/${encodeURIComponent(quoteId)}/line-items`,
        ),
      );
    } catch (err) {
      setLinesError(errorMessage(err, "Failed to load line items"));
    } finally {
      setLinesLoading(false);
    }
  }, []);

  useEffect(() => {
    // Mount/scope-change fetch: state updates happen after the await inside loadQuotes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedId(null);
    void loadQuotes();
  }, [loadQuotes]);

  useEffect(() => {
    if (!selectedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLines([]);
      return;
    }
    setEditingLine(null);
    void loadLines(selectedId);
  }, [selectedId, loadLines]);

  const selected = quotes.find((q) => q.id === selectedId) ?? null;

  const createQuote = async (draft: HeaderDraft) => {
    setHeaderBusy(true);
    setHeaderError(null);
    try {
      const created = await apiPost<Quote>("/quotes", { projectId, ...draft });
      setCreating(false);
      await loadQuotes();
      setSelectedId(created.id);
    } catch (err) {
      setHeaderError(errorMessage(err, "Create failed. Check your inputs."));
    } finally {
      setHeaderBusy(false);
    }
  };

  const saveLine = async (draft: LineDraft) => {
    if (!selectedId) return;
    setLineBusy(true);
    setLineError(null);
    const body = { projectId, quoteId: selectedId, ...draft };
    try {
      if (editingLine && editingLine !== "new") {
        await apiPatch<QuoteLineItem>(`/quote-line-items/${editingLine.id}`, body);
      } else {
        await apiPost<QuoteLineItem>("/quote-line-items", body);
      }
      setEditingLine(null);
      await loadLines(selectedId);
    } catch (err) {
      setLineError(errorMessage(err, "Save failed. Check your inputs."));
    } finally {
      setLineBusy(false);
    }
  };

  const runAction = async (fn: () => Promise<string>) => {
    setActionBusy(true);
    setActionError(null);
    setActionResult(null);
    try {
      setActionResult(await fn());
      await loadQuotes();
    } catch (err) {
      setActionError(errorMessage(err, "Action failed"));
    } finally {
      setActionBusy(false);
    }
  };

  const approve = (body: {
    approvedBy: string;
    approvedAmount: number | null;
    approvalNote: string;
  }) => {
    if (!selectedId) return;
    void runAction(async () => {
      const res = await apiPost<QuoteApproval>(
        `/quotes/${encodeURIComponent(selectedId)}/approve`,
        body,
      );
      return `${res.message} Purchase order ${res.purchaseOrder.id}.`;
    });
  };

  const noteAction = (kind: "negotiate" | "reject", note: string) => {
    if (!selectedId) return;
    void runAction(async () => {
      const res = await apiPost<Quote>(
        `/quotes/${encodeURIComponent(selectedId)}/${kind}`,
        { note },
      );
      return `Quote marked ${res.comparisonStatus}.`;
    });
  };

  const linesTotal = lines.reduce((sum, li) => sum + li.totalPrice, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl text-foreground">Quotes</h2>
          <p className="text-xs text-muted-foreground">
            A quote is a header plus line items. Approving one creates its purchase
            order.
          </p>
        </div>
        {!creating && (
          <button
            onClick={() => {
              setHeaderError(null);
              setCreating(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            <Plus size={15} /> New quote
          </button>
        )}
      </div>

      {creating ? (
        <section className="rounded-xl border border-border p-5">
          <h3 className="mb-4 font-serif text-lg text-foreground">New quote</h3>
          <QuoteHeaderForm
            vendors={vendors}
            boqs={boqs}
            busy={headerBusy}
            error={headerError}
            onSubmit={createQuote}
            onCancel={() => setCreating(false)}
          />
        </section>
      ) : listError ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {listError}
        </p>
      ) : listLoading ? (
        <p className="px-1 py-6 text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Vendor</th>
                  <th className="px-4 py-2 font-medium">Quote no.</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 text-right font-medium">Total</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {quotes.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-sm text-muted-foreground"
                    >
                      No quotes for this project yet.
                    </td>
                  </tr>
                )}
                {quotes.map((q) => (
                  <tr
                    key={q.id}
                    className={cn(
                      "transition-colors",
                      q.id === selectedId ? "bg-muted" : "hover:bg-muted/50",
                    )}
                  >
                    <td className="px-4 py-3 text-foreground">
                      {vendorNames[q.vendorId] ?? q.vendorId}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {q.quoteNumber || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {q.quoteDate || "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {money(q.totalAmount, q.currency)}
                      <span className="ml-1 text-xs text-muted-foreground">
                        {q.currency}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={q.comparisonStatus} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setActionError(null);
                          setActionResult(null);
                          setSelectedId(q.id === selectedId ? null : q.id);
                        }}
                        className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted"
                      >
                        {q.id === selectedId ? "Close" : "Open"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <section className="space-y-5 rounded-xl border border-border p-5">
              <header className="space-y-1">
                <h3 className="font-serif text-lg text-foreground">
                  {vendorNames[selected.vendorId] ?? selected.vendorId}
                  {selected.quoteNumber ? ` · ${selected.quoteNumber}` : ""}
                </h3>
                <p className="text-xs text-muted-foreground">{selected.id}</p>
              </header>

              <dl className="grid gap-3 text-sm sm:grid-cols-3">
                <Detail label="Total">
                  {money(selected.totalAmount, selected.currency)}
                </Detail>
                <Detail label="Tax">
                  {money(selected.taxAmount, selected.currency)}
                </Detail>
                <Detail label="Valid until">{selected.validUntil || "—"}</Detail>
                <Detail label="BOQ">
                  {selected.boqId
                    ? (boqs.find((b) => b.id === selected.boqId)?.name ??
                      selected.boqId)
                    : "—"}
                </Detail>
                <Detail label="Approved amount">
                  {money(selected.approvedAmount, selected.currency)}
                </Detail>
                <Detail label="Approved by">{selected.approvedBy || "—"}</Detail>
                {selected.scopeSummary && (
                  <Detail label="Scope" className="sm:col-span-3">
                    {selected.scopeSummary}
                  </Detail>
                )}
                {selected.terms && (
                  <Detail label="Terms" className="sm:col-span-3">
                    {selected.terms}
                  </Detail>
                )}
                {selected.approvalNote && (
                  <Detail label="Note" className="sm:col-span-3">
                    {selected.approvalNote}
                  </Detail>
                )}
              </dl>

              <div className="space-y-3 border-t border-border pt-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">
                    Line items
                    {lines.length > 0 && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {lines.length} · {money(linesTotal, selected.currency)}
                      </span>
                    )}
                  </h4>
                  {!editingLine && (
                    <button
                      onClick={() => {
                        setLineError(null);
                        setEditingLine("new");
                      }}
                      className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted"
                    >
                      <Plus size={14} /> Add line
                    </button>
                  )}
                </div>

                {linesError ? (
                  <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {linesError}
                  </p>
                ) : linesLoading ? (
                  <p className="py-4 text-sm text-muted-foreground">Loading…</p>
                ) : (
                  <div className="divide-y divide-border rounded-lg border border-border">
                    {lines.length === 0 && (
                      <p className="px-4 py-5 text-sm text-muted-foreground">
                        No line items yet.
                      </p>
                    )}
                    {lines.map((li) => (
                      <div
                        key={li.id}
                        className="flex items-start justify-between gap-3 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm text-foreground">
                            {li.description || li.id}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {li.quantity} {li.unit || "nos"} ×{" "}
                            {money(li.unitPrice, selected.currency)}
                            {li.brand ? ` · ${li.brand}` : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-sm text-foreground">
                            {money(li.totalPrice, selected.currency)}
                          </span>
                          <button
                            onClick={() => {
                              setLineError(null);
                              setEditingLine(li);
                            }}
                            className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {editingLine && (
                  <LineItemForm
                    key={editingLine === "new" ? "new" : editingLine.id}
                    initial={
                      editingLine === "new" ? emptyLine() : lineToDraft(editingLine)
                    }
                    busy={lineBusy}
                    error={lineError}
                    onSubmit={saveLine}
                    onCancel={() => setEditingLine(null)}
                  />
                )}
              </div>

              <div className="space-y-3 border-t border-border pt-5">
                <h4 className="text-sm font-medium text-foreground">Workflow</h4>
                <WorkflowActions
                  key={selected.id}
                  quote={selected}
                  busy={actionBusy}
                  error={actionError}
                  onApprove={approve}
                  onNote={noteAction}
                />
                {actionResult && (
                  <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
                    {actionResult}
                  </p>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function Detail({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className={labelClass}>{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

export default QuotesAdmin;

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@kr/api-client";
import type { Quote, QuoteApproval, QuoteLineItem } from "@/lib/api-types";
import { QuoteHeaderForm } from "./QuoteHeaderForm";
import { LineItemForm } from "./LineItemForm";
import { WorkflowActions } from "./WorkflowActions";
import { Detail } from "./Detail";
import {
  emptyLine,
  errorMessage,
  lineToDraft,
  money,
  type HeaderDraft,
  type LineDraft,
  type RefRow,
} from "./shared";

export { type RefRow } from "./shared";

export interface QuotesAdminProps {
  projectId: string;
  vendors: RefRow[];
  boqs?: RefRow[];
}

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
    // Wrapped rather than called straight, so the loader's own `setLoading(true)` is
    // not a synchronous setState in the effect body — the same shape EntityAdmin uses.
    void (async () => {
      await loadQuotes();
    })();
  }, [loadQuotes]);

  useEffect(() => {
    // Only fetching here. Clearing the previous quote's lines and any open line form
    // used to happen in this effect too, which meant every selection change rendered
    // once to apply those resets and again for the fetch. Both are now derived or
    // handled where the selection actually changes.
    if (!selectedId) return;
    void (async () => {
      await loadLines(selectedId);
    })();
  }, [selectedId, loadLines]);

  const selected = quotes.find((q) => q.id === selectedId) ?? null;
  // `lines` holds whatever was last fetched; with nothing selected there is nothing to
  // show. Deriving beats clearing it in an effect, which cost a second render.
  const visibleLines = selectedId ? lines : [];

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

  const linesTotal = visibleLines.reduce((sum, li) => sum + li.totalPrice, 0);

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
        <p className="px-1 py-6 text-sm text-muted-foreground">Loading\u2026</p>
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
                      {q.quoteNumber || "\u2014"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {q.quoteDate || "\u2014"}
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
                          setEditingLine(null);
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
                  {selected.quoteNumber ? ` \u00B7 ${selected.quoteNumber}` : ""}
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
                <Detail label="Valid until">{selected.validUntil || "\u2014"}</Detail>
                <Detail label="BOQ">
                  {selected.boqId
                    ? (boqs.find((b) => b.id === selected.boqId)?.name ??
                      selected.boqId)
                    : "\u2014"}
                </Detail>
                <Detail label="Approved amount">
                  {money(selected.approvedAmount, selected.currency)}
                </Detail>
                <Detail label="Approved by">{selected.approvedBy || "\u2014"}</Detail>
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
                    {visibleLines.length > 0 && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {visibleLines.length} \u00B7 {money(linesTotal, selected.currency)}
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
                  <p className="py-4 text-sm text-muted-foreground">Loading\u2026</p>
                ) : (
                  <div className="divide-y divide-border rounded-lg border border-border">
                    {visibleLines.length === 0 && (
                      <p className="px-4 py-5 text-sm text-muted-foreground">
                        No line items yet.
                      </p>
                    )}
                    {visibleLines.map((li) => (
                      <div
                        key={li.id}
                        className="flex items-start justify-between gap-3 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm text-foreground">
                            {li.description || li.id}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {li.quantity} {li.unit || "nos"} \u00D7{" "}
                            {money(li.unitPrice, selected.currency)}
                            {li.brand ? ` \u00B7 ${li.brand}` : ""}
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

export default QuotesAdmin;

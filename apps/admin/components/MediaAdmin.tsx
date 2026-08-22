"use client";

/**
 * Admin screen for rendering / drawing-sheet media sets (`/media-sets`).
 *
 * A set is a titled group of image paths owned by the project, or by one of its domains
 * or spaces. Images are referenced by path (`public/images/**`) or absolute URL — the
 * site is a static export, so there is no upload.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { apiGet, apiPatch, apiPost, ApiError } from "@/lib/api-client";
import { cn, getSupabase } from "@kr/api-client";
import type { MediaKind, MediaSet, MediaSubsection } from "@/lib/api-types";

type NamedRow = { id: string; name: string };

type OwnerScope = "project" | "domain" | "space";

const KINDS: { value: MediaKind; label: string }[] = [
  { value: "rendering", label: "Renderings" },
  { value: "drawing_sheet", label: "Drawing sheets" },
];

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground";

const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";

/** Draft state for the create/edit form — plain strings so inputs stay controlled. */
type Draft = {
  title: string;
  width: number;
  height: number;
  sortOrder: number;
  images: string[];
  ownerScope: OwnerScope;
  domainId: string;
  spaceId: string;
  subsections: MediaSubsection[];
};

const parseLines = (value: string): string[] =>
  value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

function emptyDraft(): Draft {
  return {
    title: "",
    width: 1600,
    height: 900,
    sortOrder: 0,
    images: [],
    ownerScope: "project",
    domainId: "",
    spaceId: "",
    subsections: [],
  };
}

function draftFrom(set: MediaSet): Draft {
  return {
    title: set.title,
    width: set.width,
    height: set.height,
    sortOrder: set.sortOrder,
    images: set.images ?? [],
    ownerScope: set.spaceId ? "space" : set.domainId ? "domain" : "project",
    domainId: set.domainId ?? "",
    spaceId: set.spaceId ?? "",
    subsections: set.subsections ?? [],
  };
}

/** Draft → wire payload. Owner scope collapses to a single id (or neither). */
function toPayload(draft: Draft, kind: MediaKind) {
  return {
    kind,
    title: draft.title.trim(),
    width: draft.width,
    height: draft.height,
    sortOrder: draft.sortOrder,
    images: draft.images,
    subsections: draft.subsections.length > 0 ? draft.subsections : null,
    domainId: draft.ownerScope === "domain" ? draft.domainId || null : null,
    spaceId: draft.ownerScope === "space" ? draft.spaceId || null : null,
  };
}

/**
 * `lib/api-client.ts` (owned by another stream) exposes no DELETE helper, and media is
 * the one collection that needs one. Same auth/error contract as `request` there.
 */
async function apiDelete(path: string): Promise<void> {
  const supabase = getSupabase();
  const headers: Record<string, string> = {};
  if (supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) headers.Authorization = `Bearer ${session.access_token}`;
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}${path}`,
    { method: "DELETE", headers },
  );
  if (!res.ok) throw new ApiError(res.status, `DELETE ${path} → ${res.status}`);
}

export function MediaAdmin({
  projectId,
  domains,
  spaces,
}: {
  projectId: string;
  domains: NamedRow[];
  spaces: NamedRow[];
}) {
  const [kind, setKind] = useState<MediaKind>("rendering");
  const [sets, setSets] = useState<MediaSet[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [editing, setEditing] = useState<MediaSet | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const domainNames = useMemo(
    () => Object.fromEntries(domains.map((d) => [d.id, d.name])),
    [domains],
  );
  const spaceNames = useMemo(
    () => Object.fromEntries(spaces.map((s) => [s.id, s.name])),
    [spaces],
  );

  const load = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const query = new URLSearchParams({ projectId, kind });
      setSets(await apiGet<MediaSet[]>(`/media-sets?${query}`));
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setListLoading(false);
    }
  }, [projectId, kind]);

  useEffect(() => {
    // Mount/refetch: state updates land after the await inside load().
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const startNew = () => {
    setFormError(null);
    setDraft(emptyDraft());
    setEditing("new");
  };

  const startEdit = (set: MediaSet) => {
    setFormError(null);
    setDraft(draftFrom(set));
    setEditing(set);
  };

  const save = async () => {
    if (!draft.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (draft.ownerScope === "domain" && !draft.domainId) {
      setFormError("Pick a domain, or set the owner to project-level.");
      return;
    }
    if (draft.ownerScope === "space" && !draft.spaceId) {
      setFormError("Pick a space, or set the owner to project-level.");
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      const payload = toPayload(draft, kind);
      if (editing && editing !== "new") {
        await apiPatch(`/media-sets/${editing.id}`, payload);
      } else {
        await apiPost("/media-sets", { projectId, ...payload });
      }
      setEditing(null);
      await load();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Save failed. Check your inputs.",
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = async (set: MediaSet) => {
    setDeletingId(set.id);
    setListError(null);
    try {
      await apiDelete(`/media-sets/${set.id}`);
      await load();
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const ownerLabel = (set: MediaSet) => {
    if (set.spaceId) return `Space · ${spaceNames[set.spaceId] ?? set.spaceId}`;
    if (set.domainId) return `Domain · ${domainNames[set.domainId] ?? set.domainId}`;
    return "Project-level";
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="font-serif text-2xl text-foreground">Media</h2>
        <p className="text-sm text-muted-foreground">
          Attach renderings and drawing sheets to the project, a domain or a space.
          Images are referenced by path under <code>public/images/</code> or by absolute
          URL — there is no upload.
        </p>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {KINDS.map((k) => (
          <button
            key={k.value}
            onClick={() => {
              setKind(k.value);
              setEditing(null);
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              k.value === kind
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {k.label}
          </button>
        ))}
      </div>

      {editing ? (
        <section className="rounded-xl border border-border p-5">
          <h3 className="mb-4 font-serif text-xl text-foreground">
            {editing === "new" ? "New media set" : "Edit media set"}
          </h3>
          <MediaSetForm
            draft={draft}
            setDraft={setDraft}
            domains={domains}
            spaces={spaces}
            busy={busy}
            error={formError}
            isNew={editing === "new"}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        </section>
      ) : (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl text-foreground">
              {KINDS.find((k) => k.value === kind)?.label}
            </h3>
            <button
              onClick={startNew}
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
          ) : sets.length === 0 ? (
            <p className="rounded-xl border border-border px-4 py-6 text-sm text-muted-foreground">
              No media sets yet for this kind.
            </p>
          ) : (
            <div className="divide-y divide-border rounded-xl border border-border">
              {sets.map((set) => (
                <div key={set.id} className="space-y-3 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {set.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {ownerLabel(set)} · #{set.sortOrder} · {set.width}×
                        {set.height} · {countImages(set)} image
                        {countImages(set) === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => startEdit(set)}
                        className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => void remove(set)}
                        disabled={deletingId === set.id}
                        aria-label={`Delete ${set.title}`}
                        className="rounded-md border border-destructive/40 px-2.5 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <ThumbnailStrip images={allImages(set)} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

const allImages = (set: MediaSet): string[] => [
  ...(set.images ?? []),
  ...(set.subsections ?? []).flatMap((s) => s.images),
];

const countImages = (set: MediaSet): number => allImages(set).length;

// `||`, not `??`: an unset CI variable inlines as the empty string rather than
// undefined, and "" + "/images/..." resolves against *this* origin, where the web
// app's public files do not exist.
const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

type Preview = "local" | "remote" | "link";

const previewKind = (url: string): Preview => {
  if (url.startsWith("/")) return "local";
  if (url.includes("drive.google.com/file/")) return "link";
  return "remote";
};

const driveFileId = (url: string): string | null => {
  return (
    url.match(/\/file\/d\/([^/]+)/)?.[1] ??
    url.match(/[?&]id=([^&]+)/)?.[1] ??
    null
  );
};

const driveThumb = (id: string) =>
  `https://drive.google.com/thumbnail?id=${id}&sz=w200`;

function ThumbnailStrip({ images }: { images: string[] }) {
  if (images.length === 0) {
    return <p className="text-xs text-muted-foreground">No images.</p>;
  }
  const shown = images.slice(0, 8);
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {shown.map((src) => (
        <Thumb key={src} src={src} />
      ))}
      {images.length > shown.length && (
        <span className="shrink-0 text-xs text-muted-foreground">
          +{images.length - shown.length} more
        </span>
      )}
    </div>
  );
}

function Thumb({ src }: { src: string }) {
  const kindOf = previewKind(src);
  const driveId = kindOf === "link" ? driveFileId(src) : null;
  const [thumbFailed, setThumbFailed] = useState(false);

  if (kindOf === "local") {
    const resolved = `${WEB_URL}${src}`;
    return (
      <span
        title={src}
        className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted"
      >
        <img src={resolved} alt="" className="h-full w-full object-cover" />
      </span>
    );
  }

  if (kindOf === "link" && driveId && !thumbFailed) {
    return (
      <span
        title={src}
        className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted"
      >
        <img
          src={driveThumb(driveId)}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setThumbFailed(true)}
        />
      </span>
    );
  }

  return (
    <a
      href={src}
      target="_blank"
      rel="noreferrer"
      title={src}
      className="flex h-14 w-20 shrink-0 items-center justify-center rounded-md border border-border p-1 text-center text-[10px] leading-tight text-muted-foreground hover:bg-muted"
    >
      Open
    </a>
  );
}

function MediaSetForm({
  draft,
  setDraft,
  domains,
  spaces,
  busy,
  error,
  isNew,
  onSubmit,
  onCancel,
}: {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  domains: NamedRow[];
  spaces: NamedRow[];
  busy: boolean;
  error: string | null;
  isNew: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const setSubsection = (index: number, next: MediaSubsection) =>
    setDraft((prev) => ({
      ...prev,
      subsections: prev.subsections.map((s, i) => (i === index ? next : s)),
    }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className={labelClass}>Title</span>
          <input
            type="text"
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Owner</span>
          <select
            value={draft.ownerScope}
            onChange={(e) => set("ownerScope", e.target.value as OwnerScope)}
            className={inputClass}
          >
            <option value="project">Project-level</option>
            <option value="domain">Domain</option>
            <option value="space">Space</option>
          </select>
        </label>

        {draft.ownerScope === "domain" && (
          <label>
            <span className={labelClass}>Domain</span>
            <select
              value={draft.domainId}
              onChange={(e) => set("domainId", e.target.value)}
              className={inputClass}
            >
              <option value="">— none —</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {draft.ownerScope === "space" && (
          <label>
            <span className={labelClass}>Space</span>
            <select
              value={draft.spaceId}
              onChange={(e) => set("spaceId", e.target.value)}
              className={inputClass}
            >
              <option value="">— none —</option>
              {spaces.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          <span className={labelClass}>Width</span>
          <input
            type="number"
            step="1"
            value={draft.width}
            onChange={(e) => set("width", Number(e.target.value))}
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Height</span>
          <input
            type="number"
            step="1"
            value={draft.height}
            onChange={(e) => set("height", Number(e.target.value))}
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Sort order</span>
          <input
            type="number"
            step="1"
            value={draft.sortOrder}
            onChange={(e) => set("sortOrder", Number(e.target.value))}
            className={inputClass}
          />
        </label>

        <label className="sm:col-span-2">
          <span className={labelClass}>Images (one path per line)</span>
          <textarea
            rows={5}
            value={draft.images.join("\n")}
            onChange={(e) => set("images", parseLines(e.target.value))}
            className={inputClass}
            placeholder="/images/renderings/interior-design/common-02.jpg"
          />
        </label>
      </div>

      <ThumbnailStrip
        images={[
          ...draft.images,
          ...draft.subsections.flatMap((s) => s.images),
        ]}
      />

      <div className="space-y-3 rounded-xl border border-border p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">Subsections</h4>
          <button
            type="button"
            onClick={() =>
              set("subsections", [...draft.subsections, { title: "", images: [] }])
            }
            className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-foreground hover:bg-muted"
          >
            <Plus size={13} /> Add subsection
          </button>
        </div>

        {draft.subsections.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            None — the set uses its own image list.
          </p>
        ) : (
          draft.subsections.map((sub, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-border p-3">
              <div className="flex items-start gap-2">
                <label className="flex-1">
                  <span className={labelClass}>Subsection title</span>
                  <input
                    type="text"
                    value={sub.title}
                    onChange={(e) =>
                      setSubsection(i, { ...sub, title: e.target.value })
                    }
                    className={inputClass}
                  />
                </label>
                <button
                  type="button"
                  aria-label="Remove subsection"
                  onClick={() =>
                    set(
                      "subsections",
                      draft.subsections.filter((_, j) => j !== i),
                    )
                  }
                  className="mt-5 rounded-md border border-border px-2 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X size={14} />
                </button>
              </div>
              <label className="block">
                <span className={labelClass}>Images (one path per line)</span>
                <textarea
                  rows={4}
                  value={sub.images.join("\n")}
                  onChange={(e) =>
                    setSubsection(i, { ...sub, images: parseLines(e.target.value) })
                  }
                  className={inputClass}
                  placeholder="One per line"
                />
              </label>
            </div>
          ))
        )}
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
          {busy ? "Saving…" : isNew ? "Create" : "Save changes"}
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

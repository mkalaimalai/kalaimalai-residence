"use client";

/**
 * Multi-file upload for one space.
 *
 * Files go to Google Drive through the API (`POST /media-sets/{id}/files`), and their
 * metadata is stored against the space as a **space-scoped media set** — `media_sets`
 * rows carrying `spaceId`. That is the modelled home for a space's imagery: `Space` in
 * `types/index.ts` has a single `image` field and the type contract is locked
 * (constitution rule 4), so a list of files belongs in the media context, not on the
 * space row.
 *
 * One set per (space, kind): uploading again appends to the existing set rather than
 * creating a second one, so a space's renderings stay one gallery.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Trash2, Upload, X } from "lucide-react";
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiUpload,
  ApiError,
} from "@/lib/api-client";
import type { MediaKind, MediaSet } from "@/lib/api-types";
import { cn } from "@/lib/utils";

const KINDS: { value: MediaKind; label: string }[] = [
  { value: "rendering", label: "Renderings" },
  { value: "drawing_sheet", label: "Drawing sheets" },
];

/**
 * How to preview a stored URL.
 *
 * - `local`  — a repo path under `public/`; `next/image` handles it.
 * - `remote` — an absolute URL. Rendered with a plain `<img>`, NOT `next/image`:
 *   `next.config.ts` sets no `remotePatterns`, so an external host would be rejected
 *   at runtime. Images are `unoptimized` anyway, so `next/image` buys nothing here.
 * - `link`   — a Drive *viewer* page (`/file/<id>/view`), which is HTML, not an image.
 *   These appear whenever GOOGLE_DRIVE_PUBLIC is off.
 */
type Preview = "local" | "remote" | "link";

const previewKind = (url: string): Preview => {
  if (url.startsWith("/")) return "local";
  if (url.includes("drive.google.com/file/")) return "link";
  return "remote";
};

const THUMB = "h-16 w-16 rounded-md border border-border object-cover";

/** The Drive file id out of either the viewer link or a `uc?id=` content link. */
function driveFileId(url: string): string | null {
  return (
    url.match(/\/file\/d\/([^/]+)/)?.[1] ??
    url.match(/[?&]id=([^&]+)/)?.[1] ??
    null
  );
}

/**
 * Drive's thumbnail endpoint. Renders only for files that are link-readable, i.e. when
 * the server was configured with `GOOGLE_DRIVE_PUBLIC=true`. For private files it 403s,
 * which is why every Drive thumbnail below falls back to a link tile `onError` instead
 * of showing a broken image.
 */
const driveThumb = (id: string) =>
  `https://drive.google.com/thumbnail?id=${id}&sz=w200`;

/** Last path segment, de-percent-encoded — the best filename a bare URL can give. */
function fileNameFromUrl(url: string): string {
  const last = url.split("?")[0].split("/").filter(Boolean).pop() ?? url;
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

export function SpaceFilesPanel({
  projectId,
  spaceId,
  spaceName,
}: {
  projectId: string;
  spaceId: string;
  spaceName: string;
}) {
  const [kind, setKind] = useState<MediaKind>("rendering");
  const [sets, setSets] = useState<MediaSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // How many files the in-flight upload is carrying, purely so the spinner can say so.
  const [uploadCount, setUploadCount] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setSets(
        await apiGet<MediaSet[]>(
          `/media-sets?projectId=${encodeURIComponent(projectId)}` +
            `&spaceId=${encodeURIComponent(spaceId)}`,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load files");
    } finally {
      setLoading(false);
    }
  }, [projectId, spaceId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  // The active tab drives both halves of the panel: what an upload attaches to, and
  // which sets are listed. Renderings and drawing sheets never appear together.
  const current = sets.find((s) => s.kind === kind) ?? null;
  const visible = sets.filter((s) => s.kind === kind);
  const countFor = (k: MediaKind) =>
    sets
      .filter((s) => s.kind === k)
      .reduce((n, s) => n + s.images.length, 0);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Reject a selection that names the same file twice before spending a round trip.
    // Cross-request duplicates are handled server-side, where the destination folder is
    // visible — see `_unique_name` in api/app/shared/drive.py.
    const names = Array.from(files, (f) => f.name);
    const repeated = names.filter((n, i) => names.indexOf(n) !== i);
    if (repeated.length > 0) {
      setNote(null);
      setError(
        `Duplicate file name${repeated.length === 1 ? "" : "s"} in this selection: ` +
          `${[...new Set(repeated)].join(", ")}. Rename or drop the copies.`,
      );
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setBusy(true);
    setUploadCount(files.length);
    setError(null);
    setNote(null);
    try {
      // Resolve the destination set first — created once per (space, kind) so repeat
      // uploads append instead of fragmenting the space's gallery.
      const target =
        current ??
        (await apiPost<MediaSet>("/media-sets", {
          projectId,
          spaceId,
          kind,
          title: `${spaceName} — ${kind === "rendering" ? "Renderings" : "Drawing sheets"}`,
        }));

      const updated = await apiUpload<MediaSet>(
        `/media-sets/${target.id}/files`,
        Array.from(files),
      );
      setSets((prev) => {
        const rest = prev.filter((s) => s.id !== updated.id);
        return [...rest, updated];
      });
      setNote(
        `Uploaded ${files.length} file${files.length === 1 ? "" : "s"} to Drive.`,
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Upload failed. Please try again.",
      );
    } finally {
      setBusy(false);
      // Clear the picker so re-selecting the same file still fires onChange.
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeSet = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      await apiDelete(`/media-sets/${id}`);
      setSets((prev) => prev.filter((s) => s.id !== id));
      setNote("Removed. The files themselves remain in Drive.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove");
    } finally {
      setBusy(false);
    }
  };

  /**
   * Drop one image from a set.
   *
   * `images` is a plain ordered list of URLs, so removing one is a PATCH of the whole
   * array minus that entry — there is no per-image endpoint and none is needed. The
   * Drive file is intentionally left alone: the same URL may be referenced elsewhere,
   * and an admin removing a thumbnail from a gallery is not asking to destroy the
   * original.
   */
  const removeImage = async (set: MediaSet, url: string) => {
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      const updated = await apiPatch<MediaSet>(`/media-sets/${set.id}`, {
        images: set.images.filter((u) => u !== url),
      });
      setSets((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setNote("Removed from this set. The file itself remains in Drive.");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not remove that file",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-6 space-y-4 rounded-xl border border-border p-5">
      <div className="space-y-1">
        <h3 className="font-serif text-lg text-foreground">Files</h3>
        <p className="text-xs text-muted-foreground">
          Images and PDFs upload to Google Drive; the links are stored against this
          space. Up to 25 MB per file.
        </p>
      </div>

      <div role="tablist" aria-label="File type" className="flex border-b border-border">
        {KINDS.map((k) => {
          const active = k.value === kind;
          const count = countFor(k.value);
          return (
            <button
              key={k.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setKind(k.value);
                setNote(null);
                setError(null);
              }}
              className={cn(
                "-mb-px border-b-2 px-4 py-2 text-sm transition-colors",
                active
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {k.label}
              {count > 0 && (
                <span className="ml-1.5 text-xs text-muted-foreground">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <label
        className={cn(
          "flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-6 text-sm transition-colors hover:border-foreground",
          busy && "pointer-events-none opacity-60",
        )}
      >
        {busy ? (
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
        ) : (
          <Upload size={16} className="text-muted-foreground" />
        )}
        <span className="text-foreground">
          {busy
            ? `Uploading ${uploadCount} file${uploadCount === 1 ? "" : "s"} to Drive…`
            : "Choose files — several at once"}
        </span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          disabled={busy}
          onChange={(e) => void upload(e.target.files)}
          className="sr-only"
        />
      </label>

      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {note && !error && (
        <p className="text-sm text-muted-foreground">{note}</p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading files…</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No {kind === "rendering" ? "renderings" : "drawing sheets"} for this space
          yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((s) => (
            <li key={s.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{s.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {KINDS.find((k) => k.value === s.kind)?.label} ·{" "}
                    {s.images.length} file{s.images.length === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void removeSet(s.id)}
                  disabled={busy}
                  aria-label={`Remove ${s.title}`}
                  className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {s.images.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {s.images.map((src) => (
                    <FileTile
                      key={src}
                      src={src}
                      busy={busy}
                      onRemove={() => void removeImage(s, src)}
                    />
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * One uploaded file: thumbnail where the URL can produce one, filename underneath, and
 * a hover/focus delete affordance.
 *
 * Drive thumbnails are attempted optimistically and fall back to a link tile on error,
 * because whether they load depends on server config (`GOOGLE_DRIVE_PUBLIC`) that this
 * component cannot see. Attempting and falling back beats guessing wrong in either
 * direction — a broken image, or a link tile for a file that would have previewed fine.
 */
function FileTile({
  src,
  busy,
  onRemove,
}: {
  src: string;
  busy: boolean;
  onRemove: () => void;
}) {
  const kindOf = previewKind(src);
  const driveId = kindOf === "link" ? driveFileId(src) : null;
  const [thumbFailed, setThumbFailed] = useState(false);
  const name = fileNameFromUrl(src);
  const showThumb = kindOf !== "link" || (driveId !== null && !thumbFailed);

  return (
    <li className="group relative">
      {kindOf === "local" ? (
        <Image src={src} alt={name} width={72} height={72} className={THUMB} />
      ) : showThumb ? (
        /* External host, and `next.config.ts` sets no `remotePatterns`, so `next/image`
           would reject it at runtime. Images are `unoptimized` anyway. */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={driveId ? driveThumb(driveId) : src}
          alt={name}
          className={THUMB}
          onError={() => setThumbFailed(true)}
        />
      ) : (
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          title={name}
          className="flex h-16 w-16 items-center justify-center rounded-md border border-border p-1 text-center text-[10px] leading-tight text-muted-foreground hover:bg-muted"
        >
          Open in Drive
        </a>
      )}

      <p className="mt-1 w-16 truncate text-[10px] text-muted-foreground" title={name}>
        {name}
      </p>

      <button
        type="button"
        onClick={onRemove}
        disabled={busy}
        aria-label={`Remove ${name}`}
        title="Remove from this set"
        className="absolute -right-1.5 -top-1.5 rounded-full border border-border bg-background p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-50"
      >
        <X size={11} />
      </button>
    </li>
  );
}

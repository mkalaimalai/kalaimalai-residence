"use client";

import { useRef, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { apiUpload, ApiError } from "@/lib/api-client";

const PREVIEW_CLASS =
  "aspect-[16/9] w-full max-w-lg rounded-lg border border-border bg-muted object-cover";

export function ProjectImageUpload({
  currentUrl,
  onUpload,
}: {
  currentUrl: string;
  onUpload?: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(currentUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const result = await apiUpload<{ url: string; name: string; fileId: string; mimeType: string; size: number }[]>("/uploads", [files[0]]);
      const url = result[0].url;
      setPreview(url);
      onUpload?.(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreview("");
    onUpload?.("");
  };

  return (
    <div className="space-y-3">
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        Hero image
      </label>

      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Hero" className={PREVIEW_CLASS} />
          <div className="mt-2 flex gap-2">
            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted">
              <Upload size={14} /> Replace
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                disabled={busy}
                onChange={(e) => void handleUpload(e.target.files)}
                className="sr-only"
              />
            </label>
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-destructive disabled:opacity-50"
            >
              <Trash2 size={14} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          <span>{busy ? "Uploading…" : "Choose an image"}</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={(e) => void handleUpload(e.target.files)}
            className="sr-only"
          />
        </label>
      )}

      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

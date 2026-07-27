"use client";

/**
 * Portal project scope. The portal is the control center for whichever project the admin
 * has selected — previously a pinned constant, so a newly created project could never be
 * administered.
 *
 * The selection lives in two places on purpose: React state (so components re-render and
 * refetch) and a module-level value in `lib/api-client.ts` (so the non-React helpers
 * `scopedPath`/`withProject` can read it). `setActiveProjectId` keeps both in step and
 * persists to localStorage; the api-client seeds itself from localStorage at module load,
 * so the very first render is already correctly scoped.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  api,
  getActiveProjectId,
  setActiveProjectId,
} from "@/lib/api-client";
import type { Project } from "@kr/contracts";

interface Ctx {
  projects: Project[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  loading: boolean;
  error: string | null;
}

const PortalProjectContext = createContext<Ctx>({
  projects: [],
  selectedId: getActiveProjectId(),
  setSelectedId: () => {},
  loading: true,
  error: null,
});

export function useProject(): Ctx {
  return useContext(PortalProjectContext);
}

export function ProjectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  // Seeded from the api-client, which restored it from localStorage (or the
  // NEXT_PUBLIC_PROJECT_ID default) synchronously at module load.
  const [selectedId, setSelected] = useState<string>(getActiveProjectId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setSelectedId = useCallback((id: string) => {
    setActiveProjectId(id);
    setSelected(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Mount-time fetch: every setState happens after the await.
    void (async () => {
      try {
        const rows = await api.projects();
        if (cancelled) return;
        setProjects(rows);
        // The persisted/default id may no longer exist (project deleted, or a different
        // deployment) — fall back to the first project rather than querying a dead scope.
        if (rows.length > 0 && !rows.some((p) => p.id === getActiveProjectId())) {
          setActiveProjectId(rows[0].id);
          setSelected(rows[0].id);
        }
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load projects");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PortalProjectContext.Provider
      value={{ projects, selectedId, setSelectedId, loading, error }}
    >
      {children}
    </PortalProjectContext.Provider>
  );
}

/**
 * Scope picker for the portal header. Shows `internalName` — this is the private side, and
 * the internal name is what the admin actually calls the project (the anonymized
 * `publicTitle` is deliberately generic and reads the same across projects).
 */
export function ProjectPicker({ className }: { className?: string }) {
  const { projects, selectedId, setSelectedId, loading, error } =
    useProject();

  if (error) {
    return (
      <p className={className} role="status">
        <span className="text-xs text-muted-foreground">Projects unavailable</span>
      </p>
    );
  }

  return (
    <label className={className}>
      <span className="sr-only">Project</span>
      <select
        value={selectedId}
        disabled={loading || projects.length === 0}
        onChange={(e) => setSelectedId(e.target.value)}
        className="w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-foreground disabled:opacity-60"
      >
        {loading && projects.length === 0 ? (
          <option value={selectedId}>Loading…</option>
        ) : (
          projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.internalName || p.publicTitle}
            </option>
          ))
        )}
      </select>
    </label>
  );
}

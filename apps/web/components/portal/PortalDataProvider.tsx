"use client";

/**
 * Loads every portal collection once (client-side, with the Supabase token) and exposes
 * it via context. Portal pages read what they need and render the unchanged `*Table`
 * components. Because this runs in the browser, the static build ships an empty shell —
 * no portal data is baked into `out/`.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/lib/api-client";
import { usePortalProject } from "./PortalProjectProvider";
import type {
  BOQ,
  Decision,
  Domain,
  Drawing,
  Material,
  ProcurementItem,
  ProgressEntry,
  Snag,
  Space,
  Vendor,
  Warranty,
} from "@/types";

export interface PortalData {
  spaces: Space[];
  domains: Domain[];
  vendors: Vendor[];
  materials: Material[];
  drawings: Drawing[];
  decisions: Decision[];
  procurement: ProcurementItem[];
  boqs: BOQ[];
  snags: Snag[];
  progress: ProgressEntry[];
  warranties: Warranty[];
}

const EMPTY: PortalData = {
  spaces: [], domains: [], vendors: [], materials: [], drawings: [],
  decisions: [], procurement: [], boqs: [], snags: [], progress: [], warranties: [],
};

interface Ctx {
  data: PortalData;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const PortalDataContext = createContext<Ctx>({
  data: EMPTY,
  loading: true,
  error: null,
  reload: async () => {},
});

export function usePortalData(): Ctx {
  return useContext(PortalDataContext);
}

export function PortalDataProvider({ children }: { children: React.ReactNode }) {
  // Which project's data to load. Every api.* getter scopes itself to the active project
  // via the api-client, so this id is not passed down — it is the *trigger*: when the
  // admin picks another project, `reload` gets a new identity and the effect refetches.
  const { selectedId } = usePortalProject();
  const [data, setData] = useState<PortalData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    void selectedId;
    try {
      const [
        spaces, domains, vendors, materials, drawings, decisions,
        procurement, boqs, snags, progress, warranties,
      ] = await Promise.all([
        api.spaces(), api.domains(), api.vendors(), api.materials(),
        api.drawings(), api.decisions(), api.procurement(), api.boqs(),
        api.snags(), api.progress(), api.warranties(),
      ]);
      setData({
        spaces, domains, vendors, materials, drawings, decisions,
        procurement, boqs, snags, progress, warranties,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    // Mount-time data fetch: state updates happen after the await inside reload().
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  return (
    <PortalDataContext.Provider value={{ data, loading, error, reload }}>
      {children}
    </PortalDataContext.Provider>
  );
}

/** Build an id→name lookup map (preserves the maps portal pages used to compute). */
export function nameMap<T extends { id: string; name: string }>(
  rows: T[],
): Record<string, string> {
  return Object.fromEntries(rows.map((r) => [r.id, r.name]));
}

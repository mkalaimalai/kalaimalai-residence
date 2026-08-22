"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";

/**
 * Fetch a single portal entity collection on mount. Use instead of reading
 * from `PortalDataProvider` when you only need one or two entity types —
 * avoids fetching everything on mount.
 */
export function usePortalEntity<T>(
  fetch: () => Promise<T>,
): { data: T | null; loading: boolean; error: string | null; reload: () => Promise<void> } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetch();
      if (mounted.current) {
        setData(result);
        setLoading(false);
      }
    } catch (err) {
      if (mounted.current) {
        setData(null);
        setError(err instanceof Error ? err.message : "Failed to load");
        setLoading(false);
      }
    }
  }, [fetch]);

  useEffect(() => {
    void load();
    return () => { mounted.current = false; };
  }, [load]);

  return { data, loading, error, reload: load };
}

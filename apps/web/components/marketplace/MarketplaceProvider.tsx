"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api-client";
import type { Professional, ProjectBrief, BriefResponse } from "@/types/api";

interface MarketplaceContextType {
  professionals: Professional[];
  briefs: ProjectBrief[];
  loading: boolean;
  error: string | null;
  fetchProfessionals: () => Promise<void>;
  fetchBriefs: () => Promise<void>;
  createProfessional: (professional: Professional) => Promise<void>;
  createBrief: (brief: ProjectBrief) => Promise<void>;
  createResponse: (briefId: string, response: BriefResponse) => Promise<void>;
}

const MarketplaceContext = createContext<MarketplaceContextType | null>(null);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [briefs, setBriefs] = useState<ProjectBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfessionals = async () => {
    try {
      setError(null);
      const data = await api.professionals();
      setProfessionals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch professionals");
    }
  };

  const fetchBriefs = async () => {
    try {
      setError(null);
      const data = await api.briefs();
      setBriefs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch briefs");
    }
  };

  const createProfessional = async (professional: Professional) => {
    try {
      setError(null);
      const created = await api.createProfessional(professional);
      setProfessionals((prev) => [...prev, created]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create professional";
      setError(message);
      throw err;
    }
  };

  const createBrief = async (brief: ProjectBrief) => {
    try {
      setError(null);
      const created = await api.createBrief(brief);
      setBriefs((prev) => [...prev, created]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create brief";
      setError(message);
      throw err;
    }
  };

  const createResponse = async (briefId: string, response: BriefResponse) => {
    try {
      setError(null);
      const created = await api.createResponse(briefId, response);
      setBriefs((prev) =>
        prev.map((b) =>
          b.id === briefId ? { ...b, responses: [...b.responses, created] } : b
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create response";
      setError(message);
      throw err;
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      await fetchProfessionals();
      await fetchBriefs();
      if (mounted) setLoading(false);
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <MarketplaceContext.Provider
      value={{
        professionals,
        briefs,
        loading,
        error,
        fetchProfessionals,
        fetchBriefs,
        createProfessional,
        createBrief,
        createResponse,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider");
  }
  return context;
}
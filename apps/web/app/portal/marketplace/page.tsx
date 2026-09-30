"use client";

import { useState } from "react";
import { usePortalData } from "@/components/portal/PortalDataProvider";
import { MarketplaceProvider, useMarketplace } from "@/components/marketplace/MarketplaceProvider";
import { ProfessionalCard } from "@/components/marketplace/ProfessionalCard";
import { BriefCard } from "@/components/marketplace/BriefCard";
import { ProfessionalForm } from "@/components/marketplace/ProfessionalForm";
import { BriefForm } from "@/components/marketplace/BriefForm";
import { Users, Briefcase, Plus, Search, Filter } from "lucide-react";

function MarketplaceContent() {
  const { error } = usePortalData();
  const {
    professionals,
    briefs,
    loading: mpLoading,
    error: mpError,
    createProfessional,
    createBrief,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<"directory" | "briefs">("directory");
  const [showProfessionalForm, setShowProfessionalForm] = useState(false);
  const [showBriefForm, setShowBriefForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const professionalTypes = [
    "Architect",
    "Interior Designer",
    "Structural Consultant",
    "Electrical Consultant",
    "Plumbing Consultant",
    "HVAC Consultant",
    "Lighting Consultant",
    "Automation Specialist",
    "Landscape Architect",
    "General Contractor",
    "Subcontractor",
    "Supplier",
    "Trade",
  ];

  const filteredProfessionals = professionals.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specializations.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      p.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const filteredBriefs = briefs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <header className="space-y-1 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Marketplace</h1>
          <p className="text-sm text-muted-foreground">
            Discover professionals and post project briefs — the platform understands the work
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "directory" && (
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              onClick={() => setShowProfessionalForm(true)}
            >
              <Plus className="h-4 w-4" />
              Add Professional
            </button>
          )}
          {activeTab === "briefs" && (
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              onClick={() => setShowBriefForm(true)}
            >
              <Plus className="h-4 w-4" />
              Post Brief
            </button>
          )}
        </div>
      </header>

      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Couldn&apos;t load portal data: {error}
        </p>
      )}

      {mpError && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Marketplace error: {mpError}
        </p>
      )}

      <div className="border-b border-border">
        <nav className="flex gap-1 overflow-x-auto p-3 md:w-56 md:flex-col md:overflow-visible md:border-b-0 md:border-r md:p-4" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "directory"}
            onClick={() => setActiveTab("directory")}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
              activeTab === "directory"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            Professionals ({professionals.length})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "briefs"}
            onClick={() => setActiveTab("briefs")}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
              activeTab === "briefs"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Project Briefs ({briefs.length})
          </button>
        </nav>
      </div>

      {activeTab === "directory" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search professionals..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
              />
            </div>
            <div className="relative w-[200px]">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={typeFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
              >
                <option value="all">All types</option>
                {professionalTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {mpLoading ? (
            <p className="px-1 py-8 text-sm text-muted-foreground">Loading professionals…</p>
          ) : filteredProfessionals.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                {searchQuery || typeFilter !== "all"
                  ? "No professionals match your filters."
                  : "No professionals yet. Add the first one!"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProfessionals.map((professional) => (
                <ProfessionalCard key={professional.id} professional={professional} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "briefs" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search briefs..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
              />
            </div>
            <div className="relative w-[200px]">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
              >
                <option value="all">All statuses</option>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {mpLoading ? (
            <p className="px-1 py-8 text-sm text-muted-foreground">Loading briefs…</p>
          ) : filteredBriefs.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "No briefs match your filters."
                  : "No project briefs yet. Post the first one!"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBriefs.map((brief) => (
                <BriefCard key={brief.id} brief={brief} />
              ))}
            </div>
          )}
        </div>
      )}

      <ProfessionalForm
        open={showProfessionalForm}
        onClose={() => setShowProfessionalForm(false)}
        onSubmit={createProfessional}
      />
      <BriefForm
        open={showBriefForm}
        onClose={() => setShowBriefForm(false)}
        onSubmit={createBrief}
      />
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <MarketplaceProvider>
      <MarketplaceContent />
    </MarketplaceProvider>
  );
}
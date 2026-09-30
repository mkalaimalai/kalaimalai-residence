"use client";

import { useState } from "react";
import { ProjectBrief, ProfessionalType, BriefStatus } from "@/types/api";
import { X } from "lucide-react";

const PROFESSIONAL_TYPES: ProfessionalType[] = [
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

const CURRENCIES = ["INR", "EUR", "USD"] as const;
const STATUSES: BriefStatus[] = ["Draft", "Published", "In Progress", "Closed"];

interface BriefFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (brief: ProjectBrief) => Promise<void>;
}

export function BriefForm({ open, onClose, onSubmit }: BriefFormProps) {
  const [formData, setFormData] = useState<Partial<ProjectBrief>>({
    title: "",
    description: "",
    requiredProfessionalTypes: [],
    budgetMin: 0,
    budgetMax: 0,
    budgetCurrency: "INR",
    timeline: "",
    location: "",
    status: "Draft",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const handleChange = (field: string, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleArrayChange = (field: string, value: string) => {
    const arr = value.split("\n").map((s) => s.trim()).filter(Boolean);
    handleChange(field, arr);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.requiredProfessionalTypes || formData.requiredProfessionalTypes.length === 0) {
      newErrors.requiredProfessionalTypes = "At least one professional type is required";
    }
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.timeline) newErrors.timeline = "Timeline is required";
    if (!formData.budgetMin || formData.budgetMin <= 0) newErrors.budgetMin = "Budget minimum must be greater than 0";
    if (!formData.budgetMax || formData.budgetMax <= 0) newErrors.budgetMax = "Budget maximum must be greater than 0";
    if (formData.budgetMax && formData.budgetMin && formData.budgetMax < formData.budgetMin) {
      newErrors.budgetMax = "Budget maximum must be greater than minimum";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const brief: ProjectBrief = {
        projectId: "",
        id: "",
        ...formData,
        responses: [],
      } as ProjectBrief;
      await onSubmit(brief);
      onClose();
    } catch (err) {
      console.error("Failed to create brief:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card bg-background">
        <div className="flex flex-row items-center justify-between border-b p-4">
          <div>
            <h2 className="text-xl font-semibold">Post Project Brief</h2>
            <p className="text-sm text-muted-foreground">Describe your project and find the right professionals</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 p-4 pb-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Project Title *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title as string}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("title", e.target.value)}
                placeholder="e.g., Villa Renovation - Structural & Electrical Design"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description as string}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange("description", e.target.value)}
                placeholder="Describe your project requirements, scope, and any specific needs..."
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="requiredProfessionalTypes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Required Professional Types * (one per line)
              </label>
              <textarea
                id="requiredProfessionalTypes"
                value={(formData.requiredProfessionalTypes as string[]).join("\n")}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleArrayChange("requiredProfessionalTypes", e.target.value)}
                placeholder="Architect\nStructural Consultant\nElectrical Consultant"
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.requiredProfessionalTypes && (
                <p className="text-sm text-destructive">{errors.requiredProfessionalTypes}</p>
              )}
              <div className="flex flex-wrap gap-1 mt-1">
                {PROFESSIONAL_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className="text-xs px-2 py-1 rounded border border-border hover:bg-muted"
                    onClick={() => {
                      const current = formData.requiredProfessionalTypes as string[];
                      if (current.includes(type)) {
                        handleChange("requiredProfessionalTypes", current.filter((t) => t !== type));
                      } else {
                        handleChange("requiredProfessionalTypes", [...current, type]);
                      }
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-border" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="budgetMin" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Budget Minimum *
                </label>
                <input
                  id="budgetMin"
                  type="number"
                  min="1"
                  value={formData.budgetMin as number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("budgetMin", parseInt(e.target.value) || 0)}
                  placeholder="1000000"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.budgetMin && <p className="text-sm text-destructive">{errors.budgetMin}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="budgetMax" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Budget Maximum *
                </label>
                <input
                  id="budgetMax"
                  type="number"
                  min="1"
                  value={formData.budgetMax as number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("budgetMax", parseInt(e.target.value) || 0)}
                  placeholder="5000000"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.budgetMax && <p className="text-sm text-destructive">{errors.budgetMax}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="budgetCurrency" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Currency
                </label>
                <select
                  id="budgetCurrency"
                  value={formData.budgetCurrency as string}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange("budgetCurrency", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="timeline" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Timeline *
              </label>
              <input
                id="timeline"
                type="text"
                value={formData.timeline as string}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("timeline", e.target.value)}
                placeholder="e.g., 6 months (design: 2 months, construction: 4 months)"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.timeline && <p className="text-sm text-destructive">{errors.timeline}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Location *
              </label>
              <input
                id="location"
                type="text"
                value={formData.location as string}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("location", e.target.value)}
                placeholder="e.g., Bengaluru, Karnataka, India"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
            </div>

            <hr className="border-border" />

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Status
              </label>
              <select
                id="status"
                value={formData.status as string}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange("status", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? "Posting..." : "Post Brief"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
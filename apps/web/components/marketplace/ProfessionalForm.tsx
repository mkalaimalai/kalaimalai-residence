"use client";

import { useState } from "react";
import { Professional, ProfessionalType } from "@/types/api";
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
const STATUSES = ["Active", "Inactive", "On Hold", "Blacklisted"] as const;

interface ProfessionalFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (professional: Professional) => Promise<void>;
}

export function ProfessionalForm({ open, onClose, onSubmit }: ProfessionalFormProps) {
  const [formData, setFormData] = useState<Partial<Professional>>({
    name: "",
    company: "",
    type: "Architect",
    specializations: [],
    contactPerson: "",
    phone: "",
    email: "",
    location: "",
    serviceAreas: [],
    website: "",
    portfolioImages: [],
    certifications: [],
    licenseNumber: "",
    rating: 0,
    reviewCount: 0,
    status: "Active",
    availability: "",
    hourlyRate: undefined,
    currency: "INR",
    notes: "",
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
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.type) newErrors.type = "Type is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email";
    if (!formData.location) newErrors.location = "Location is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const professional: Professional = {
        projectId: "",
        id: "",
        ...formData,
      } as Professional;
      await onSubmit(professional);
      onClose();
    } catch (err) {
      console.error("Failed to create professional:", err);
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
            <h2 className="text-xl font-semibold">Add Professional</h2>
            <p className="text-sm text-muted-foreground">Create a new professional listing in the marketplace</p>
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name as string}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("name", e.target.value)}
                  placeholder="e.g., Rajesh Sharma"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="company" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Company
                </label>
                <input
                  id="company"
                  type="text"
                  value={formData.company as string}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("company", e.target.value)}
                  placeholder="e.g., Sharma Architects"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Professional Type *
              </label>
              <select
                id="type"
                value={formData.type as string}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange("type", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {PROFESSIONAL_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="specializations" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Specializations (one per line)
              </label>
              <textarea
                id="specializations"
                value={(formData.specializations as string[]).join("\n")}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleArrayChange("specializations", e.target.value)}
                placeholder="e.g., Residential Design\nSustainable Architecture\nInterior Design"
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <hr className="border-border" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="contactPerson" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Contact Person
                </label>
                <input
                  id="contactPerson"
                  type="text"
                  value={formData.contactPerson as string}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("contactPerson", e.target.value)}
                  placeholder="e.g., Rajesh Sharma"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone as string}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email as string}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("email", e.target.value)}
                  placeholder="rajesh@sharmaarchitects.com"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
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
                  placeholder="e.g., Bengaluru, Karnataka"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="serviceAreas" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Service Areas (one per line)
              </label>
              <textarea
                id="serviceAreas"
                value={(formData.serviceAreas as string[]).join("\n")}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleArrayChange("serviceAreas", e.target.value)}
                placeholder="e.g., Bengaluru\nMysuru\nChennai"
                rows={2}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="website" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Website
              </label>
              <input
                id="website"
                type="url"
                value={formData.website as string}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("website", e.target.value)}
                placeholder="https://sharmaarchitects.com"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <hr className="border-border" />

            <div className="space-y-2">
              <label htmlFor="portfolioImages" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Portfolio Images (URLs, one per line)
              </label>
              <textarea
                id="portfolioImages"
                value={(formData.portfolioImages as string[]).join("\n")}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleArrayChange("portfolioImages", e.target.value)}
                placeholder="https://example.com/project1.jpg\nhttps://example.com/project2.jpg"
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="certifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Certifications (one per line)
              </label>
              <textarea
                id="certifications"
                value={(formData.certifications as string[]).join("\n")}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleArrayChange("certifications", e.target.value)}
                placeholder="COA Registration\nLEED AP\nGRIHA Certified"
                rows={2}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="licenseNumber" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  License Number
                </label>
                <input
                  id="licenseNumber"
                  type="text"
                  value={formData.licenseNumber as string}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("licenseNumber", e.target.value)}
                  placeholder="CA/2023/12345"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="rating" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Rating (0-5)
                </label>
                <input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating as number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("rating", parseFloat(e.target.value) || 0)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="reviewCount" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Review Count
                </label>
                <input
                  id="reviewCount"
                  type="number"
                  min="0"
                  value={formData.reviewCount as number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("reviewCount", parseInt(e.target.value) || 0)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
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
            </div>

            <div className="space-y-2">
              <label htmlFor="availability" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Availability
              </label>
              <input
                id="availability"
                type="text"
                value={formData.availability as string}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("availability", e.target.value)}
                placeholder="e.g., Available in 2 weeks, Mon-Fri 9am-6pm"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="hourlyRate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Hourly Rate
                </label>
                <input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  value={formData.hourlyRate as number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("hourlyRate", e.target.value ? parseFloat(e.target.value) : 0)}
                  placeholder="5000"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="currency" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Currency
                </label>
                <select
                  id="currency"
                  value={formData.currency as string}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange("currency", e.target.value)}
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
              <label htmlFor="notes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes as string}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange("notes", e.target.value)}
                placeholder="Additional notes about the professional..."
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
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
                {submitting ? "Creating..." : "Create Professional"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
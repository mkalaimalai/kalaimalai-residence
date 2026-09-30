"use client";

import { Professional } from "@/types/api";
import { Star, MapPin, Mail, Phone, Globe, Award, Clock } from "lucide-react";

interface ProfessionalCardProps {
  professional: Professional;
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Architect: "bg-blue-100 text-blue-800",
      "Interior Designer": "bg-pink-100 text-pink-800",
      "Structural Consultant": "bg-gray-100 text-gray-800",
      "Electrical Consultant": "bg-yellow-100 text-yellow-800",
      "Plumbing Consultant": "bg-cyan-100 text-cyan-800",
      "HVAC Consultant": "bg-orange-100 text-orange-800",
      "Lighting Consultant": "bg-amber-100 text-amber-800",
      "Automation Specialist": "bg-purple-100 text-purple-800",
      "Landscape Architect": "bg-green-100 text-green-800",
      "General Contractor": "bg-red-100 text-red-800",
      Subcontractor: "bg-indigo-100 text-indigo-800",
      Supplier: "bg-teal-100 text-teal-800",
      Trade: "bg-slate-100 text-slate-800",
    };
    return colors[type] || "bg-muted text-muted-foreground";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Active: "bg-green-100 text-green-800",
      Inactive: "bg-gray-100 text-gray-800",
      "On Hold": "bg-yellow-100 text-yellow-800",
      Blacklisted: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="rounded-xl border border-border bg-card flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">{professional.name}</h3>
            <p className="text-sm text-muted-foreground">{professional.company}</p>
          </div>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeColor(professional.type)}`}>
            {professional.type}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {professional.specializations.slice(0, 3).map((spec) => (
            <span key={spec} className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
              {spec}
            </span>
          ))}
          {professional.specializations.length > 3 && (
            <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
              +{professional.specializations.length - 3} more
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{professional.location}</span>
        </div>
        {professional.serviceAreas.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            <span className="truncate">
              {professional.serviceAreas.slice(0, 2).join(", ")}
              {professional.serviceAreas.length > 2 ? "..." : ""}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          <a href={`mailto:${professional.email}`} className="truncate hover:text-foreground underline">
            {professional.email}
          </a>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          <span>{professional.phone}</span>
        </div>
        {professional.website && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            <a href={professional.website} target="_blank" rel="noopener" className="truncate hover:text-foreground underline">
              {professional.website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
          <span className="font-medium">{professional.rating.toFixed(1)}</span>
          <span className="text-muted-foreground">({professional.reviewCount} reviews)</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{professional.availability || "Availability not specified"}</span>
        </div>
        {professional.hourlyRate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Award className="h-3.5 w-3.5" />
            <span>₹{professional.hourlyRate.toLocaleString()}/hr</span>
          </div>
        )}
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(professional.status)}`}>
          {professional.status}
        </span>
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <button className="flex-1 text-sm py-2 rounded-md border border-border bg-background hover:bg-muted disabled:opacity-50" disabled>
            View Profile
          </button>
          <button className="flex-1 text-sm py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50" disabled>
            Contact
          </button>
        </div>
      </div>
    </div>
  );
}
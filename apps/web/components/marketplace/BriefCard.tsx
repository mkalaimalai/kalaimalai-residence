"use client";

import { ProjectBrief, BriefResponse } from "@/types/api";
import { MapPin, Calendar, IndianRupee, Users } from "lucide-react";

interface BriefCardProps {
  brief: ProjectBrief;
}

export function BriefCard({ brief }: BriefCardProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Draft: "bg-gray-100 text-gray-800",
      Published: "bg-green-100 text-green-800",
      "In Progress": "bg-blue-100 text-blue-800",
      Closed: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const getResponseStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: "bg-yellow-100 text-yellow-800",
      Shortlisted: "bg-blue-100 text-blue-800",
      Rejected: "bg-red-100 text-red-800",
      Accepted: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold truncate">{brief.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{brief.description}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(brief.status)}`}>
          {brief.status}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {brief.requiredProfessionalTypes.slice(0, 3).map((type) => (
          <span key={type} className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
            {type}
          </span>
        ))}
        {brief.requiredProfessionalTypes.length > 3 && (
          <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
            +{brief.requiredProfessionalTypes.length - 3} more
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{brief.location}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{brief.timeline}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <IndianRupee className="h-3.5 w-3.5" />
          <span>
            {brief.budgetCurrency} {brief.budgetMin.toLocaleString()} - {brief.budgetMax.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>{brief.responses.length} responses</span>
        </div>
      </div>

      {brief.responses.length > 0 && (
        <div className="space-y-2 border-t pt-4">
          <h4 className="text-sm font-medium text-foreground">Responses</h4>
          <div className="space-y-1">
            {brief.responses.slice(0, 3).map((response: BriefResponse) => (
              <div
                key={response.id}
                className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{response.professionalName}</p>
                  <p className="text-xs text-muted-foreground truncate">{response.approach}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getResponseStatusColor(response.status)}`}>
                    {response.status}
                  </span>
                  <span className="text-sm font-medium">
                    {response.currency} {response.proposedFee.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
            {brief.responses.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                +{brief.responses.length - 3} more responses
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
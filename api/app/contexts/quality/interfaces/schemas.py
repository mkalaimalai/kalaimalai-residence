"""Pydantic request/response models for the quality context."""
from __future__ import annotations

from app.shared.camel import CamelModel


# --- Snag --------------------------------------------------------------------------
class SnagResponse(CamelModel):
    id: str
    space_id: str
    category: str
    description: str
    photo_url: str
    assigned_to: str
    priority: str
    status: str
    target_closure_date: str
    actual_closure_date: str
    notes: str


class SnagCreate(CamelModel):
    space_id: str = ""
    category: str = ""
    description: str = ""
    photo_url: str = ""
    assigned_to: str = ""
    priority: str = "Low"
    status: str = "Open"
    target_closure_date: str = ""
    actual_closure_date: str = ""
    notes: str = ""


class SnagUpdate(CamelModel):
    space_id: str | None = None
    category: str | None = None
    description: str | None = None
    photo_url: str | None = None
    assigned_to: str | None = None
    priority: str | None = None
    status: str | None = None
    target_closure_date: str | None = None
    actual_closure_date: str | None = None
    notes: str | None = None


# --- Decision ----------------------------------------------------------------------
class DecisionResponse(CamelModel):
    id: str
    title: str
    domain_id: str
    space_id: str
    type: str
    options_considered: list[str]
    final_decision: str
    reason: str
    cost_impact: str
    time_impact: str
    quality_impact: str
    date: str
    owner: str
    status: str


class DecisionCreate(CamelModel):
    title: str
    domain_id: str = ""
    space_id: str = ""
    type: str = "Design"
    options_considered: list[str] = []
    final_decision: str = ""
    reason: str = ""
    cost_impact: str = ""
    time_impact: str = ""
    quality_impact: str = ""
    date: str = ""
    owner: str = ""
    status: str = "Open"


class DecisionUpdate(CamelModel):
    title: str | None = None
    domain_id: str | None = None
    space_id: str | None = None
    type: str | None = None
    options_considered: list[str] | None = None
    final_decision: str | None = None
    reason: str | None = None
    cost_impact: str | None = None
    time_impact: str | None = None
    quality_impact: str | None = None
    date: str | None = None
    owner: str | None = None
    status: str | None = None

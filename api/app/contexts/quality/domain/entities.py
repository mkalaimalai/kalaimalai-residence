"""Quality context domain entities — Snag, Decision."""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Snag:
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


@dataclass
class Inspection:
    id: str
    space_id: str
    work_package_id: str = ""
    inspector: str = ""
    inspection_date: str = ""
    result: str = "Pending"  # Pending|Pass|Fail
    notes: str = ""


@dataclass
class Decision:
    id: str
    title: str
    domain_id: str
    space_id: str
    type: str
    options_considered: list[str] = field(default_factory=list)
    final_decision: str = ""
    reason: str = ""
    cost_impact: str = ""
    time_impact: str = ""
    quality_impact: str = ""
    date: str = ""
    owner: str = ""
    status: str = "Open"

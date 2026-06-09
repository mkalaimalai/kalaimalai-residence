"""Project context domain entities — pure dataclasses (field names == ORM columns)."""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Space:
    id: str
    slug: str
    name: str
    description: str
    design_intent: str
    image: str
    domain_ids: list[str] = field(default_factory=list)
    material_ids: list[str] = field(default_factory=list)
    furniture: list[str] = field(default_factory=list)
    lighting: list[str] = field(default_factory=list)
    vendor_ids: list[str] = field(default_factory=list)
    drawing_ids: list[str] = field(default_factory=list)
    decision_ids: list[str] = field(default_factory=list)
    status: str = "Concept"
    lesson_ids: list[str] = field(default_factory=list)


@dataclass
class Domain:
    id: str
    slug: str
    name: str
    description: str
    space_ids: list[str] = field(default_factory=list)
    drawing_ids: list[str] = field(default_factory=list)
    vendor_ids: list[str] = field(default_factory=list)
    status: str = "Not Started"
    lesson_ids: list[str] = field(default_factory=list)


@dataclass
class ProgressEntry:
    id: str
    date: str
    phase: str
    space_id: str
    work_completed: str
    photos: list[str] = field(default_factory=list)
    issues: str = ""
    next_action: str = ""
    owner: str = ""
    status: str = ""


@dataclass
class Project:
    id: str
    public_title: str
    public_subtitle: str
    city: str
    designer: str
    direction: str
    hero_image: str
    concept_statement: str
    internal_name: str
    villa_no: str
    community: str
    address: str
    plot_area: str
    built_up_area: str
    floors: int
    status: str
    start_date: str

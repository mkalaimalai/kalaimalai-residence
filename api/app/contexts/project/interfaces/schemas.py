"""Pydantic request/response models for the project context.

Response shapes mirror `types/index.ts` (Space, Domain, ProgressEntry, Project).
The Project entity is split into PublicProject (anonymized, build-time) and FullProject
(authenticated portal) per constitution §5.
"""
from __future__ import annotations

from app.shared.camel import CamelModel


# --- Space -------------------------------------------------------------------------
class SpaceResponse(CamelModel):
    id: str
    slug: str
    name: str
    description: str
    design_intent: str
    image: str
    domain_ids: list[str]
    material_ids: list[str]
    furniture: list[str]
    lighting: list[str]
    vendor_ids: list[str]
    drawing_ids: list[str]
    decision_ids: list[str]
    status: str
    lesson_ids: list[str]


class SpaceCreate(CamelModel):
    name: str
    slug: str | None = None
    description: str = ""
    design_intent: str = ""
    image: str = ""
    domain_ids: list[str] = []
    material_ids: list[str] = []
    furniture: list[str] = []
    lighting: list[str] = []
    vendor_ids: list[str] = []
    drawing_ids: list[str] = []
    decision_ids: list[str] = []
    status: str = "Concept"
    lesson_ids: list[str] = []


class SpaceUpdate(CamelModel):
    slug: str | None = None
    name: str | None = None
    description: str | None = None
    design_intent: str | None = None
    image: str | None = None
    domain_ids: list[str] | None = None
    material_ids: list[str] | None = None
    furniture: list[str] | None = None
    lighting: list[str] | None = None
    vendor_ids: list[str] | None = None
    drawing_ids: list[str] | None = None
    decision_ids: list[str] | None = None
    status: str | None = None
    lesson_ids: list[str] | None = None


# --- Domain ------------------------------------------------------------------------
class DomainResponse(CamelModel):
    id: str
    slug: str
    name: str
    description: str
    space_ids: list[str]
    drawing_ids: list[str]
    vendor_ids: list[str]
    status: str
    lesson_ids: list[str]


class DomainCreate(CamelModel):
    name: str
    slug: str | None = None
    description: str = ""
    space_ids: list[str] = []
    drawing_ids: list[str] = []
    vendor_ids: list[str] = []
    status: str = "Not Started"
    lesson_ids: list[str] = []


class DomainUpdate(CamelModel):
    slug: str | None = None
    name: str | None = None
    description: str | None = None
    space_ids: list[str] | None = None
    drawing_ids: list[str] | None = None
    vendor_ids: list[str] | None = None
    status: str | None = None
    lesson_ids: list[str] | None = None


# --- ProgressEntry -----------------------------------------------------------------
class ProgressResponse(CamelModel):
    id: str
    date: str
    phase: str
    space_id: str
    work_completed: str
    photos: list[str]
    issues: str
    next_action: str
    owner: str
    status: str


class ProgressCreate(CamelModel):
    date: str = ""
    phase: str = ""
    space_id: str = ""
    work_completed: str = ""
    photos: list[str] = []
    issues: str = ""
    next_action: str = ""
    owner: str = ""
    status: str = ""


class ProgressUpdate(CamelModel):
    date: str | None = None
    phase: str | None = None
    space_id: str | None = None
    work_completed: str | None = None
    photos: list[str] | None = None
    issues: str | None = None
    next_action: str | None = None
    owner: str | None = None
    status: str | None = None


# --- Project -----------------------------------------------------------------------
class PublicProject(CamelModel):
    # Anonymized identity + non-sensitive stats shown on public pages.
    id: str
    public_title: str
    public_subtitle: str
    city: str
    designer: str
    direction: str
    hero_image: str
    concept_statement: str
    plot_area: str
    built_up_area: str
    floors: int
    status: str
    start_date: str


class FullProject(PublicProject):
    # Genuinely sensitive identity/location — authenticated portal only (constitution §5).
    internal_name: str
    villa_no: str
    community: str
    address: str


class ProjectCreate(CamelModel):
    public_title: str
    public_subtitle: str = ""
    city: str = ""
    designer: str = ""
    direction: str = ""
    hero_image: str = ""
    concept_statement: str = ""
    plot_area: str = ""
    built_up_area: str = ""
    floors: int = 0
    status: str = ""
    start_date: str = ""
    internal_name: str = ""
    villa_no: str = ""
    community: str = ""
    address: str = ""


class ProjectUpdate(CamelModel):
    public_title: str | None = None
    public_subtitle: str | None = None
    city: str | None = None
    designer: str | None = None
    direction: str | None = None
    hero_image: str | None = None
    concept_statement: str | None = None
    internal_name: str | None = None
    villa_no: str | None = None
    community: str | None = None
    address: str | None = None
    plot_area: str | None = None
    built_up_area: str | None = None
    floors: int | None = None
    status: str | None = None
    start_date: str | None = None

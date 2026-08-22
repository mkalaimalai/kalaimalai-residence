"""Document context domain entities — Drawing, DrawingRevision, GalleryItem, Lesson."""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Drawing:
    id: str
    title: str
    domain_id: str
    space_id: str  # "" if not room-specific
    revision: str
    date: str
    status: str
    consultant: str
    file_url: str
    notes: str
    # ISO 19650 code for the current revision; mirrors the latest DrawingRevision.
    # Defaulted to S0 (work in progress) so existing callers that omit it are valid.
    suitability: str = "S0"
    # Tenant boundary (migrations/002_project_scope.sql). Defaulted only because
    # dataclass ordering forbids a required field after defaulted ones;
    # CrudService.create rejects an empty value before it reaches the FK.
    project_id: str = ""


@dataclass
class DrawingRevision:
    """One issue of a drawing.

    The file belongs here, not on the Drawing: a Drawing is the stable register entry
    (IFC's IfcDocumentInformation) and this is the versioned issue. Before this existed,
    `Drawing.revision` was a single mutable string, so every re-issue destroyed its
    predecessor and "what changed" had no answer.
    """

    id: str
    drawing_id: str
    code: str
    issued_on: str
    suitability: str
    file_url: str
    supersedes_id: str
    issued_by: str
    change_note: str
    project_id: str = ""


@dataclass
class GalleryItem:
    id: str
    title: str
    category: str
    image: str
    space_id: str  # "" if not space-specific
    domain_id: str  # "" if not domain-specific
    caption: str
    # Tenant boundary (migrations/002_project_scope.sql). Defaulted only because
    # dataclass ordering forbids a required field after defaulted ones;
    # CrudService.create rejects an empty value before it reaches the FK.
    project_id: str = ""


@dataclass
class Lesson:
    id: str
    title: str
    category: str
    summary: str
    domain_id: str
    space_id: str
    impact: dict = field(default_factory=dict)  # {cost,time,quality,design}
    # Tenant boundary (migrations/002_project_scope.sql). Defaulted only because
    # dataclass ordering forbids a required field after defaulted ones;
    # CrudService.create rejects an empty value before it reaches the FK.
    project_id: str = ""

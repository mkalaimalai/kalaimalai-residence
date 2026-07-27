"""Media context domain entities — MediaSet."""
from __future__ import annotations

from dataclasses import dataclass, field

# A set is either a photoreal rendering group or a technical drawing sheet group.
RENDERING = "rendering"
DRAWING_SHEET = "drawing_sheet"
KINDS = (RENDERING, DRAWING_SHEET)


@dataclass
class MediaSet:
    """A titled group of images owned by a project, optionally by a domain or space.

    Deliberately shaped like `RenderingSet` in `data/renderings.ts`
    (title/width/height/images/subsections) so `components/RenderingGallery` renders
    DB rows without a translation layer.
    """

    id: str
    kind: str  # rendering|drawing_sheet
    title: str
    width: int = 1600
    height: int = 900
    images: list[str] = field(default_factory=list)
    subsections: list[dict] | None = None
    domain_id: str | None = None
    space_id: str | None = None
    sort_order: int = 0
    # Tenant boundary (migrations/003_media_sets.sql). Defaulted only because
    # dataclass ordering forbids a required field after defaulted ones;
    # CrudService.create rejects an empty value before it reaches the FK.
    project_id: str = ""

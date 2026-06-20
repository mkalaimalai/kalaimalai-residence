"""Document context domain entities — Drawing, GalleryItem, Lesson."""
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


@dataclass
class GalleryItem:
    id: str
    title: str
    category: str
    image: str
    space_id: str  # "" if not space-specific
    domain_id: str  # "" if not domain-specific
    caption: str


@dataclass
class Lesson:
    id: str
    title: str
    category: str
    summary: str
    domain_id: str
    space_id: str
    impact: dict = field(default_factory=dict)  # {cost,time,quality,design}

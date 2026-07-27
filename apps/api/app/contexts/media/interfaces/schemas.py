"""Pydantic request/response models for the media context."""
from __future__ import annotations

from typing import Literal

from app.shared.camel import CamelModel

MediaKind = Literal["rendering", "drawing_sheet"]


class MediaSubsection(CamelModel):
    title: str
    images: list[str] = []


# --- MediaSet ----------------------------------------------------------------------
class MediaSetResponse(CamelModel):
    project_id: str
    id: str
    kind: MediaKind
    title: str
    width: int
    height: int
    images: list[str]
    subsections: list[MediaSubsection] | None
    domain_id: str | None
    space_id: str | None
    sort_order: int


class MediaSetCreate(CamelModel):
    project_id: str
    kind: MediaKind
    title: str
    width: int = 1600
    height: int = 900
    images: list[str] = []
    subsections: list[MediaSubsection] | None = None
    domain_id: str | None = None
    space_id: str | None = None
    sort_order: int = 0


class MediaSetUpdate(CamelModel):
    kind: MediaKind | None = None
    title: str | None = None
    width: int | None = None
    height: int | None = None
    images: list[str] | None = None
    subsections: list[MediaSubsection] | None = None
    domain_id: str | None = None
    space_id: str | None = None
    sort_order: int | None = None


class UploadedFileResponse(CamelModel):
    """One file pushed to Google Drive. `url` is what goes into a set's `images`."""

    name: str
    file_id: str
    url: str
    mime_type: str
    size: int

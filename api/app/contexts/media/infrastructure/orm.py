"""SQLAlchemy models for the media context."""
from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.db import Base, ProjectScoped


class MediaSetModel(ProjectScoped, Base):
    __tablename__ = "media_sets"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    kind: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    width: Mapped[int] = mapped_column(Integer, default=1600, nullable=False)
    height: Mapped[int] = mapped_column(Integer, default=900, nullable=False)
    images: Mapped[list[str]] = mapped_column(JSONB, default=list, nullable=False)
    subsections: Mapped[list[dict] | None] = mapped_column(JSONB, nullable=True)
    # SET NULL, not CASCADE: losing the owner should not delete the imagery, it should
    # demote the set to project-level.
    domain_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("domains.id", ondelete="SET NULL"), nullable=True, index=True
    )
    space_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("spaces.id", ondelete="SET NULL"), nullable=True, index=True
    )
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

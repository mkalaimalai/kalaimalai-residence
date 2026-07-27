"""SQLAlchemy model for the identity context.

Not `ProjectScoped`: a person is not owned by a project. Constitution rule 5 scopes the
13 *entity* types to a tenant; identity sits beside that, like `projects` itself.
"""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.db import Base


class UserProfileModel(Base):
    __tablename__ = "user_profiles"

    # The Supabase auth user id (verified JWT `sub`). No FK to auth.users — see the
    # note in migrations/004_user_profiles.sql.
    id: Mapped[str] = mapped_column(String, primary_key=True)
    email: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    display_name: Mapped[str | None] = mapped_column(String, nullable=True)
    # Mirror of app_metadata.role, for display only. Never read for authorization.
    role: Mapped[str] = mapped_column(String, default="viewer", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

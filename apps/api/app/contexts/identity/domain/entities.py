"""Identity context domain entities — UserProfile.

Deliberately *not* a user account: Supabase Auth owns the credential, the email
verification and the session. This is the app's own record of a person, keyed by the
Supabase user id so the two join without inventing a second identifier.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime

VIEWER = "viewer"
ADMIN = "admin"
ROLES = (VIEWER, ADMIN)


def _now() -> datetime:
    return datetime.now(UTC)


@dataclass
class UserProfile:
    """App-level facts about a signed-up person.

    `role` mirrors `app_metadata.role` from the verified token so an admin can see who
    is what. It is never the authorization source — see migrations/004_user_profiles.sql
    and `app/shared/auth.py`. Trusting a column the subject can influence would turn
    "edit my profile" into "make myself an admin".
    """

    id: str  # Supabase auth user id — the verified JWT `sub` claim
    email: str | None = None
    display_name: str | None = None
    role: str = VIEWER
    created_at: datetime = field(default_factory=_now)
    updated_at: datetime = field(default_factory=_now)

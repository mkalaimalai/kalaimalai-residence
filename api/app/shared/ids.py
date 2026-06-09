"""Server-side id generation. Prefixed UUIDs keep ids readable and collision-free."""
from __future__ import annotations

import re
import uuid


def new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12]}"


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or new_id("item")

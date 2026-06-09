"""Imports every ORM model so `Base.metadata` knows all tables.

Used by create_all / seeding / verify. Keeping this in one place avoids import-order
surprises with the declarative metadata.
"""
from __future__ import annotations

from app.contexts.commercial.infrastructure.orm import (  # noqa: F401
    BOQLineItemModel,
    BOQModel,
    MaterialModel,
    ProcurementModel,
    QuoteLineItemModel,
    QuoteModel,
)
from app.contexts.document.infrastructure.orm import (  # noqa: F401
    DrawingModel,
    GalleryModel,
    LessonModel,
)
from app.contexts.handover.infrastructure.orm import WarrantyModel  # noqa: F401
from app.contexts.project.infrastructure.orm import (  # noqa: F401
    DomainModel,
    ProgressModel,
    ProjectModel,
    SpaceModel,
)
from app.contexts.quality.infrastructure.orm import (  # noqa: F401
    DecisionModel,
    SnagModel,
)
from app.contexts.vendor.infrastructure.orm import VendorModel  # noqa: F401

__all__ = ["all_tables_loaded"]

all_tables_loaded = True

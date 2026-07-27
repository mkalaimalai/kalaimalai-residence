"""Commercial context REST controllers — BOQ, procurement, materials.

Writes run synchronous cross-context referential validation through the vendor and
project service-client PORTS (composed here at the interface edge). BOQ and procurement
reads require an authenticated portal user; materials are public (used on public pages).
"""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.contexts.commercial.application.ref_validation import make_ref_validator
from app.contexts.commercial.domain import entities as e
from app.contexts.commercial.infrastructure import orm
from app.contexts.commercial.infrastructure.repository_impl import (
    SqlAlchemyBOQRepository,
    SqlAlchemyMaterialRepository,
    SqlAlchemyProcurementRepository,
)
from app.contexts.commercial.interfaces import schemas as s
from app.contexts.project.infrastructure.repository_impl import (
    SqlAlchemyDomainRepository,
    SqlAlchemySpaceRepository,
)
from app.contexts.project.interfaces.local_service_client import (
    LocalProjectServiceClient,
)
from app.contexts.vendor.infrastructure.repository_impl import (
    SqlAlchemyVendorRepository,
)
from app.contexts.vendor.interfaces.local_service_client import (
    LocalVendorServiceClient,
)
from app.shared.crud import CrudService, make_crud_router


def _ref_validator(session: AsyncSession):
    """Compose the in-process service clients used for synchronous validation."""
    vendors = LocalVendorServiceClient(SqlAlchemyVendorRepository(session))
    project = LocalProjectServiceClient(
        SqlAlchemySpaceRepository(session), SqlAlchemyDomainRepository(session)
    )
    return make_ref_validator(vendors, project)


def _boq_service(session: AsyncSession) -> CrudService:
    return CrudService(
        SqlAlchemyBOQRepository(session), e.BOQ, "boq", _ref_validator(session)
    )


def _procurement_service(session: AsyncSession) -> CrudService:
    return CrudService(
        SqlAlchemyProcurementRepository(session),
        e.ProcurementItem,
        "procurement",
        _ref_validator(session),
    )


def _material_service(session: AsyncSession) -> CrudService:
    return CrudService(
        SqlAlchemyMaterialRepository(session),
        e.Material,
        "material",
        _ref_validator(session),
    )


boq_router = make_crud_router(
    prefix="/boq", tags=["commercial"], orm_cls=orm.BOQModel, entity_cls=e.BOQ,
    response_model=s.BOQResponse, create_model=s.BOQCreate, update_model=s.BOQUpdate,
    id_prefix="boq", public_read=False, service_factory=_boq_service,
)

procurement_router = make_crud_router(
    prefix="/procurement", tags=["commercial"], orm_cls=orm.ProcurementModel,
    entity_cls=e.ProcurementItem, response_model=s.ProcurementResponse,
    create_model=s.ProcurementCreate, update_model=s.ProcurementUpdate,
    id_prefix="procurement", public_read=False, service_factory=_procurement_service,
)

materials_router = make_crud_router(
    prefix="/materials", tags=["commercial"], orm_cls=orm.MaterialModel,
    entity_cls=e.Material, response_model=s.MaterialResponse,
    create_model=s.MaterialCreate, update_model=s.MaterialUpdate,
    id_prefix="material", public_read=True, service_factory=_material_service,
)

# Quote / PurchaseOrder / Delivery routers (the §5/§9 flow) live in quote_controller;
# §6 endpoint-shape conformance (boq-packages, project-nested reads) in nested_controller.
from app.contexts.commercial.interfaces.nested_controller import (  # noqa: E402
    routers as nested_routers,
)
from app.contexts.commercial.interfaces.quote_controller import (  # noqa: E402
    routers as quote_routers,
)

routers = [
    boq_router,
    procurement_router,
    materials_router,
    *quote_routers,
    *nested_routers,
]

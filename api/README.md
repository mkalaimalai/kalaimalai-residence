# Kalaimalai Residence API

A domain-driven, hexagonal **FastAPI** modular monolith over **Supabase Postgres**,
serving the residence site's data and the portal's admin CRUD. Synchronous communication
between bounded contexts (no event bus), per `docs/design-docs/architecture.md`.

## Architecture

One deployable app, split into six **bounded contexts**, each with the four hexagonal
layers (`domain` / `application` / `infrastructure` / `interfaces`):

| Context | Owns (tables) |
| --- | --- |
| `project` | Project, Space, Domain, ProgressEntry |
| `document` | Drawing, GalleryItem, Lesson |
| `vendor` | Vendor |
| `commercial` | BOQ, BOQLineItem, Quote, QuoteLineItem, ProcurementItem, Material |
| `quality` | Snag, Decision |
| `handover` | Warranty |

Rules:

- **Ports** live in `domain/repository.py` (persistence) and `application/service_client.py`
  (cross-context). **Adapters** implement them in `infrastructure/` and
  `interfaces/local_service_client.py`. The domain layer imports no framework.
- **Cross-context access is synchronous, through service-client ports only** — e.g.
  `commercial` validates a `vendorId`/`spaceId` on write via the `VendorServiceClient` /
  `ProjectServiceClient` ports (in-process now, swappable to HTTP when split). No context
  reads another's tables.
- Pydantic response models live in `interfaces/schemas.py` and emit **camelCase** (via
  `CamelModel`) so the frontend `types/index.ts` contract is untouched; Postgres columns
  are snake_case.
- `vendor/` is the hand-written reference context; the others compose the generic CRUD
  kit in `app/shared/crud.py` inside the same four layers.

## Auth

Portal access tokens are Supabase JWTs, verified in `app/shared/auth.py`:

- `require_user` — any authenticated user (portal-sensitive GETs + writes).
- `require_admin` — `user_metadata.role == "admin"` (all writes).
- Public GETs (spaces, domains, drawings, gallery, lessons, materials, vendors, decisions,
  progress, project) are open — needed at static-build time. The sensitive financial/snag
  tables (`/boq`, `/procurement`, `/warranties`, `/snags`) and `/project/full` require auth.

## Local development

```bash
cd api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Point at a Postgres (local or Supabase) and disable auth for convenience.
export DATABASE_URL="postgresql+asyncpg://postgres@localhost:5432/postgres"
export AUTH_DISABLED=true
export PYTHONPATH="$(pwd)"

# 1. Create tables (dev) — prod uses migrations/001_init.sql
python -c "import asyncio; from app.bootstrap import create_all; asyncio.run(create_all())"

# 2. Export the seed from the TS data modules (run from repo root), then load it
(cd .. && npm run export:seed)
python scripts/seed.py

# 3. Verify integrity, then run
python scripts/verify.py
uvicorn app.main:app --reload --port 8099
```

OpenAPI docs: <http://localhost:8099/docs>.

## Deployment (Render free tier)

See `render.yaml`. Build `pip install -r requirements.txt`, start
`uvicorn app.main:app --host 0.0.0.0 --port $PORT`, health check `/healthz`. Set
`DATABASE_URL` (Supabase **pooled**, port 6543), `SUPABASE_JWT_SECRET`, `CORS_ORIGINS`.
Apply `migrations/001_init.sql` to the database once, then run the seed loader.

## Scripts

- `scripts/seed.py` — idempotent load of `scripts/seed.json` into Postgres.
- `scripts/verify.py` — server-side integrity check (counts + referential integrity).
- `migrations/001_init.sql` — table DDL (generated from the ORM metadata).

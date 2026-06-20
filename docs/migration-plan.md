# Data-Layer Migration: Static Export → FastAPI (DDD/Hexagonal) + Supabase

## Context

Today the site is a **static export to GitHub Pages with no database** — all content is
typed seed data in `data/*.ts`, read through async getters in `lib/repository.ts` (the
"only data door"), with relations resolved at render time by `lib/relations.ts`. The
portal is gated by a client-side passcode (`PasswordGate`) that is obscurity, not security.

The design docs (`docs/design-docs/*`) and the business brainstorm chart a path from this
personal case study toward a homeowner platform. **This piece of work is the first step
only: a data-layer migration.** We stand up a real backend and database behind the
existing repository seam, swap the passcode for real auth, and prove it end-to-end on the
current content — **without changing the public site's appearance, the UI, or the locked
`types/index.ts` contract.** New business features come later.

**Decisions already made with the user:**
1. **Backend** = FastAPI (Python) on Render free tier, over **Supabase Postgres**.
2. **Backend architecture** = **domain-driven design + hexagonal (ports & adapters)** with
   **synchronous** communication between domains, per `docs/design-docs/architecture.md`.
3. **Schema** = port the 14 existing `types/index.ts` entities 1:1 to Postgres tables, plus
   add `Quote`, `QuoteLineItem`, `BOQLineItem` (the `updated-schema.md §17` MVP additions).
   No IFC/BCF/COBie/bSDD/IDS yet.
4. **Scope** = data-layer migration **+ admin CRUD**. Public site + read-only portal tables
   unchanged in appearance. Replace `PasswordGate` with real Supabase Auth. **Add an admin
   section** in the portal to **create and edit** Projects and every other entity, wired to
   **create/update (POST/PATCH) APIs**. No further business features (email capture, leads).
5. **Frontend** stays a **static export on GitHub Pages** (admin forms run client-side,
   behind auth, against the live API — no server runtime needed).

The whole migration is tractable because `lib/repository.ts` getters are already `async` and
return the locked `types/index.ts` shapes — call sites and `lib/relations.ts` never change.

---

## Backend: FastAPI as a DDD / hexagonal modular monolith (`api/`)

One deployable FastAPI app (Render deploys from the `api/` subdir), internally split into
**bounded contexts**, each with the four hexagonal layers from `architecture.md §7`. The
domain layer is pure (no SQLAlchemy/Supabase imports); persistence sits behind a repository
**port** implemented by an **adapter** in `infrastructure/`. Cross-domain access is
**synchronous, through service-client ports** — never by reaching into another domain's
tables.

### Bounded-context → entity mapping

| Bounded context | Owns (tables) |
|---|---|
| **project** | Project, Space, Domain, ProgressEntry |
| **document** | Drawing, GalleryItem, Lesson |
| **vendor** | Vendor |
| **commercial** | BOQ, BOQLineItem, Quote, QuoteLineItem, ProcurementItem, Material |
| **quality** | Snag, Decision |
| **handover** | Warranty |

(Notification service from the doc is out of scope for the data layer.)

### Directory layout

```
api/
  requirements.txt                  # fastapi, uvicorn, sqlalchemy[asyncio], asyncpg,
                                    #   pydantic, python-jose[cryptography], supabase
  app/
    main.py                         # FastAPI app, CORS, mounts each context's REST router, /healthz
    config.py                       # env settings (DATABASE_URL, SUPABASE_JWT_SECRET, CORS_ORIGINS, ...)
    bootstrap.py                    # composition root: wire adapters -> ports, build service clients (DI)
    shared/
      camel.py                      # CamelModel base: alias_generator=to_camel, populate_by_name=True
      db.py                         # async SQLAlchemy engine + session (Supabase pooled, port 6543, NullPool)
      auth.py                       # verify Supabase JWT (HS256 via project secret) -> require_user dependency
    contexts/
      vendor/                       # ---- fully-worked reference context ----
        domain/
          entities.py               # Vendor entity — pure, no ORM
          value_objects.py          # Rating, ServiceCategory, VerificationStatus
          repository.py             # VendorRepository PORT (abstract base, the hexagon boundary)
        application/
          use_cases.py              # ListVendors, GetVendor, CreateVendor, UpdateVendor
          commands.py               # CreateVendorCommand, UpdateVendorCommand (write inputs)
          dto.py                    # application DTOs
          service_client.py         # VendorServiceClient PORT (consumed by other contexts)
        infrastructure/
          orm.py                    # SQLAlchemy VendorModel — snake_case columns
          repository_impl.py        # SqlAlchemyVendorRepository implements the PORT (incl. add/save)
          mappers.py                # ORM row <-> domain entity
        interfaces/
          rest_controller.py        # APIRouter: GET /vendors, POST /vendors, PATCH /vendors/{id}
          schemas.py                # Pydantic request+response (camelCase via CamelModel) mirroring types/index.ts
          local_service_client.py   # in-process impl of VendorServiceClient -> calls the use case
      project/    { domain/ application/ infrastructure/ interfaces/ }   # same shape
      document/   { domain/ application/ infrastructure/ interfaces/ }   # same shape
      commercial/ { domain/ application/ infrastructure/ interfaces/ }   # same shape
      quality/    { domain/ application/ infrastructure/ interfaces/ }   # same shape
      handover/   { domain/ application/ infrastructure/ interfaces/ }   # same shape
  scripts/
    seed.py                         # load exported seed JSON into Postgres (idempotent upsert on id)
    verify.py                       # server-side integrity check (mirror of scripts/verify-data.ts)
  migrations/
    001_init.sql                    # CREATE TABLE for all ~17 tables (or SQLAlchemy create_all)
```

Every other context (`project`, `document`, `commercial`, `quality`, `handover`) follows the
**identical four-layer shape** shown for `vendor`.

### Hexagonal rules (non-negotiable for this backend)

- **Ports live in `domain/repository.py` and `application/service_client.py`.** Adapters
  (`infrastructure/repository_impl.py`, `interfaces/local_service_client.py`) implement them.
  Dependencies point inward only (dependency inversion).
- **Domain layer is pure** — entities/value objects have no framework imports. ORM models
  live only in `infrastructure/orm.py`; `mappers.py` converts ORM ↔ domain entity.
- **Synchronous cross-domain calls go through service-client ports.** Write use cases are
  where this finally bites: `CreateProcurementItemUseCase` (commercial) calls
  `VendorServiceClient.exists(vendorId)` and `ProjectServiceClient.space_exists(spaceId)`
  before persisting; a future `ApproveQuoteUseCase` calls `VendorServiceClient.is_verified(...)`
  exactly as `architecture.md §4–5/§9` describes. Wire **in-process** service-client adapters
  (`local_service_client.py`) behind the port now — **swappable to a `RestVendorServiceClient`
  HTTP adapter** when the monolith is split, with zero use-case changes.
- **No context reads another context's tables.** Composition happens in `bootstrap.py`.

### Wire format keeps the frontend contract locked

- Postgres columns are **snake_case**; Pydantic response models in `interfaces/schemas.py`
  extend `CamelModel` so JSON is **camelCase** matching `types/index.ts`. Routers return with
  `response_model_by_alias=True`. **`types/index.ts` is never touched.**
- **Relation arrays stay as id arrays.** `domainIds`, `materialIds`, etc. are stored as
  Postgres `text[]` columns (`domain_ids`, ...) and returned as-is. The API does **not**
  resolve relations — `lib/relations.ts` keeps doing that at render time, unchanged.
- **Empty-id semantics preserved:** `types/index.ts` uses `""` (not null) for "unset"
  (`Drawing.spaceId`, `Decision.spaceId`, `GalleryItem.*Id`). Store `''`, never `NULL` —
  `relations.byId` already treats `""` as null.
- **Project public/portal split:** the `project` context exposes **two response models** over
  one table — `PublicProject` (omits `villaNo`/`address`/`community`) for the open build-time
  endpoint, `FullProject` for the authenticated portal endpoint. Honors constitution §5.

### Repository getter → REST endpoint map (~23 getters → 14 list endpoints)

| Getter(s) | Endpoint | Context |
|---|---|---|
| getProject | `GET /project` (public) / `GET /project/full` (auth) | project |
| getSpaces / getSpaceBySlug / getSpaceById | `GET /spaces` (+ client `.find()`) | project |
| getDomains / *BySlug / *ById | `GET /domains` (+ `.find()`) | project |
| getProgress | `GET /progress` | project |
| getDrawings / getDrawingById | `GET /drawings` (+ `.find()`) | document |
| getGallery | `GET /gallery` | document |
| getLessons / getLessonById | `GET /lessons` (+ `.find()`) | document |
| getVendors / getVendorById | `GET /vendors` (+ `.find()`) | vendor |
| getBOQs | `GET /boq` | commercial |
| getProcurement | `GET /procurement` | commercial |
| getMaterials / getMaterialById | `GET /materials` (+ `.find()`) | commercial |
| getDecisions / getDecisionById | `GET /decisions` (+ `.find()`) | quality |
| getSnags | `GET /snags` | quality |
| getWarranties | `GET /warranties` | handover |

`*ById`/`*BySlug` resolve client-side over the cached list (matches today's trivial
`.find()` getters, minimizes API surface). Quote/QuoteLineItem/BOQLineItem get tables now but
endpoints only when a future write feature needs them.

**Auth split:** public-data **GET** endpoints (spaces/domains/drawings/gallery/lessons/project)
are **open** (anonymized, needed at build with no token). Portal-sensitive GETs
(boq/procurement/decisions/snags/warranties/vendors/materials/progress/project-full) and
**all writes** require the `require_user` JWT dependency.

### Write endpoints (admin CRUD)

Every entity gets `POST /<collection>` (create) and `PATCH /<collection>/{id}` (update),
each backed by a `Create…UseCase` / `Update…UseCase` in its context's `application/` layer —
e.g. `POST /projects`, `PATCH /projects/{id}`, `POST /spaces`, `PATCH /spaces/{id}`, and the
same pair for domains, vendors, drawings, decisions, snags, boq, procurement, materials,
lessons, progress, warranties, gallery (and quotes when needed). Rules:

- **Server-generated ids** (uuid or slug-derived) returned in the response; `slug` validated
  unique for spaces/domains.
- **Request models** in `interfaces/schemas.py` (camelCase via `CamelModel`) → mapped to a
  command → domain entity. Same snake_case persistence mapping in reverse.
- **Referential validation is synchronous via service-client ports** before persist — a write
  with a bad `vendorId`/`spaceId` returns 422, never a dangling reference (preserves
  constitution rule 2). This is the first real exercise of the cross-domain sync pattern.
- **Id-array fields** (`domainIds`, etc.) accepted/updated as arrays; `""`-as-unset semantics
  preserved on single-id fields.
- **`DELETE` is out of scope** for this pass (create + edit only).

---

## Frontend: swap the data door, keep everything else

### 1. Public site → API at build time (`lib/repository.ts`)

Public pages stay a **build-time static snapshot**, but the source becomes Postgres so there
is one source of truth (constitution rules 1–2). Modify `lib/repository.ts` only:

- Add `const USE_API = process.env.DATA_SOURCE === "api"` (default **off** → `npm run dev`
  and current behavior keep working with zero env).
- Add a private `fetchJson<T>(path)` hitting `process.env.API_BASE_URL + path`, plus a
  **module-level memo** (`Map<string, Promise<unknown>>`) so one build doesn't refetch
  `getSpaces()` for every `generateStaticParams` + page.
- Each getter becomes: `if (!USE_API) return localSeed; try { return await fetchJson(path) }
  catch { if (process.env.ALLOW_SEED_FALLBACK === "1") return localSeed; throw }`.
- **Keep the `data/*` imports** as the fallback/seed-of-record — do not delete them.

Call sites, `lib/relations.ts`, `types/index.ts` untouched.

### 2. Portal → live data behind real auth (no sensitive data in the static bundle)

The static HTML is world-readable on Pages, so the portal must **not** ship real BOQ/vendor
figures at build time. Portal pages become **thin shells that fetch live, client-side, after
auth** (`*Table` components keep their exact props):

- **New `lib/supabase-client.ts`** — singleton browser Supabase client from
  `@supabase/supabase-js` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- **New `components/portal/SupabaseAuthGate.tsx`** (client) — replaces `PasswordGate` inside
  `PortalShell.tsx`. Email/password (or magic-link) sign-in form when no session; renders
  `children` when a session exists, via `supabase.auth.onAuthStateChange`. Delete
  `PasswordGate.tsx` and `NEXT_PUBLIC_PORTAL_PASSCODE`.
- **New `lib/api-client.ts`** (browser) — `apiGet<T>(path)`, **`apiPost<T>(path, body)`**,
  **`apiPatch<T>(path, body)`** all attach `Authorization: Bearer <jwt>`, read
  `NEXT_PUBLIC_API_BASE_URL`, and use the same `types/index.ts` shapes. Typed conveniences
  mirroring the portal getters + writers (`createVendor`, `updateVendor`, …).
- **Each portal page** (e.g. `app/portal/procurement/page.tsx`) shrinks to a heading +
  `<PortalClient .../>`. A thin client wrapper does the fetch, computes the `spaceNames`/
  `vendorNames` lookup maps that the Server Component computes today, and renders the
  **unchanged** `*Table` with identical props (`rows`, `spaceNames`, `vendorNames`).
  Server Component passes `rows={[]}` at build → no sensitive data in `out/`.
- `ProcurementTable`'s EUR→INR landed math is already client-side — live rows flow through
  unchanged.

### 3. Admin section — create & edit every entity

New **`/portal/admin`** area (auth-gated, same Supabase session) for CRUD:

- **`app/portal/admin/page.tsx`** — entity picker (Projects, Spaces, Domains, Vendors,
  Drawings, Decisions, Snags, BOQ, Procurement, Materials, Lessons, Progress, Warranties,
  Gallery) listing existing records with **Edit** + a **New** button.
- **`app/portal/admin/[entity]/page.tsx`** — a generic list/edit screen driven by a small
  **field-schema registry** (`lib/admin-schema.ts`) describing each entity's editable fields
  (label, type: text/number/enum/date/id-multiselect/id-select), derived from `types/index.ts`.
  One generic form component renders create + edit for all entities → no per-entity form code.
- **New `components/portal/EntityForm.tsx`** (client) — renders inputs from the field schema;
  **relation fields** (`domainIds`, `vendorId`, …) use select/multiselect populated from the
  live lists via `api-client`, so admins pick by name but store ids (constitution rule 2).
  Submits via `apiPost`/`apiPatch`, shows the 422 validation messages from the synchronous
  cross-domain checks, and refreshes the list on success.
- **New nav entry** in `PortalSidebar.tsx` → "Admin". Add an `admin` role check
  (Supabase user metadata) so only admins see write screens; read-only portal stays as-is.
- **No new entity types** — the registry is generated from the locked `types/index.ts`, so
  adding the admin UI never edits the contract.

---

## Seeding & verification

- **New `scripts/export-seed.ts`** (run via existing `tsx`; add `"export:seed"` script) —
  imports every `data/*` module and writes `api/scripts/seed.json` (camelCase, the TS shape).
  This is the only new place besides the repository fallback allowed to touch `data/*`.
- **`api/scripts/seed.py`** — idempotent upsert of `seed.json` into Postgres (camelCase →
  snake_case via mappers). Run once against Supabase.
- **`api/scripts/verify.py`** — server-side mirror of `scripts/verify-data.ts`: non-zero
  per-entity counts against known seed totals (spaces 16, domains 14, vendors 8, procurement
  6, drawings 6, gallery 8, materials 5, project 1, 3 each for the rest), every `*_id(s)`
  resolves, one relation chain walked. Gate before wiring the frontend.
- **`npm run verify:api`** (new script: `DATA_SOURCE=api ALLOW_SEED_FALLBACK=0 tsx
  scripts/verify-data.ts`) — because `verify-data.ts` runs through `repo.*`, this turns it
  into an **end-to-end cross-wire contract test**. Image-path checks still resolve against
  local `public/` (images stay in the repo, not Postgres). Make this CI-blocking — it is the
  guard against silent camelCase/snake_case drift.

---

## Deployment & secrets

- **Render Web Service**, root dir `api/`: build `pip install -r requirements.txt`, start
  `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, health check `/healthz`. Free tier
  sleeps when idle.
- **Supabase**: one project; tables via `migrations/001_init.sql`; Auth enabled; portal
  user(s) created in the dashboard.
- **Env vars.** Frontend build (GitHub Actions secrets): `DATA_SOURCE=api`, `API_BASE_URL`,
  `ALLOW_SEED_FALLBACK=1`, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon key is public by design). Backend (Render):
  `DATABASE_URL` (Supabase **pooled**, port 6543), `SUPABASE_JWT_SECRET`, `CORS_ORIGINS`
  (Pages origin + `http://localhost:3000`). Service-role key, if needed for seeding, stays
  server-side only — never `NEXT_PUBLIC_`.
- **`.github/workflows/deploy.yml`**: add the env block from secrets; add a pre-build
  pre-warm step `curl --max-time 90 --retry 5 --retry-all-errors $API_BASE_URL/healthz ||
  true` to wake Render. `ALLOW_SEED_FALLBACK=1` covers a cold-start timeout so the build
  still publishes. Published artifact stays pure static.

---

## Phased implementation order

- **Phase 0 — Backend skeleton + schema:** `api/` app, `shared/` (camel/db/auth), the six
  contexts scaffolded with all four hexagonal layers, SQLAlchemy ORM + `migrations/001_init.sql`
  for ~17 tables, `CamelModel` schemas mirroring `types/index.ts`. Create tables in Supabase.
- **Phase 1 — Seed + server verify:** `scripts/export-seed.ts` → `seed.json`; `api/scripts/
  seed.py`; `api/scripts/verify.py` passes. **Gate.**
- **Phase 2 — Read API:** GET controllers + in-process service clients wired in
  `bootstrap.py`; CORS; deploy to Render; smoke-test each endpoint returns camelCase.
- **Phase 3 — Public site → API:** modify `lib/repository.ts` (`DATA_SOURCE` switch + memo +
  fallback); `npm run verify:api` green; `DATA_SOURCE=api npm run build` enumerates all 16
  space slugs + 14 domain slugs.
- **Phase 4 — Auth + portal live data:** `lib/supabase-client.ts`, `SupabaseAuthGate`,
  `lib/api-client.ts`; `api/app/shared/auth.py` + `require_user` on portal endpoints; convert
  the 10 portal pages to thin shell + client wrapper preserving `*Table` props.
- **Phase 5 — Write API + admin CRUD:** add `Create…/Update…` use cases + commands +
  `POST/PATCH` controllers per context, with synchronous service-client referential
  validation; build `lib/admin-schema.ts`, `EntityForm`, `/portal/admin/**`, sidebar +
  role gate. Verify create→edit round-trips for Project and a relational entity (Procurement).
- **Phase 6 — CI/CD:** add Actions secrets; update `deploy.yml` (env + pre-warm); branch
  push → confirm `out/` builds with live data and falls back cleanly when the API is asleep.

---

## Key risks

1. **Sensitive data in the static bundle (highest).** Portal pages must render `rows={[]}` at
   build and fetch client-side. Audit `out/portal/**/index.html` (grep a known BOQ amount →
   must be absent) before first deploy.
2. **Render cold-start breaking CI.** `ALLOW_SEED_FALLBACK=1` + pre-warm curl are both
   required, not optional.
3. **camelCase/snake_case drift = silent contract break** (it's JSON, no compile error).
   `verify:api` is the CI-blocking guard. Watch id-array columns, `Lesson.impact` (nested),
   and the Project public/portal field split.
4. **`generateStaticParams` needs build-time data** → keep public list endpoints open; only
   portal endpoints require a JWT.
5. **Supabase pooled connection on Render** → use port 6543 with SQLAlchemy `NullPool` /
   asyncpg statement-cache disabled, or you hit prepared-statement errors.
6. **Images stay in the repo** — keep image fields as `/...` paths; `verify-data.ts` step 3
   checks `public/`.

---

## End-to-end verification

1. `python api/scripts/verify.py` → counts match seed totals, all ids resolve, master-bedroom
   relation chain resolves.
2. `npm run verify:api` (repository → live API) passes — proves the public read path + contract.
3. `DATA_SOURCE=api npm run build` succeeds; `out/spaces/<slug>/index.html` exist for all 16
   spaces and match the DB.
4. Fallback: sleep the API → `ALLOW_SEED_FALLBACK=1` build still succeeds from seed; `=0`
   build fails loudly (gate works).
5. Auth: `/portal` unauthenticated → sign-in form, no data in HTML source. Sign in → tables
   populate via client fetch with `Authorization: Bearer`.
6. Authz: protected endpoint without/with forged JWT → 401; valid Supabase token → 200.
7. CORS: portal fetch from the Pages origin succeeds; unlisted origin blocked.
8. **Admin CRUD:** as an admin, create a new Project via `/portal/admin` → it appears in the
   list and (after rebuild) on the public site; edit a field → PATCH persists. Create a
   Procurement item with a bad `vendorId` → 422 with the sync-validation message; with a valid
   one → 200 and it shows in `ProcurementTable`. Non-admin user sees no admin screens.
9. CI dry run: `deploy.yml` on a branch with pre-warm → green even on a cold Render instance.

---

## Critical files

**New backend:** `api/app/main.py`, `api/app/bootstrap.py`, `api/app/shared/{camel,db,auth}.py`,
`api/app/contexts/<ctx>/{domain,application,infrastructure,interfaces}/*` (six contexts),
`api/migrations/001_init.sql`, `api/scripts/{seed,verify}.py`.

**New frontend:** `lib/supabase-client.ts`, `lib/api-client.ts` (get/post/patch),
`lib/admin-schema.ts`, `components/portal/SupabaseAuthGate.tsx`,
`components/portal/EntityForm.tsx`, `app/portal/admin/page.tsx`,
`app/portal/admin/[entity]/page.tsx`, `scripts/export-seed.ts`, a portal client wrapper.

**Modified:** `lib/repository.ts` (DATA_SOURCE switch + fetch + fallback + memo),
`components/portal/PortalShell.tsx` (gate swap), `components/portal/PortalSidebar.tsx` (Admin nav),
the 10 `app/portal/**/page.tsx` (thin shells), `.github/workflows/deploy.yml` (env + pre-warm),
`package.json` (`export:seed`, `verify:api`).

**Unchanged (contract):** `types/index.ts`, `lib/relations.ts`, all `components/portal/*Table.tsx`,
`lib/utils.ts`, public page components, `data/*.ts` (retained as seed + fallback).

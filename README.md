# A Contemporary Zen Residence — Design & Construction Archive

A web application documenting the design and construction of a family home in Bengaluru:

- **A public, editorial case-study site** (`/`) — vision, spaces, domains, materials, build
  journey, gallery and lessons.
- **A private portal** (`/portal/**`) — a control center for the room matrix plus nine data
  tables (drawings, vendors, procurement, BOQ, decisions, progress, snags, warranties),
  gated by real Supabase Auth, with admin CRUD at `/portal/admin`.
- **An optional FastAPI backend** (`apps/api/`) — a DDD/hexagonal modular monolith over Supabase
  Postgres that can serve the same data instead of the local seed.
- **A second, API-first frontend** (`/2.0`) — the same public content rendered client-side
  from the API, with a multi-project picker.

> **Public vs. private.** The public site is intentionally **anonymized** — it never shows
> the exact villa number or address. Those live only in portal-only data fields. Genuinely
> sensitive figures (real negotiated prices, payment/contact details) belong in the database
> behind the API's authenticated endpoints, never in `data/` — the site is a static export,
> so anything in `data/` ships to every visitor. The home was designed by *Studio Anagami*.

---

## Tech stack

### Frontend

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript (strict, no `any`) |
| Styling | Tailwind CSS v4 (CSS-first theme tokens, light + dark) |
| UI helpers | shadcn-compatible config ("new-york"/stone) + `cn`, lucide-react icons |
| Icons | lucide-react |
| Fonts | Fraunces (serif headings) + Inter (sans body) via `next/font` |
| Data (default) | Typed TypeScript modules in `data/`, read through a repository layer |
| Auth client | `@supabase/supabase-js` (portal session in localStorage) |
| Build output | Static export (`output: "export"`, `trailingSlash: true`) → `out/` |
| Tooling | ESLint 9 (`eslint-config-next`), `tsx` for data scripts — no test runner |

### Backend (`apps/api/`, optional)

| Concern | Choice |
|---|---|
| Framework | FastAPI (async), Uvicorn |
| Architecture | DDD / hexagonal modular monolith, eight bounded contexts |
| Persistence | SQLAlchemy 2 (async, `asyncpg`) over Supabase Postgres |
| Validation | Pydantic v2 (`CamelModel` → camelCase responses), `pydantic-settings` for config |
| Auth | Supabase Auth JWTs (HS256), verified in `app/shared/auth.py` |
| Schema | Hand-checked SQL in `apps/api/migrations/*.sql`; `create_all()` for dev convenience |
| Local infra | Docker Compose — Postgres 15 + pgweb |

### Hosting

| Concern | Choice |
|---|---|
| Frontend | GitHub Pages (static, no Node runtime) via `.github/workflows/deploy.yml` |
| Backend | Render free tier (`apps/api/render.yaml`) |
| Database | Supabase Postgres (pooled connection, port 6543) |

---

## Getting started (frontend only — no database required)

This is the default path. Everything on the public site builds from the seed in
`apps/web/data/`. All commands below run from the **repo root** — they delegate to the
`@kr/web` workspace.

```bash
npm install
npm run dev        # → http://localhost:3000
```

For the iOS/Android app, see [`apps/mobile/README.md`](apps/mobile/README.md); it installs
separately (`npm run mobile:install`, then `npm run mobile`).

Other scripts:

```bash
npm run verify      # data integrity check — RUN THIS after editing anything in data/
npm run typecheck   # tsc --noEmit (strict; must pass clean)
npm run lint        # eslint
npm run build       # static export to out/ (pre-renders every space/domain page)
npm run verify:api  # same integrity check against a live API, no seed fallback
npm run export:seed # dump the TS seed to JSON for the Python seed loader
```

There is **no test runner**. `npm run verify` (`scripts/verify-data.ts`, via tsx) is the
data-layer safety net: it checks entity counts, that every `*Id(s)` reference resolves, that
image paths exist under `public/`, and walks one full relation chain. It exits non-zero on
failure — treat it as the equivalent of a unit-test pass for any `data/` change.

### Environment variables

Copy `.env.example` → `.env.local`. With **none** of these set, the site builds from the
local seed (the normal case).

| Variable | Purpose |
|---|---|
| `DATA_SOURCE` | Set to `api` to source public pages from the API at build time |
| `API_BASE_URL` | Build-time API base (default `http://localhost:8099`) |
| `ALLOW_SEED_FALLBACK` | `1` = fall back to the seed if the API is unreachable at build |
| `NEXT_PUBLIC_API_BASE_URL` | Runtime API base for the portal and `/2.0` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (portal login) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (portal login) |

The portal fetches its data client-side through `lib/api-client.ts`, so no portal data is
baked into the static bundle; without a running API and Supabase credentials the portal
routes render but stay empty.

---

## Running the full stack locally

### 1. Postgres

```bash
docker compose up -d db   # Postgres 15 on :5432, applies migrations/001_init.sql on first init
                          # pgweb table browser on http://localhost:8081
```

This is plain Postgres, not Supabase — the backend only needs Postgres plus a JWT secret.
Run with `AUTH_DISABLED=true` locally and no Supabase services are required at all.

### 2. API

```bash
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

export DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"
export AUTH_DISABLED=true
export PYTHONPATH="$(pwd)"

# Create tables in dev (prod applies migrations/*.sql instead)
python -c "import asyncio; from app.bootstrap import create_all; asyncio.run(create_all())"

# Export the seed from the TS modules (from the repo root), then load it
(cd .. && npm run export:seed)
python scripts/seed.py

python scripts/verify.py                      # server-side integrity check
uvicorn app.main:app --reload --port 8099     # OpenAPI docs at /docs
```

API settings (`apps/api/app/config.py`, 12-factor via env): `DATABASE_URL`,
`SUPABASE_JWT_SECRET`, `SUPABASE_JWT_AUDIENCE`, `CORS_ORIGINS`, `AUTH_DISABLED`.

### 3. Frontend against the API

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8099
DATA_SOURCE=api            # optional: also build the 1.0 public pages from the API
```

Then `npm run dev`, and visit `/2.0` for the API-first frontend.

See `apps/api/README.md` for the bounded-context map, the ports/adapters rules and the auth
matrix; `docs/migration-plan.md` covers the seed → database transition.

---

## Architecture

```
              data/*.ts                 lib/repository.ts            app/**/page.tsx
        (typed seed modules)   ──▶   (async getters — the ONLY  ──▶  (Server Components
         spaces, domains,             data entry point)               render the data)
         vendors, …, gallery                 │
                                             ▼
                                     lib/relations.ts
                              (resolve *Ids → full records at render
                               time, e.g. a space's vendorIds → Vendors)
```

**Non-negotiable rules** (from `.specify/memory/constitution.md` — the constitution wins
over any plan):

1. **The repository is the only data door.** Pages/components import from `lib/repository`
   (all getters async), never from `data/` directly.
2. **Relations are by ID, never by display name.** Every cross-reference is an
   `*Ids: string[]` / `*Id: string` field resolved via `lib/relations`. A rename must never
   sever a link. Resolvers are pure and synchronous.
3. **Only render a link if its public page exists.** Spaces/domains/lessons/gallery have
   public pages → clickable. Vendors/drawings/decisions are portal-domain → read-only chips.
   This is why no public link 404s.
4. **`types/index.ts` is the contract.** Schema changes are their own reviewed feature.
5. **Every entity belongs to exactly one project.** All 13 entity types carry a required
   `projectId` (FK to `projects`, `ON DELETE CASCADE`; see
   `apps/api/migrations/002_project_scope.sql`). Collection GETs accept `?projectId=` — omitting
   it returns every project's rows, so a caller that renders one project must always pass
   it. 1.0 pins `projects[0]`, the portal pins `PORTAL_PROJECT_ID`, and 2.0 passes
   `useProject().selectedId`. Slugs are unique **per project**, not globally.
6. **The public side stays anonymized.** Public copy uses "A Contemporary Zen Residence in
   Bengaluru".

### Component model

Server Components by default. Any view with sort/filter/search state is a Client Component
receiving already-loaded, plain-serializable data as **props** — fetching stays in the
server/repository layer. Examples: `MaterialsLibrary`, `GalleryGrid`, and the portal
`*Table` components. `app/2.0/**` is the exception: those pages are `"use client"` and fetch
at runtime from `lib/api-v2.ts`, so 2.0 shows nothing without a running API. Shared
components in `components/` stay project-agnostic and prop-driven so both trees can use them.

---

## Project structure — a monorepo

Four deliverables and two shared packages in one repo:

```
apps/
  web/         # Next.js: public site + portal/admin web interface (static export)
  api/         # FastAPI backend
  mobile/      # Expo: the iOS + Android content viewer
packages/
  contracts/   # entity interfaces — one copy compiled by every surface
  api-client/  # transport + endpoint list, platform-agnostic
```

Inside `apps/web`:

```
app/                     # routes (App Router)
  page.tsx               #   /            portfolio index (project picker)
  [projectId]/           #   /<project>   the API-first public site
  1.0/                   #   /1.0         the original single-project site
  portal/ admin/         #   Supabase-gated control center + admin CRUD
  login/ signup/         #   auth pages, outside the gate they unlock
  layout.tsx             #   header + footer + fonts + no-flash theme script
  globals.css            #   theme tokens (light + dark palettes, fonts)

components/              # shared presentational components + portal/, admin/ tables
types/index.ts           # the named data contract — re-exports @kr/contracts
lib/
  repository.ts          # async getX() per entity (the 1.0 data entry point)
  relations.ts           # byIds / byId resolvers
  api-client.ts          # portal runtime client (authed)
  api-v2.ts              # web binding for @kr/api-client
  supabase-client.ts     # Supabase Auth session
  admin-schema.ts        # field schemas driving the admin EntityForm
  utils.ts               # cn, formatINR, landedFromEUR
data/                    # typed seed modules (real project data)
scripts/verify-data.ts   # data + relations integrity check
public/images/           # elevation/ (exterior) + spaces/ (interior)
```

Root-level `docs/ specs/ .specify/` hold the design docs, Spec Kit specs and the
constitution.

### Workspaces

`apps/web` and `packages/*` are npm workspaces, so root scripts delegate to them
(`npm run dev` → `--workspace @kr/web`) and one `npm install` covers all three.

**`apps/mobile` is deliberately not a workspace member.** React Native needs React 18 and
Next needs React 19; as a member, npm split Expo across two `node_modules` trees and Metro
could not bundle at all. It installs on its own (`npm run mobile:install`) and consumes
the shared packages via `file:` deps. Details in `apps/mobile/README.md`.

---

## The data model

The **frontend contract** lives in `types/index.ts` and is seeded in `data/`:

`Project`, `Space`, `Domain`, `Drawing`, `Vendor`, `ProcurementItem`, `Decision`, `Snag`,
`BOQ`, `Material`, `Lesson`, `ProgressEntry`, `Warranty`, `GalleryItem` — plus
`data/renderings.ts` and `data/drawingSheets.ts`. `Project` is the tenant root; every other
entity carries a `projectId`.

The seed is multi-project: `data/project.ts` exports `projects: Project[]`. `getProject()`
returns `projects[0]` (the 1.0 singleton); `getProjects()` returns all.

### Database model

The API's Postgres schema (SQLAlchemy models in `apps/api/app/contexts/*/infrastructure/orm.py`,
DDL in `apps/api/migrations/`) is a superset of the frontend contract — it also carries the
commercial/quality workflow tables the public site never renders. Tables are owned by
exactly one bounded context, and **no context reads another's tables**; cross-context
access goes through service-client ports.

| Context | Tables |
|---|---|
| `project` | `projects`, `spaces`, `domains`, `progress_entries` |
| `document` | `drawings`, `gallery_items`, `lessons` |
| `vendor` | `vendors` |
| `commercial` | `boqs`, `boq_line_items`, `quotes`, `quote_line_items`, `purchase_orders`, `deliveries`, `procurement_items`, `materials` |
| `quality` | `snags`, `inspections`, `decisions` |
| `handover` | `warranties` |
| `notification` | `notifications` |
| `media` | `media_sets` |

Column naming is snake_case in Postgres; Pydantic response models emit camelCase so
`types/index.ts` is untouched.

#### Tenancy

`projects` is the tenant root and carries no `project_id`. **Every other table** has a
`project_id VARCHAR NOT NULL REFERENCES projects(id) ON DELETE CASCADE`, plus a supporting
`ix_<table>_project_id` index — every list query is `WHERE project_id = $1`. This is applied
by `002_project_scope.sql`, which backfills pre-existing rows to `proj-kr` (the original
single project) and refuses to run if that row is missing.

The same migration also swaps the **global** unique constraint on `spaces.slug` and
`domains.slug` for a composite `(project_id, slug)` — two projects may each legitimately
have a `living-room`.

#### How relations are stored

Two different mechanisms, deliberately:

- **Tenancy and media ownership are real foreign keys.** `project_id` cascades on delete;
  `media_sets.domain_id` / `media_sets.space_id` are nullable FKs with `ON DELETE SET NULL`,
  so losing the owner demotes the imagery to project-level rather than destroying it.
- **Everything else is ID arrays** — `spaces.domain_ids`, `material_ids`, `vendor_ids`,
  `drawing_ids`, `decision_ids`, `lesson_ids`, and so on, as Postgres `VARCHAR[]`. These are
  **not** FK-enforced at the database level; they mirror the seed's `*Ids` shape and are
  resolved at render time by `lib/relations.ts`. Referential integrity for them is checked
  by `npm run verify` / `apps/api/scripts/verify.py`, not by Postgres. Writes that cross a
  context boundary (e.g. a `vendorId` on a commercial row) are validated in the application
  layer through the service-client ports.

```
projects ──┬── spaces ──────┐
           ├── domains ─────┤   *_ids VARCHAR[] arrays cross-reference
           ├── drawings ────┤   these tables; resolved in the app layer,
           ├── vendors ─────┤   not by FK constraints
           ├── materials ───┘
           ├── boqs ── boq_line_items
           ├── quotes ── quote_line_items ── purchase_orders ── deliveries
           ├── procurement_items,  snags ── inspections,  decisions
           ├── lessons, gallery_items, progress_entries, warranties, notifications
           └── media_sets  (FK → domains / spaces, ON DELETE SET NULL)

every table above: project_id NOT NULL → projects.id, ON DELETE CASCADE
```

#### Migrations

Applied in order against a fresh database; each is idempotent.

| File | What it does |
|---|---|
| `001_init.sql` | Base DDL for all core tables (generated from the ORM metadata) |
| `002_project_scope.sql` | Adds/backfills/constrains `project_id` everywhere; per-project slug uniqueness |
| `003_media_sets.sql` | The `media_sets` table for the media context |

In dev you can skip them and use `create_all()` (see the setup above); production applies
the SQL files, then runs the seed loader.

---

## Theming (light + dark)

Every surface is painted from semantic CSS variables — `--background`, `--foreground`,
`--card`, `--muted`, `--accent`, … — defined once in `app/globals.css` and exposed to
Tailwind v4 via `@theme inline`. Components use only the resulting token utilities
(`bg-background`, `text-muted-foreground`, …), **never hardcoded hex**. Dark mode is a pure
palette swap: the `.dark` block re-declares the same variables, and the whole UI flips with
no component changes.

- **Toggle** — `components/ThemeToggle.tsx` adds/removes `dark` on `<html>` and remembers
  the choice in `localStorage`.
- **No flash** — an inline script in `layout.tsx` re-applies the saved choice before paint.
- **Adding colors** — define the token in both `:root` and `.dark`, map it under
  `@theme inline`, then use its utility.

---

## Updating content

With the default seed setup, a content update is an edit to the matching `data/*.ts` module
followed by `npm run verify` and a redeploy:

- Add a room → add a row to `data/spaces.ts` and reference real images under `public/images/`.
- Update procurement/snags/progress → edit the matching module.

With the backend running, the same content is editable through `/portal/admin` (admin-only
CRUD wired to the write API).

---

## Deployment

- **Frontend** — static export (`output: "export"`, `trailingSlash: true`, unoptimized
  images) to `out/`. Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs
  `npm run build` and publishes `out/` to GitHub Pages. There is **no Node runtime in
  production**.
- **API** — Render free tier via `apps/api/render.yaml`: build `pip install -r requirements.txt`,
  start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, health check `/healthz`. Set
  `DATABASE_URL` (Supabase **pooled**, port 6543), `SUPABASE_JWT_SECRET`, `CORS_ORIGINS`.
  Apply `migrations/*.sql` once, then run the seed loader.

---

## Conventions

- TypeScript strict, no `any`; `tsc --noEmit` must pass clean.
- Conventional Commits. Always branch before starting work.
- `@/*` path alias maps to the repo root.
- `artifacts/` holds original source design assets (PDFs/renders) — local only, gitignored,
  not web-served. Don't import from it at runtime.

## Images

Exterior renders live in `public/images/elevation/`; interior renders were extracted from
the design PDFs in `artifacts/` into `public/images/spaces/`. One note: `bathroom.jpg` is a
dressing-room stand-in — there is no dedicated bathroom render in the source material yet.

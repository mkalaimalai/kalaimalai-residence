# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout — this is a monorepo

```
apps/web/      # Next.js 16: public site + portal/admin. Was the repo root until the split.
apps/api/      # FastAPI backend (was ./api)
apps/mobile/   # Expo: the iOS + Android content viewer
packages/contracts/    # entity interfaces — the contract, compiled by every surface
packages/api-client/   # transport + endpoint list, platform-agnostic
```

`apps/web` + `packages/*` are npm workspaces; **root scripts delegate to `@kr/web`**, so
`npm run dev|build|verify|typecheck` still work unchanged from the repo root. Paths in
the rest of this file are relative to `apps/web` unless stated otherwise.

**`apps/mobile` is NOT a workspace member** — React Native needs React 18, Next needs
React 19, and as a member npm split Expo across two `node_modules` trees so Metro could
not bundle. It installs on its own (`npm run mobile:install`) and depends on the shared
packages via `file:`. Do not "fix" this by adding it to `workspaces`.

`packages/contracts` holds the entity definitions; `apps/web/types/index.ts` is now a
re-export shim over it, so it remains the named contract and every `@/types` import is
unchanged.

## What this is

A two-part Next.js 16 (App Router) site documenting a family home in Bengaluru:

- **Public editorial site** (`/`, `/vision`, `/spaces`, `/domains`, `/materials`,
  `/journey`, `/gallery`, `/lessons`) — anonymized case study.
- **Private portal** (`/portal/**`) — control center: room matrix + 9 data tables
  (drawings, vendors, procurement, BOQ, decisions, progress, snags, warranties).

By default there is **no database**: all content is typed seed data in `data/*.ts`, read
through an async repository layer (`lib/repository.ts`).

An **optional backend** now exists in `apps/api/` — a DDD/hexagonal FastAPI modular monolith over
Supabase Postgres (see `apps/api/README.md` and `docs/migration-plan.md`). It is **opt-in**:

- Public pages still build from the seed unless `DATA_SOURCE=api` is set, in which case
  `lib/repository.ts` fetches from the API at build time (with seed fallback when
  `ALLOW_SEED_FALLBACK=1`). The repository remains the only data door; `types/index.ts` is
  unchanged (the API returns the same camelCase shapes).
- The portal uses **real Supabase Auth** (`components/portal/SupabaseAuthGate.tsx`, replacing
  the old PasswordGate) and fetches live data client-side via `lib/api-client.ts`, so no
  portal data is baked into the static bundle. Admins get CRUD at `/portal/admin`
  (`lib/admin-schema.ts` + `components/portal/EntityForm.tsx`), wired to the write API.

### Admin screens

Record management lives in a **standalone admin app at `/admin`** (`app/admin/**` +
`components/admin/**`). `/portal/admin` is now only a client-side redirect to it — the
portal keeps its read-oriented dashboards.

The admin app has **two-level navigation**: `lib/admin-nav.ts` declares sections (the
icon rail — Catalog, Delivery, Commercial, Media) and the items inside each (the second
panel, grouped by heading). Every item is a real route, `/admin/<section>/<item>`, so the
URL is the state and each page is prerendered — `ADMIN_ROUTES` feeds
`generateStaticParams`, which `output: "export"` requires. Adding an entity to the nav is
an edit to `admin-nav.ts`; adding a *field* is still just `lib/admin-schema.ts`.

`AdminItemView` dispatches each item: registry-driven entities render through
`EntityAdmin` (keyed by entity so switching remounts and no open form leaks across
pages), while two items are **purpose-built**, because the flat registry cannot express a
nested aggregate:

- **Quotes** (`components/portal/admin/QuotesAdmin.tsx`) — a quote header plus its line
  items, plus the approve / negotiate / reject workflow actions.
- **Renderings & Sheets** (`components/portal/admin/MediaAdmin.tsx`) — `media_sets` rows
  attached to the project, a domain, or a space.

The admin's role comes from **`app_metadata.role == "admin"`** (`apps/api/app/shared/auth.py`).
It is deliberately *not* `user_metadata`, which the user can write themselves with only
the public anon key — trusting that would let any account self-promote.

Which project the portal administers is **selectable**:
`components/portal/PortalProjectProvider.tsx` owns the choice (persisted under
`portal_selected_project`), and `lib/api-client.ts` reads it in `scopedPath()` /
`withProject()`. `Project` is the tenant root, so creates against `/projects` must opt out
of the stamp: `withProject(payload, { scoped: false })`.

**File uploads** go to Google Drive, not the repo: `POST /uploads` (returns URLs) and
`POST /media-sets/{id}/files` (appends them to that set's `images`), both admin-only,
multipart, several files per request, images/PDFs only, 25 MB each. `app/shared/drive.py`
holds the client. A service account has **no Drive storage of its own**, so
`GOOGLE_DRIVE_FOLDER_ID` must name a folder owned by a real account and shared with the
service account as Editor — without it the endpoints return `501`. `GOOGLE_DRIVE_PUBLIC`
grants `anyone: reader` so the site can render the file; it is off by default because
turning it on publishes every upload to anyone with the link.

`media_sets` (`apps/api/app/contexts/media`, `apps/api/migrations/003_media_sets.sql`) mirrors the
`RenderingSet` shape in `data/renderings.ts` — title/width/height/images/subsections — so
the same `RenderingGallery` can render DB rows.

**Both trees now show the same media, by different routes.** 1.0 pages import
`renderingsByDomain` / `drawingSheetsByDomain` / `drawingSheetsBySpace` at build time;
2.0 pages fetch `GET /media-sets?projectId=&domainId=` (or `&spaceId=`) at runtime and
narrow the rows through `lib/media.ts` (`splitByKind`) into the same `DomainMediaTabs` /
`SpaceMediaTabs`. Domains own renderings *and* drawing sheets; spaces own drawing sheets
only, and their "Renderings" tab is the space's gallery items — the same split as 1.0.
`data/renderings.ts` and
`data/drawingSheets.ts` stay the **source of record** — `npm run export:seed` flattens
their slug-keyed maps into `mediaSets` rows (ids derived from kind + owner slug + index,
so re-seeding upserts rather than duplicates) and `apps/api/scripts/seed.py` loads them.

One consequence worth knowing: `GET /media-sets` is behind `require_user`, so the tabs
only populate for a signed-in visitor. That is consistent — the whole 2.0 tree is gated —
but an anonymous fetch returns 401, and both detail components deliberately swallow that
into "no tabs" rather than blanking the page.

## Commands

```bash
npm run dev        # dev server → http://localhost:3000
npm run verify     # data integrity check — RUN THIS after editing anything in data/
npm run typecheck  # tsc --noEmit (strict; must pass clean)
npm run lint       # eslint
npm run build      # static export to out/ (statically generates every space/domain page)
npm run verify:api # same check against a live API (DATA_SOURCE=api, no seed fallback)
npm run export:seed # dump the TS seed to JSON for the Python seed loader
```

Backend (optional, `apps/api/` — see `apps/api/README.md` for the full flow):

```bash
cd apps/api && source .venv/bin/activate
export DATABASE_URL=... AUTH_DISABLED=true PYTHONPATH="$(pwd)"
python scripts/seed.py      # load the JSON exported by `npm run export:seed`
python scripts/verify.py    # backend equivalent of npm run verify
uvicorn app.main:app --reload --port 8099   # docs at /docs
```

There is **no test runner**. `npm run verify` (`scripts/verify-data.ts`, run via tsx) is
the data-layer safety net: it checks entity counts, that every `*Id(s)` reference resolves,
that image paths exist under `public/`, and walks one full relation chain. It exits non-zero
on failure, so treat it as the equivalent of a unit-test pass for any `data/` change.

## Non-negotiable architecture rules

These come from `.specify/memory/constitution.md` — the constitution wins over any plan.

1. **The repository is the only data door.** Pages/components import from `lib/repository`
   (all getters async), **never** from `data/` directly.
2. **Relations are by ID, never by display name.** Every cross-reference is an
   `*Ids: string[]` / `*Id: string` field on the entity, resolved to full records at render
   time via `lib/relations` (`byIds`/`byId` + typed conveniences). A rename must never sever
   a link. Resolvers are pure/synchronous and receive the already-loaded source array.
3. **Only render a link if its public page exists.** Spaces/domains/lessons/gallery have
   public pages → clickable. Vendors/drawings/decisions are portal-domain → read-only chips.
   This is why no public link 404s.
4. **The data model in `types/index.ts` is the contract.** It's locked — schema changes are
   their own reviewed feature, not a drive-by edit.
5. **Every entity belongs to exactly one project.** All 13 entity types carry a required
   `projectId` (`project_id`, FK to `projects` with `ON DELETE CASCADE` — see
   `apps/api/migrations/002_project_scope.sql`); `Project` itself is the tenant root and has
   none. Collection GETs accept `?projectId=`; omitting it returns every project's rows,
   so **a caller that renders one project must always pass it**. The three surfaces
   differ: 1.0 pins `projects[0]` in `lib/repository.ts`, the portal pins
   `PORTAL_PROJECT_ID` in `lib/api-client.ts`, and 2.0 passes `useProject().selectedId`.
   Slugs are unique **per project**, not globally.
6. **Public side stays anonymized.** Exact villa number/address live only in portal-only
   fields (e.g. in `data/project.ts`). Public copy uses "A Contemporary Zen Residence in
   Bengaluru". Genuinely sensitive figures (real negotiated prices, payment/contact details)
   stay **out of `data/` entirely** until real auth exists — see the portal-security note below.

## Data flow

```
data/*.ts            lib/repository.ts          app/**/page.tsx
(typed seed   ──▶    (async getX() — the   ──▶  (Server Components
 modules)            only data entry point)      render the data)
                            │
                            ▼
                     lib/relations.ts
              (resolve *Ids → full records at render time)
```

Entities (`types/index.ts`): `Project`, `Space`, `Domain`, `Drawing`, `Vendor`,
`ProcurementItem`, `Decision`, `Snag`, `BOQ`, `Material`, `Lesson`, `ProgressEntry`,
`Warranty`, `GalleryItem` — plus `data/renderings.ts` and `data/drawingSheets.ts`.

**Adding/editing content** is an edit to the matching `data/*.ts` module followed by
`npm run verify`. Reference real images under `public/images/` (exterior in `elevation/`,
interior in `spaces/`).

## Two frontends: `/` (2.0) and `/1.0`

The **2.0 tree is the site root**: `/` is the multi-project portfolio index and
`/[projectId]/**` is one project's public site. The original single-project site was moved
wholesale under **`app/1.0/**`** (`/1.0`, `/1.0/vision`, `/1.0/spaces/[slug]`, …); nothing
public lives at the bare `/vision`, `/spaces`, … paths any more. `/portal/**` is unchanged.

Differences that matter before editing either:

- 1.0 pages are Server Components reading `lib/repository.ts` (seed by default). 2.0 pages
  are `"use client"` and fetch at runtime from `lib/api-v2.ts` (`NEXT_PUBLIC_API_URL`,
  default `http://localhost:8099`) — so 2.0 shows nothing without a running API.
- 2.0 is **multi-project**, and the project comes from the **URL**, not from storage:
  `app/[projectId]/layout.tsx` prerenders one path per seed project and
  `V2ProjectChrome` exposes it as `useProject().selectedId`. 1.0 is single-project.
- Both share `types/index.ts` and the presentational components in `components/`. Keep
  those components project-agnostic and prop-driven so both trees can use them — cards
  that link take a `basePath` prop (`"/1.0"` vs. `` `/${selectedId}` ``) rather than
  hardcoding a route.
- `SiteHeader` / `SiteFooter` are 1.0-and-portal chrome only; they return `null` elsewhere.
  `PUBLIC_NAV` in `lib/nav.ts` therefore points at `/1.0/*`.

### 2.0 is signed-in; 1.0 is public

The 2.0 tree lives in the **`app/(v2)/` route group** — a grouping only, so `/` and
`/[projectId]/**` keep their URLs while sharing `app/(v2)/layout.tsx`, which wraps them in
`components/v2/V2AuthGate.tsx`. `/1.0/**` stays public. `/portal/**` sits outside the group
and keeps its own `SupabaseAuthGate`. `/login` and `/signup` are top-level so they are not
gated by the thing they unlock.

**Identity is Supabase Auth. There is no second user store and no password in our API.**
`lib/auth-v2.ts` wraps `supabase.auth.signUp` / `signInWithPassword`; the browser talks to
Supabase directly, and this API only ever *verifies* the resulting JWT. The `identity`
context (`apps/api/app/contexts/identity`, `apps/api/migrations/004_user_profiles.sql`) adds a
`user_profiles` row keyed by the token's `sub` — display name, email, role mirror, signup
date. `POST /me` is idempotent and is called after every sign-in, which is what backfills
accounts that predate the table.

Three things about it that are load-bearing:

- **`user_profiles.role` is a mirror, never the authorization source.** `require_admin`
  reads `app_metadata.role` off the verified token, which only the service_role key can
  write. `PATCH /me` accepts `displayName` and nothing else — if it took `role`, editing
  your profile would be self-promotion. Promoting someone is a Supabase-dashboard /
  service-key act; `GET /users` is deliberately read-only.
- **`user_profiles` has RLS enabled with no policies.** Supabase publishes every `public`
  table through PostgREST, reachable with the anon key that ships in the browser bundle —
  without this, the user list is world-readable and world-insertable straight past this
  API. The API connects as `postgres`, which bypasses RLS, so `/me` and `/users` are
  unaffected. **The other tables do not have this yet** and remain exposed the same way.
- **`V2AuthGate` is UX, not the boundary.** The site is a static export with no server, so
  there is no middleware and the page markup is a public file on a CDN. The gate decides
  what a browser renders; the API's `require_user` decides what anyone can reach. Anything
  sensitive must come from a gated endpoint at runtime, never be baked into the bundle.

New signups get `viewer`: read access to every project, no writes. There is no per-user
project membership yet — see the tenancy note in `docs/technical-review.md`.

The seed is likewise now multi-project: `data/project.ts` exports `projects: Project[]`.
`getProject()` returns `projects[0]` (the 1.0 singleton); `getProjects()` returns all.

## Component model

Server Components by default. Any view with sort/filter/search state is a Client Component
(`"use client"`) that receives already-loaded, plain-serializable data as **props** — data
fetching stays in the server/repository layer. Examples: `MaterialsLibrary`,
`GalleryGrid`, and the portal `*Table` components in `components/portal/`.

## Styling

Tailwind CSS v4, CSS-first. Theme tokens (palette + fonts, light + dark) live in
`app/globals.css`. **Never hardcode hex in components** — use the tokens. Fonts: Fraunces
(serif headings) + Inter (sans body) via `next/font`. Class merge helper is `cn` from
`lib/utils`; shadcn config is "new-york" / stone. `lib/utils` also has `formatINR` and
`landedFromEUR` (EUR ex-works → estimated landed INR).

## Portal security model — important

The portal now gates on **real Supabase Auth** (`components/portal/SupabaseAuthGate.tsx`;
session in localStorage via `lib/supabase-client.ts`), and portal data is fetched
client-side through `lib/api-client.ts` rather than baked into the bundle. The old
obscurity-only `PasswordGate` / `NEXT_PUBLIC_PORTAL_PASSCODE` are **gone** — ignore any
lingering references in `docs/`.

The constraint that survives: the site is a **static export with no server**, so anything
placed in `data/*.ts` ships to every visitor. Genuinely sensitive figures (real negotiated
prices, payment/contact details) belong in the database behind the API's `require_user` /
`require_admin` endpoints, never in `data/`.

## Deployment

Static export (`output: "export"`, `trailingSlash: true`, unoptimized images) → `out/`.
Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs `npm run build` and
publishes `out/` to GitHub Pages. There is no Node runtime in production.

## Conventions

- TypeScript strict, **no `any`**; `tsc --noEmit` must pass clean.
- Conventional Commits. Always branch before starting work.
- `@/*` path alias maps to the repo root.
- `artifacts/` holds original source design assets (PDFs/renders) — local only, gitignored,
  not web-served. Don't import from it at runtime.

## Specs & history

Detailed specs are in `specs/` (GitHub Spec Kit format); locked rules in
`.specify/memory/constitution.md`. The project shipped in three sequenced sessions —
A (Foundation), B (Public site), C (Portal) — all now complete. `README.md` has the long-form
narrative (note: it predates Session C completion and lists Vercel as the deploy target;
the actual target is GitHub Pages per `next.config.ts` + the deploy workflow).

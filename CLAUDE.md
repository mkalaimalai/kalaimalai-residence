# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A two-part Next.js 16 (App Router) site documenting a family home in Bengaluru:

- **Public editorial site** (`/`, `/vision`, `/spaces`, `/domains`, `/materials`,
  `/journey`, `/gallery`, `/lessons`) — anonymized case study.
- **Private portal** (`/portal/**`) — control center: room matrix + 9 data tables
  (drawings, vendors, procurement, BOQ, decisions, progress, snags, warranties).

By default there is **no database**: all content is typed seed data in `data/*.ts`, read
through an async repository layer (`lib/repository.ts`).

An **optional backend** now exists in `api/` — a DDD/hexagonal FastAPI modular monolith over
Supabase Postgres (see `api/README.md` and `docs/migration-plan.md`). It is **opt-in**:

- Public pages still build from the seed unless `DATA_SOURCE=api` is set, in which case
  `lib/repository.ts` fetches from the API at build time (with seed fallback when
  `ALLOW_SEED_FALLBACK=1`). The repository remains the only data door; `types/index.ts` is
  unchanged (the API returns the same camelCase shapes).
- The portal uses **real Supabase Auth** (`components/portal/SupabaseAuthGate.tsx`, replacing
  the old PasswordGate) and fetches live data client-side via `lib/api-client.ts`, so no
  portal data is baked into the static bundle. Admins get CRUD at `/portal/admin`
  (`lib/admin-schema.ts` + `components/portal/EntityForm.tsx`), wired to the write API.

## Commands

```bash
npm run dev        # dev server → http://localhost:3000
npm run verify     # data integrity check — RUN THIS after editing anything in data/
npm run typecheck  # tsc --noEmit (strict; must pass clean)
npm run lint       # eslint
npm run build      # static export to out/ (statically generates every space/domain page)
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
5. **Public side stays anonymized.** Exact villa number/address live only in portal-only
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

The portal gate (`components/portal/PasswordGate.tsx`) is **obscurity, not security**. The
site is a static export on GitHub Pages — no server — so the passcode check runs in the
browser and **all seed data ships in the bundle**. Passcode defaults to `"anagami"`,
overridable at build via `NEXT_PUBLIC_PORTAL_PASSCODE`. Consequence: do not put anything
genuinely sensitive into `data/`, ever, under the current setup.

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

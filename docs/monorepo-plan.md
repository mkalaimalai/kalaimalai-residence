# Monorepo migration

Target layout — one repo, five deliverables (web, api, admin, iOS, Android):

```
apps/
  web/         # Next.js public site (1.0 + the project tree) — currently the repo root
  admin/       # admin + portal web interface — currently /admin and /portal inside web
  mobile/      # Expo: iOS + Android content viewer            ✅ done
  api/         # FastAPI backend                                — currently ./api
packages/
  contracts/   # entity interfaces, one copy for every surface  ✅ done
  api-client/  # transport + endpoint list, platform-agnostic   ✅ done
```

## Stage 1 — shareable core ✅

Done in `adbdf4a`. npm workspaces, `@kr/contracts`, `@kr/api-client`, and the Expo app.
Nothing moved yet: the web app still lives at the repo root and still compiles against
`@/types`, which is now a re-export shim over `@kr/contracts`.

**Why this order.** Extracting the shared core first means the later moves are pure
`git mv` with no logic changes — and the mobile app already proves the extraction works,
because it consumes both packages and typechecks against them.

## Stage 2 — move the web app to `apps/web`

Blocked on a quiet working tree: `app/`, `components/`, `lib/` and `api/` all had
uncommitted edits from parallel work when stage 1 landed, and `git mv` across those would
have collided.

```bash
mkdir -p apps/web
git mv app components lib data public scripts types \
       next.config.ts postcss.config.mjs eslint.config.mjs components.json \
       next-env.d.ts tsconfig.json apps/web/
```

Then, in order:

1. **`apps/web/package.json`** — move the Next/React/Tailwind deps out of the root
   manifest into it; the root keeps only `workspaces` + orchestration scripts.
2. **`apps/web/tsconfig.json`** — `@/*` still maps to the app root (now `apps/web`); the
   `@kr/*` paths become `../../packages/*/src/index.ts`.
3. **`.github/workflows/deploy.yml`** — the build step needs
   `working-directory: apps/web`, and `upload-pages-artifact` needs `path: apps/web/out`.
   Both remotes (`origin` and `pages`) run their own copy of this workflow, so both must
   be updated or the apex site silently keeps deploying the old path.
4. **Root scripts** — `dev`/`build`/`verify` become `npm run <x> --workspace @kr/web`.
5. `npm run verify` and a full `npm run build` before pushing: the data-integrity check
   walks `public/images/**`, so a wrong path shows up there first.

## Stage 3 — split the admin app out of web

`/admin/**` and `/portal/**` currently live inside the web app and ship in the same
static export. Splitting them into `apps/admin` gives the two different things they need:

- The public site is a **static export with no server**, so it must stay that way.
- Admin is behind auth and talks to the API at runtime, so it can be a normal Next app —
  and keeping it out of the public bundle means admin route code stops being downloadable
  by every visitor.

Move `app/admin`, `app/portal`, `components/portal`, `components/admin`, `lib/admin-*`
and `lib/api-client.ts` into `apps/admin`, sharing `@kr/contracts` + `@kr/api-client`.
The presentational components in `components/` that both trees use (`DataTable`, `Chip`,
`StatusBadge`, …) move to a new `packages/ui` at that point — not before, since they are
still React-DOM only and the mobile app cannot use them.

## Stage 4 — move the API to `apps/api`

`git mv api apps/api`, then update:

- `docker-compose.yml` — the init-SQL mount path (`./api/migrations/001_init.sql`).
- `api/render.yaml` → `apps/api/render.yaml`, plus **the Render dashboard's root
  directory**, which is configured outside the repo and will not follow the move.
- `CLAUDE.md`, `README.md`, `docs/migration-plan.md` — every `cd api` in the docs.

Deferred deliberately: the Python side has no workspace tooling to gain from the move, so
it is the lowest-value/highest-blast-radius step. Do it last, on its own commit.

## Invariants that must survive every stage

- **The repository is still the only data door** for the 1.0 tree — moving files does not
  change rule 1 of the constitution.
- **`types/index.ts` stays the named contract**; it just re-exports `@kr/contracts` now.
- **Every collection fetch keeps its `projectId`.** The shared client makes it an
  optional argument, so a dropped scope fails silently by returning every project's rows.
- **No portal-only field reaches a public surface.** The mobile app uses
  `/projects/public` for exactly this reason.

## Note on `apps/mobile` and workspaces

The mobile app is intentionally **not** an npm workspace member. React Native needs React
18 and Next needs React 19, so npm splits Expo across two `node_modules` trees and Metro
cannot bundle. It installs separately and consumes `@kr/contracts` / `@kr/api-client` via
`file:` deps — see `apps/mobile/README.md`. Stage 2 does not change this: moving the web
app to `apps/web` leaves the mobile app exactly where it is.

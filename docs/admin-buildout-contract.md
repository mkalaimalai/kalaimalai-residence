# Admin buildout — shared contract

Working agreement for the parallel workstreams adding admin screens for projects,
domains, spaces, quotes, and rendering/drawing media. **This file is the interface
contract: implement to it exactly, do not renegotiate it unilaterally.**

## Ground rules (from CLAUDE.md + .specify/memory/constitution.md)

- TypeScript strict, **no `any`**; `npm run typecheck` must pass clean.
- Never hardcode hex — use the tokens in `app/globals.css`. Class merge via `cn`.
- Relations by **id**, never display name. Selects show names, store ids.
- Every entity carries a required `projectId`; `Project` itself has none.
- Server Components by default; anything with local state is `"use client"`.
- The portal is client-fetched through `lib/api-client.ts` (Supabase bearer token).
- Admin-only writes: server enforces `require_admin`; UI hiding is UX, not security.

## File ownership (do not edit files owned by another stream)

| Stream | Owns |
|---|---|
| A — backend media | `apps/api/app/contexts/media/**`, `apps/api/migrations/003_media_sets.sql`, `apps/api/app/main.py` (router registration line only) |
| B — quotes admin | `components/portal/admin/QuotesAdmin.tsx` (new) |
| C — media admin | `components/portal/admin/MediaAdmin.tsx` (new) |
| D — project scope | `components/portal/PortalProjectProvider.tsx` (new), `lib/api-client.ts` |
| integrator (lead) | `lib/admin-schema.ts`, `app/portal/admin/page.tsx`, `app/portal/layout.tsx` |

If you need a change in a file you do not own, state it in your final report; the
integrator applies it.

## A. Media API contract (`/media-sets`)

New bounded context `media`, mirroring the layout of an existing simple context
(`apps/api/app/contexts/quality/**` is the reference: domain/entities.py,
infrastructure/orm.py + mappers, application/use_cases.py, interfaces/{schemas,rest_controller}.py).

Table `media_sets` (migration `003_media_sets.sql`, idempotent, `BEGIN`/`COMMIT`):

| column | type | notes |
|---|---|---|
| `id` | VARCHAR PK | app-generated slug id, e.g. `ms-<nanoid>` |
| `project_id` | VARCHAR NOT NULL | FK → `projects(id)` ON DELETE CASCADE, indexed |
| `kind` | VARCHAR NOT NULL | `rendering` \| `drawing_sheet` |
| `title` | VARCHAR NOT NULL | |
| `width` | INTEGER NOT NULL DEFAULT 1600 | intrinsic image width, for layout |
| `height` | INTEGER NOT NULL DEFAULT 900 | |
| `images` | JSONB NOT NULL DEFAULT '[]' | `string[]` of public paths/URLs |
| `subsections` | JSONB | nullable `[{title, images[]}]` |
| `domain_id` | VARCHAR | nullable FK → `domains(id)` ON DELETE SET NULL, indexed |
| `space_id` | VARCHAR | nullable FK → `spaces(id)` ON DELETE SET NULL, indexed |
| `sort_order` | INTEGER NOT NULL DEFAULT 0 | |

This intentionally mirrors `RenderingSet` in `data/renderings.ts` (title/width/height/
images/subsections) so `components/RenderingGallery` can render DB rows unchanged.

Routes (camelCase JSON in and out, same as every other context):

- `GET /media-sets?projectId=&kind=&domainId=&spaceId=` — `require_user`. All filters
  optional and AND-combined. Ordered by `sortOrder`, then `title`.
- `POST /media-sets` — `require_admin`. Body = `MediaSetCreate`; `projectId`, `kind`,
  `title` required. Validates that `projectId` exists and that any `domainId`/`spaceId`
  resolves **and belongs to the same project** (409/422 otherwise, matching how the
  other controllers report reference failures).
- `GET /media-sets/{id}` — `require_user`.
- `PATCH /media-sets/{id}` — `require_admin`, partial update, same reference validation.
- `DELETE /media-sets/{id}` — `require_admin`, `204`. (Media is the one collection that
  genuinely needs delete; the other contexts stay append/patch-only.)

Read shape:

```json
{ "id": "ms-x1", "projectId": "proj-kr", "kind": "rendering",
  "title": "Living Room", "width": 1600, "height": 901,
  "images": ["/images/renderings/interior-design/common-02.jpg"],
  "subsections": null, "domainId": "dom-interior", "spaceId": null, "sortOrder": 0 }
```

TypeScript mirror (stream C adds it to `types/api.ts`):

```ts
export type MediaKind = "rendering" | "drawing_sheet";
export interface MediaSubsection { title: string; images: string[] }
export interface MediaSet {
  id: string; projectId: string; kind: MediaKind; title: string;
  width: number; height: number; images: string[];
  subsections: MediaSubsection[] | null;
  domainId: string | null; spaceId: string | null; sortOrder: number;
}
```

## B. Quotes admin

Backend is already complete — do not touch `apps/api/`. Use:

- `GET /quotes?projectId=`, `POST /quotes` (`QuoteCreate`: `projectId`+`vendorId`
  required), `GET /quotes/{id}`, `GET /quotes/{id}/line-items`
- `POST /quote-line-items` (`QuoteLineItemCreate`: `projectId`+`quoteId` required),
  `PATCH /quote-line-items/{id}`
- Workflow actions: `POST /quotes/{id}/approve` (body `ApproveQuoteRequest`),
  `POST /quotes/{id}/negotiate`, `POST /quotes/{id}/reject` (body `QuoteActionNote`)

Read the live schemas from `http://localhost:8099/openapi.json` — the API is running —
rather than guessing field names.

A quote is a **parent + line items**, which the generic `EntityForm` cannot express, so
`QuotesAdmin.tsx` is a purpose-built client component: list quotes → select one →
edit header fields and its line items inline, plus the approve/negotiate/reject actions.
Reuse `components/portal/EntityForm.tsx` for the header form if it fits without
modifying it; otherwise build the header form locally in the same idiom.

## C. Media admin

`MediaAdmin.tsx`: pick kind (rendering / drawing sheet) and owner (project-level, or a
specific domain or space), then create/edit/delete sets. Images are entered as a
newline-separated list of paths (same idiom as the existing `stringList` fields, e.g.
`photos` on progress). Support the optional subsections shape. Show a small thumbnail
strip using `next/image` (images are `unoptimized` per `next.config.ts`).

**No file upload.** The site is a static export with no server; images are referenced by
path under `public/images/` or an absolute URL. Uploading is a separate feature.

## D. Project scope

The portal currently pins `PORTAL_PROJECT_ID` (`lib/api-client.ts`), so an admin can
create a project but never administer it. Replace the constant with a selectable scope:

- `PortalProjectProvider.tsx` — client context holding `{ projects, selectedId, setSelectedId }`,
  loading `GET /projects`, persisting the choice in `localStorage` under
  `portal_selected_project`, defaulting to `NEXT_PUBLIC_PROJECT_ID ?? "proj-kr"` and
  falling back to the first project when that id is absent.
- `lib/api-client.ts` — keep `scopedPath`/`withProject` working, but reading the
  selected id from a module-level setter the provider updates (the existing
  non-React call sites must keep compiling). Keep `PORTAL_PROJECT_ID` exported as the
  default seed value so nothing breaks.
- **`withProject` must not stamp `projectId` on the `projects` endpoint** — `Project` is
  the tenant root and `ProjectCreate` has no `projectId`, so the current admin "New
  project" POST sends a field the schema rejects. Fix by making the stamp opt-out.

Do not edit `app/portal/admin/page.tsx` — report the wiring you need and the integrator
does it.

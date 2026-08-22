# Feature Specification: 002 — Geometry layer (optional, provider-agnostic)

**Feature branch:** `feat/002-geometry-layer` (not started)
**Status:** Sketch — deliberately not implemented
**Depends on:** a native model (Revit / Rhino / ArchiCAD / IFC) existing for the project

## Summary

Add one nullable reference from the record to a **3D model element held elsewhere**, plus an
embeddable viewer on the public project page. This is the smallest change that keeps the geometry
option open without adopting a geometry platform today.

It is written provider-agnostically. Speckle is the likely provider and is used in the examples,
but nothing in the contract names it, so IFC/IfcOpenShell or a later alternative fits the same
field without a migration.

## Why

`Drawing` today is a document record: one row, one `spaceId`, one `domainId`, a `fileUrl`. It cannot
say *"this wall appears on the plan, the section and the joinery detail"*, because the thing being
drawn has no identity in the model — only the drawing does.

Giving the **element** an identity is what unlocks the queries a drawing cannot answer: which
procured items are installed in spaces whose drawings are still at Rev B; which decisions touched
the elements that changed between two model versions.

The second motive is the public site. An interactive model on a project page is a stronger portfolio
piece than a rendering, and it embeds into a static export without a server.

## Why NOT to build it yet

Recorded here so the decision is revisited on evidence rather than enthusiasm:

- **It presumes a native model exists.** If the residence was drawn in 2D CAD only, there is nothing
  to ingest and this feature delivers nothing. 2D DWG cannot be parsed into reliable semantics —
  layer conventions differ per consultant, and "is this polyline a wall?" is a guess.
- **It adds a second system** with its own auth and availability, against a stack that is currently
  one API and one database.
- **It is not the differentiator.** The defensible part of this product is the decision and
  execution record, which no geometry platform models. Geometry is where the well-funded BIM
  incumbents already live.

## Scope

### In
- `BuildingElement` — a new entity, the thing itself rather than its depiction.
- A `modelRef` value object: provider + stable id, nullable throughout.
- A viewer embed component on the 2.0 project page, rendering only when a project has a `modelRef`.

### Out
- Parsing DWG. Extraction is an export from the authoring tool, never a guess from 2D lines.
- Migrating any existing entity's data into a geometry platform. The record stays the source of
  truth; the provider holds geometry only.
- Sensors, telemetry, Brick. That is a later, separate question and only if hardware exists.

## The contract

```ts
/** Where a piece of geometry lives. Provider-agnostic on purpose. */
export interface ModelRef {
  /** "speckle" | "ifc" — an open set; the record must not care which. */
  provider: string;
  /** Provider-stable identity: a Speckle object id, or an IFC GlobalId. */
  objectId: string;
  /** Container: a Speckle project/model, or the IFC file's id. Empty if not applicable. */
  containerId: string;
  /** Version/commit this reference was resolved against. Empty if unversioned. */
  versionId: string;
}

/** The physical thing a drawing depicts. Many drawings may show one element. */
export interface BuildingElement {
  projectId: string;
  id: string;
  /** IFC class name — "IfcWall", "IfcDoor", "IfcSpace". The lingua franca. */
  ifcClass: string;
  name: string;
  spaceId: string;          // "" if not room-specific
  domainId: string;         // "" if not discipline-specific
  materialIds: string[];
  drawingIds: string[];     // where it is drawn — the many-to-many this feature exists for
  /** Null until a model is connected. The whole feature is optional through this field. */
  modelRef: ModelRef | null;
}
```

`Project` gains one optional field, and nothing else changes:

```ts
  /** Set when a 3D model is published for this project; drives the viewer embed. */
  modelRef?: ModelRef | null;
```

### Why `ifcClass` even when the provider is Speckle

IFC class names are the one identifier every tool in this industry agrees on. Storing
`"IfcWall"` rather than a provider's own type keeps the record readable if the provider changes,
and makes COBie / BCF / Brick joinable later without re-modelling. The provider id lives in
`modelRef`; the *meaning* lives in `ifcClass`.

## Constitution check

- **Repository is the only data door** — the viewer receives a `modelRef` as a prop from a page that
  got it from the repository. No component fetches a provider directly.
- **Relations by id** — `drawingIds`, `spaceId`, `materialIds` follow the existing pattern.
- **One project per entity** — `BuildingElement` carries a required `projectId`.
- **The data model is the contract** — this spec is the reviewed schema change that rule requires;
  it is not a drive-by edit.
- **Public side stays anonymised** — a published model shows geometry, and geometry can carry
  metadata. Whatever is embedded must be treated as public: no cost data, no client names in
  parameters.

## The viewer embed

The 2.0 project page renders the viewer only when `project.modelRef` is set, so the feature is
invisible until a model exists.

```tsx
// components/v2/ModelViewer.tsx — sketch
export function ModelViewer({ modelRef }: { modelRef: ModelRef }) {
  if (modelRef.provider !== "speckle") return null;
  const src =
    `https://app.speckle.systems/projects/${modelRef.containerId}` +
    `/models/${modelRef.objectId}#embed=%7B%22isEnabled%22%3Atrue%7D`;
  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-border">
      <iframe src={src} title="Project model" loading="lazy"
              className="h-full w-full" allow="fullscreen" />
    </div>
  );
}
```

Two constraints this must respect:

- **The site is a static export on GitHub Pages.** An iframe embed works; anything needing a server
  does not. Querying the provider's API from the browser would put a second credential in the public
  bundle — if that is ever needed, it must be proxied through the FastAPI.
- **A published model is public.** Embedding on the public tree means the model is world-viewable,
  which is a decision about the project's anonymity, not a technical detail.

## Open questions

1. **Does a native model exist for this residence?** Everything here is blocked on it. Answer this
   before any other work.
2. **Public or portal?** The viewer is a marketing asset on the public page and a working tool on
   the portal. The anonymisation rule may permit only the second.
3. **Self-hosted or hosted provider?** Self-hosting removes the third-party dependency and adds an
   operational one.
4. **Does `Drawing` need splitting into sheet and view?** Deferred deliberately — `drawingIds` on
   `BuildingElement` delivers the many-to-many without touching `Drawing` at all. Revisit only if
   per-view scale and extent turn out to matter.

## Acceptance

- With no `modelRef` anywhere, the app behaves exactly as it does today — no viewer, no new
  requests, no visual change. This is the test that the feature is genuinely optional.
- With a `modelRef` on the project, the project page shows an interactive model.
- `npm run verify` passes: `BuildingElement.drawingIds` resolve, and `spaceId` / `domainId` /
  `materialIds` resolve when non-empty.

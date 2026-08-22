# Speckle spike — 3D model as a first-class entity

**Status:** proposed, not started. Timebox: ~2 days.
**Goal of the spike:** prove that a Speckle object can be linked to a `Space` record and
resolved in both directions, before committing to a migration or a new bounded context.

## The question the spike answers

Everything downstream (quantity takeoff, commit-diff summaries, NL query over the model)
depends on one unproven thing: **can we hold a stable identity between a Speckle object
and one of our entities across model revisions?**

Speckle object ids are content hashes — they change when the object changes. So the link
cannot be `space.speckleObjectId = <hash>`. It has to key on something author-stable:
a Revit `elementId` / IFC GUID carried in the object's `applicationId`. If that holds,
the rest is ordinary CRUD. If it does not, the whole idea degrades into "an embedded
viewer next to unrelated tables" and is not worth a context.

Nothing else in the spike matters as much as this. Answer it first.

## Non-goals for the spike

- No migration, no Alembic revision — the mapping lives in a scratch JSON file.
- No admin UI. Linking is done by hand.
- No AI. The intelligence layer is worthless until the graph link is proven.
- No `.skp`/`.rvt` upload path. Push from the desktop connector by hand.

## Steps

### 1. Source model (0.5d)
Pick **one domain** with real modeled geometry — not a SketchUp massing. Push it to a
free Speckle account from the native connector (Revit/Rhino/Archicad/SketchUp). Record
the stream id, branch, and commit sha.

Checkpoint: open the commit in Speckle's web viewer and confirm individual elements
carry parameters, not just meshes. **If the objects are bare meshes with no
`applicationId`, stop here** — the source file is not suitable and the spike's core
question cannot be answered with it.

### 2. Read it from Python (0.5d)
In `apps/api`, with the venv active:

```bash
pip install specklepy   # do NOT add to requirements.txt during the spike
```

Scratch script (`apps/api/scripts/spike_speckle.py`, gitignored or deleted after):
traverse the commit, and for each element dump `id`, `applicationId`, `speckle_type`,
and any area/volume parameters. Write to JSON.

Checkpoint: `applicationId` is present and non-empty on the elements that correspond to
rooms/spaces.

### 3. Hand-link five spaces (0.5d)
Map five `Space` records to their Speckle `applicationId`s in a flat JSON file:

```json
[{ "projectId": "...", "spaceId": "...", "applicationId": "..." }]
```

Then **re-push the model after a deliberate edit** (move a wall, rename a room) and
re-run step 2. This is the actual experiment: the object hashes must change while the
`applicationId`s stay put. If they drift, the link is not durable and the design needs
an explicit reconciliation step — record that finding rather than papering over it.

### 4. Viewer on a 2.0 page (0.5d)
`@speckle/viewer` in a client component under `app/(v2)/[projectId]/`, following the
runtime-fetch pattern of `DomainMediaTabs` (2.0 is `"use client"` + `lib/api-v2.ts`).
Wire selection → look up `applicationId` in the JSON → render the matching `Space` name.

Checkpoint: clicking a room in the 3D view names the right `Space`.

## What the spike must produce

A written finding on each of:

1. Does `applicationId` survive a revision? (the core question)
2. Are computed quantities from the model close enough to `BOQ` rows to be worth diffing,
   or is the unit/rounding mismatch fatal?
3. Does `@speckle/viewer` work under `output: "export"` with no server?
4. Bundle-size cost of the viewer on the 2.0 tree.

## If it succeeds — the shape of the real thing

A `geometry` context mirroring `media` (which is the closest existing analogue: it also
attaches to project / domain / space):

```
apps/api/app/contexts/geometry/
  domain/entities.py, repository.py
  application/use_cases.py
  infrastructure/orm.py, repository_impl.py
  interfaces/rest_controller.py, schemas.py
migrations/versions/<rev>_geometry.py
```

Constraints that are already decided, from the constitution:

- **Rule 5** — `speckle_models` carries a required `project_id` FK to `projects`
  `ON DELETE CASCADE`, and `GET /speckle-models` accepts `?projectId=`. A stream binds
  to exactly one project.
- **Rule 2** — the model link is a relation by id, resolved at render time. `Space` gains
  a nullable `speckleApplicationId`; the commit ref lives on the model row, not on the space.
- **Rule 4** — `packages/contracts` is locked. Adding a field to `Space` is its own
  reviewed change, and must be mirrored by hand into `apps/ios/Models.swift` and
  `apps/android/Models.kt`, which `packages/contracts` cannot reach.
- **`require_user`** on the read endpoints, same as `GET /media-sets`. Geometry is not
  public — see rule 6 on anonymization.

## Known risks

- **Speckle Cloud is a third party holding project geometry.** Self-hosting is possible
  but is a real ops commitment. Decide before any client data goes in.
- **Tenancy is still unresolved** (`docs/technical-review.md`, and there is no
  org/membership model). Adding a context now means retrofitting it later.
- **No test runner in this repo.** A context this stateful wants one; extending
  `apps/api/scripts/verify.py` with geometry checks is the minimum bar.
- **GIGO.** The payoff scales with how well the source file is modeled, and that is
  outside our control.

# The Construction Intelligence Graph

**An AI-native knowledge graph and platform for residential architecture and construction.**

**Status:** Vision, thesis, and sequencing. Version 2 — supersedes the earlier
platform vision by adding the knowledge-graph thesis, the ontology plan, and the
agent architecture.

---

## 1. Where this comes from

I built a house. Not as a developer or a professional — as the homeowner who had to hold the whole
thing in his head. That experience is the reason this document exists, and it is the only real
asset I start with: I know precisely where the process breaks, because it broke on me.

I also have the wreckage to prove it. Twenty-odd consultant drawings across HVAC, lighting,
automation, flooring and structure — different revisions, different consultants, no shared model,
and no way to know which of them contradict each other. That is the problem, sitting in a folder.

## 2. The problem

A house is designed and built by eight to twelve parties who never share a system. The architect
works in CAD. The structural consultant returns marked-up PDFs. Electrical, plumbing, lighting and
automation each produce drawings on their own revision cycles that contradict each other in ways
nobody catches until a wall is already up. Procurement lives in spreadsheets. Site updates arrive
as photographs in a group chat. The decisions that actually shaped the building — and the reasons
behind them — live nowhere at all.

The result is not merely inefficiency. It is that **no one can answer basic questions**: which
drawing is site building from; what was agreed about this room in March; why the first stone sample
was rejected; whether the electrical layout still matches the furniture plan.

At handover the homeowner receives a building and a folder of files. The practice moves on with
nothing reusable. The knowledge evaporates.

## 3. The gap in the market

Building ontologies exist. BIM data platforms exist. What does not exist is an **AI-native
knowledge graph spanning the whole construction lifecycle**.

| Area | What exists | What it does not do |
|---|---|---|
| BIM data | IFC, ifcOWL | Geometry and exchange, not business knowledge |
| Building operations | Brick Schema | Excellent post-occupancy; silent on construction execution |
| BIM collaboration | Speckle | A superb data hub, but not a reasoning graph |
| Digital twin | Autodesk, Bentley, Siemens | Enterprise platforms, not open graphs |
| Scheduling AI | ALICE Technologies | Optimises schedules; exposes no reusable ontology |

Each standard covers a slice, and the slices do not meet:

| Layer | Standard | Covers |
|---|---|---|
| Building elements, geometry | **IFC 4.3 / ifcOWL** | what was built |
| Spatial topology | **BOT** | how the building is arranged |
| Classification | **Uniclass 2015**, UniFormat, OmniClass | what kind of thing it is |
| Handover data | **COBie** | what you hand over |
| Issues and defects | **BCF** | what is wrong with it |
| Information process | **ISO 19650** | how documents are named and issued |
| Operations | **Brick**, Project Haystack | how it runs once occupied |

**Nothing models the decision and execution layer** — why something was chosen, what it cost to get
there, what changed, who agreed, and which vendor let you down. That is not an oversight in those
standards; it is outside their scope. It is also the layer I have already built and the one worth
defending.

**The thesis: adopt the open standards where they exist, own the layer where they don't, and
connect the whole chain.**

## 4. What the graph connects

The chain nobody has joined:

```
Client → Requirements → Architect → Concept → Drawing → BIM → Estimate → BOQ
      → Vendor → Quote → Purchase Order → Delivery → Site → Labour → Inspection
      → Issue → Photo → Invoice → Payment → Handover → Warranty → Maintenance
```

Today that chain is fragmented across dozens of products, each holding one link and none holding
the joins. The joins are where the value is:

> *Which delayed deliveries are likely to delay next week's concrete pour?*
> *Which suppliers repeatedly delay waterproofing, and what did it cost us?*

Neither is a search. Both are graph traversals — vendor → purchase orders → delivery dates →
affected tasks → schedule slip → final cost — and both come back with evidence attached.

## 5. The ontology (CCO), and how big it should actually be

The target is a **Construction Canonical Ontology**: modular, versioned per module, and mapped to
the standards above. The eighteen modules are the right shape:

```
Core · Organization · People · Geography · Project · Design · Building · Materials
Equipment · Construction · Procurement · Contracts · Finance · Schedule
Quality · Safety · Operations · AI
```

Relationships organised into families rather than invented one at a time — structural
(`PART_OF`, `CONTAINS`, `CONNECTED_TO`, `ADJACENT_TO`), material (`USES`, `COMPOSED_OF`),
organisational (`SUPPLIED_BY`, `CONTRACTED_BY`), temporal (`PRECEDES`, `OVERLAPS`), financial
(`INVOICED_BY`, `BUDGETED_FOR`), operational (`MONITORED_BY`, `INSTALLED_IN`), and AI
(`PREDICTS`, `RECOMMENDS`, `DERIVED_FROM`, `SUPPORTED_BY`).

### The sizing discipline — this is where the plan lives or dies

A complete CCO is roughly 320 entity types, 1,200 relationships, SHACL rules, JSON-LD contexts,
generated GraphQL and REST, mappings to five standards, SDKs in three languages, and thousands of
pages of documentation. That is a small standards foundation, and it is **two to four years of work
before a single user benefits.**

Every industry ontology held up as a model — FHIR, ISA-95, Schema.org, IFC itself — grew from
implementations that were already in production. **None was designed to completion first.** FHIR
succeeded precisely because it started with the 80% of resources people actually exchanged and
resisted modelling everything.

So the rule for this project:

> **An entity enters the ontology when a real project needs it, not when the module diagram has a
> gap.** Modules are the map; they are not the build order.

Concretely, the starting ontology is not 320 entities. It is the **~20 already in production**
(`Project`, `Space`, `Domain`, `Drawing`, `Vendor`, `Material`, `ProcurementItem`, `BOQ`,
`Decision`, `Snag`, `Progress`, `Warranty`, `Lesson`, `Quote`, `Delivery`, `Inspection`,
`GalleryItem`, `MediaSet`, `UserProfile`, `Notification`) plus the **Building module aligned to
IFC** as drawings are ingested. That is perhaps 60-80 entities at the end of year one, each earning
its place.

Publishing CCO as an open specification is a genuinely good long-term move — it is how you become
infrastructure rather than an app. But it is a **consequence of adoption, not a route to it.** A
standard nobody implements is a document.

## 6. AI: what the agents actually do

Not "AI-powered" as a label. Named jobs, each a real bottleneck today:

| Agent | Job | Why it matters |
|---|---|---|
| **Intake** | Turn a family's description into structured requirements | Replaces three meetings of manual capture |
| **Design** | Read drawings, classify contents, suggest options | Feeds the graph from what already exists |
| **Conflict** | Find contradictions *between disciplines* | **The one that saves real money** — these errors are currently found on site, in concrete |
| **BOQ / Estimator** | Generate quantities from the model | Removes the most tedious task in the practice |
| **Procurement** | Match vendors, predict shortages | Uses vendor history the graph already holds |
| **Quality** | Detect defects from site photographs | Site staff photograph everything already |
| **Safety** | PPE and hazard compliance from imagery | Regulatory pressure is rising |
| **Delay** | Predict schedule risk from delivery and weather signals | The classic traversal question |
| **Cost** | Forecast final cost from committed and actual spend | What the owner asks about weekly |
| **Facility** | Maintenance after handover, via Brick | Extends revenue past project end |

Agents read and write the **same graph**, coordinated by an orchestrator. That is what makes the
advantage compound: each application enriches the graph, and a richer graph makes every other
application smarter.

**The precondition nobody states:** agents reasoning over an empty graph produce confident
nonsense. Data first, agents second. The conflict agent is the right first one, because it is the
only one that delivers value from *existing* drawings without anyone changing how they work.

## 7. Artifacts as objects, not files

A drawing is not a PDF. It is a document with a revision, a discipline, an issue status, and a set
of building elements it depicts — elements that appear on other drawings too. Once the system knows
that, impossible questions become queries: *which procured items sit in rooms whose drawings are
still at Rev B.*

### Extraction: the step everyone glosses over

The standard pipeline — extract, model, store, enrich, query, version — is right, and its weak link
is always step one. Vendor write-ups treat extraction as solved. It is not: arbitrary 2D CAD has no
reliable semantics, layer conventions differ per consultant, and *"is this polyline a wall?"* is a
guess.

**Measured on this project's own drawings, that turns out not to apply here.** The consultant
drawings follow the **AIA CAD Layer Guidelines**, so the semantics are in the layer name. One floor
plan (`MADHU-FF-PLAN-mm.dxf`) yields 455 entities across 12 named layers:

| Layer | Count | Maps to |
|---|---|---|
| `A-WALL` | 27 | `IfcWall` |
| `A-GLAZ` | 21 | `IfcWindow` |
| `A-DOOR` | 15 | `IfcDoor` |
| `A-FLOR-STRS` | 27 | `IfcStair` |
| `A-FLOR-FIXT` | 11 | `IfcFurnishingElement` |
| `A-ANNO-*` + `TEXT` | 126 | room identifiers → `Space` |

`A-WALL → IfcWall` is a lookup, not an inference. There is also a 63 MB SketchUp model.

The practical rule: **prefer an export over a parse.** IFC from the authoring tool, or Speckle's
connectors (Revit, AutoCAD, Rhino, Civil3D, SketchUp, Blender) where they exist. Fall back to
layer-driven DXF parsing — cheap and deterministic where layer discipline holds. Use AI for the
residue, not the trunk.

## 8. Marketplace and professional network

Homeowners discover and engage architects, interior designers, structural and electrical
consultants, automation specialists, contractors, suppliers and trades.

The difference from a directory is that the platform **understands the work**. Asked for electrical
design, it knows what an electrical consultant produces, which deliverables that involves, how it
depends on lighting and automation, and at what stage it must happen — so it recommends the right
professional at the right moment with the brief already prepared.

That understanding comes from the ontology. Without it, this is Yellow Pages.

## 9. Why India

The strongest reason to build this here rather than compete head-on in markets Autodesk already
owns. Indian residential construction has characteristics Western software handles badly:

- Labour productivity and daily wage tracking
- Material theft and site inventory reconciliation
- Vendor reliability that varies enormously and is known only anecdotally
- BOQ standardisation across informal contractors
- Government approvals and local building codes
- GST documentation threaded through every transaction
- **Multilingual site communication** — the site speaks a different language from the drawings
- The real medium of record: **WhatsApp threads, PDF drawings, site photographs and voice notes**

That last point is the wedge inside the wedge. The incumbent platforms assume a BIM-first, digital
site. The actual site runs on WhatsApp and paper. A system that ingests *that* and turns it into
structured graph data is solving the problem people have, not the one the software assumes.

## 10. Architecture

**Target state**, once volume and agents justify it:

```
Users:  Homeowner · Architect · Contractor · Vendor · Site engineer · PM · Agents
   ↓  API gateway (authn, rate limits)
   ↓  Agent platform + orchestrator
   ↓  Construction Knowledge Graph
   ↓  Vector search over drawings, PDFs, specs, contracts, messages
   ↓  Document AI: OCR, vision, CAD parsing, drawing understanding
   ↓  Data lake: DWG, IFC, RVT, PDF, images, drone, IoT
```

**What to actually run now, and when each piece earns its place:**

| Layer | Target | Today | Adopt when |
|---|---|---|---|
| Ontology | CCO + IFC + Brick | ~20 entities, id-linked | continuously, per project need |
| Graph store | Neo4j / Neptune | **PostgreSQL** | traversals exceed 3-4 hops or path queries dominate |
| Vector search | Qdrant | none | there are documents worth semantic search over |
| BIM | Speckle + IFC | none | a native model exists and the viewer is wanted |
| Agents | LangGraph / A2A | none | the graph holds enough data to reason over |
| Events | Kafka | none | ingestion outgrows a request cycle |
| Infra | Kubernetes / EKS | static export + one API | there is load to justify operating it |

Two judgements worth stating plainly, because they are the expensive mistakes:

**A graph database is not required to have a graph.** The current model already *is* a property
graph — entities related by id, resolved at query time — stored relationally. Postgres carries this
comfortably at project scale, and recursive CTEs handle multi-hop traversal. Neo4j earns its place
when query *shape* demands it, not when the diagram looks graph-shaped. Migrating later is a
schema-mapping exercise; migrating early costs a year of operating a second datastore for one user.

**The nine-service, nine-agent, Kubernetes architecture is a destination, not a starting point.**
Every box is defensible at scale and indefensible at zero customers. The current stack — a static
export, one FastAPI, one Postgres — serves the first five practices without modification.

## 11. Sequencing

Each stage has an exit criterion. Do not begin the next before meeting it.

**Stage 1 — The record, proven on one project.** *(largely done)*
The decision and execution layer, end to end, on my own house. This is the wedge: the only layer no
incumbent models, and the only one I have earned the right to design.
→ *Exit: the published case study makes an architect ask how it was made.*

**Stage 2 — Five practices, live jobs.**
The blocker is organisation and membership: today there are users but no firms, and roles are
global rather than per project. Build that, and only that.
→ *Exit: five practices keeping records for their own projects, unprompted, for a full month.*

**Stage 3 — Drawings become objects.**
Layer-driven DXF extraction and IFC/Speckle ingestion into the Building module. Then the conflict
agent — the first AI capability that pays for itself, because cross-discipline clashes are
currently found in concrete.
→ *Exit: one conflict caught before construction that a project architect missed.*

**Stage 4 — The graph proper.**
Move to a graph store when traversal queries dominate. Add vector search over drawings, specs and
site messages. Add agents on top — estimator, procurement, delay — each reading and writing the
same graph.
→ *Exit: an agent answers a question no report could, with evidence.*

**Stage 5 — CCO as an open specification.**
OWL/RDF, SHACL, JSON-LD, generated GraphQL and REST, mappings to IFC/Brick/BOT/COBie/Speckle, SDKs.
Published as a standard with governance and RFCs.
→ *Only once others want to integrate. A standard nobody implements is a document.*

**Deliberately not yet:** full BIM authoring, digital twin, operations at scale. Autodesk, Bentley
and Siemens live there with enormous resources; entering on their ground is a losing move.

## 12. What would tell me I am wrong

- If architects see the published case study and say "nice site" rather than "how did you make
  this" — the record is not the wedge, and this is project management software in a crowded market.
- If practices keep records for a client but not for themselves, retention fails and the graph
  never gets dense enough for agents to matter.
- If conflict detection cannot beat an experienced project architect reading two drawings side by
  side, that pillar is theatre.
- If the ontology needs 300 entities before the first useful query, the modular thesis is wrong and
  the scope must shrink further.
- If site teams will not move off WhatsApp — or will not let us ingest it — the India wedge closes.

Each is cheap to test and expensive to assume. The order of this plan is chosen so that every stage
tests one of them.

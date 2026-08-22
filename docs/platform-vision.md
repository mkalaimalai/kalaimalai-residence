# An Operating System for Residential Architecture and Construction

**Status:** Vision + sequencing. Not a commitment to build all of it.

## Where this comes from

I built a house. Not as a developer or a professional — as the homeowner who had to hold the
whole thing in his head. That experience is the reason this document exists, and it is also the
only real asset I have: I know exactly where the process breaks, because it broke on me.

## The problem

A house is designed and built by eight to twelve parties who never share a system. The architect
works in CAD. The structural consultant returns marked-up PDFs. Electrical, plumbing, lighting and
automation each produce their own drawings, on their own revision cycles, that contradict each
other in ways nobody catches until a wall is already up. Procurement lives in spreadsheets. Site
updates arrive as photographs in a group chat. And the decisions — the ones that actually shaped
the building, and the reasons behind them — live nowhere at all.

The result is not just inefficiency. It is that **no one can answer basic questions**: which
drawing is site building from, what was agreed about this room in March, why the first stone
sample was rejected, whether the electrical layout still matches the furniture plan.

At handover the homeowner receives a building and a folder of files. The practice moves on with
nothing reusable. The knowledge evaporates.

## What I want to build

A single platform that holds the **entire lifecycle of a home** — from the first description of
what a family wants, to the handover pack — where every drawing, decision, specification, quote
and site report is a **connected object in one project model**, not a file in somebody's folder.

```
Idea → Requirements → Architect → Concept → Design → Engineering → Drawings
     → Approvals → Procurement → Construction → Site monitoring → Handover → Home
```

## The spine: a construction ontology

Everything else depends on this. The platform needs a shared vocabulary for what things *are* and
how they relate — across architecture, structure, electrical, plumbing, lighting, automation,
interiors, furniture, landscape, procurement and construction.

This is not invented from scratch. The industry already has standards, and each covers a slice:

| Layer | Standard | Covers |
|---|---|---|
| Building elements, geometry | **IFC 4.3 / ifcOWL** | what was built |
| Classification of systems | **Uniclass 2015**, UniFormat | what kind of thing it is |
| Handover data | **COBie** | what you hand over |
| Issues and defects | **BCF** | what is wrong with it |
| Information process | **ISO 19650** | how documents are named and issued |
| Building operations | **Brick** | how it runs once occupied |

What no standard covers is **the decision and execution layer** — why something was chosen, what
it cost to get there, what changed and who agreed. That gap is not an oversight in those
standards; it is outside their scope. It is also the part I have already built, and I believe it
is the defensible part.

So the ontology is: adopt the open standards where they exist, and own the layer where they
don't.

## Who it serves

**Architects and designers** — the daily working platform. Projects, requirements, drawings,
specifications, revisions, client communication. This has to be good enough to replace what they
use now, or none of the rest matters.

**Homeowners** — see the project evolve. Review drawings and decisions, understand what happened
on site this week, track progress without a weekly phone call.

**Contractors and consultants** — collaborate on their own scope, and see only what is relevant
to it.

**Skilled trades** — matched to projects by skill and availability.

## What AI actually does

Not "AI-powered" as a label. Specific jobs, each of which is a real bottleneck today:

- **Turn a family's description into structured requirements** — the intake that architects
  currently do by hand across three meetings.
- **Read drawings and classify what they contain** — which is tractable when drawings follow
  layer standards, and much harder when they don't.
- **Find contradictions between disciplines** — the electrical layout against the furniture plan,
  the HVAC drops against the ceiling design. This is the one that saves real money, because these
  errors are currently found on site.
- **Extract structured data from documents** — quotes, specifications, delivery notes.
- **Track what changed between revisions**, and which decisions the change touches.
- **Assist concept development** — early massing and layout options from the brief.
- **Monitor site progress** from photographs against the schedule.

## Artifacts as objects, not files

A drawing is not a PDF. It is a document with a revision, a discipline, an issue status, and a set
of building elements it depicts — elements that also appear on other drawings. Once the system
understands that, the questions that are impossible today become queries: *which procured items
sit in rooms whose drawings are still at Rev B.*

This applies to sketches, BIM models, specifications, photographs and site reports alike. The
storage format matters less than the fact that **each artifact knows what it represents and how it
connects.**

## Marketplace and professional network

Homeowners discover and engage architects, interior designers, structural and electrical
consultants, automation specialists, contractors, suppliers and trades.

The difference from a directory is that the platform **understands the work**. If a homeowner
needs electrical design, the system knows what an electrical consultant produces, which drawings
and deliverables that involves, how it depends on lighting and automation, and at what stage it
has to happen — so it can recommend the right professional at the right moment, with the brief
already prepared.

That understanding comes from the ontology. Without it, this is Yellow Pages.

## Sequencing — what is actually first

The vision above is eight products. Attempting them together is how this fails. The order I
believe in:

**Now — the record, proven on one project.** The decision and execution layer, working end to end
on my own house. This exists. It is the wedge, because it is the only part no incumbent models and
the only part I have earned the right to design.

**Next — one practice, real job.** Put it in front of five architecture practices running live
projects. The blocker is organisation and membership: today there are users but no firms, and no
per-project roles. That is the first thing to build, and only that.

**Then — drawings as objects.** Element extraction and cross-discipline conflict detection. This
is where AI earns its place, and it is worth building only once practices are already keeping
records in the system.

**Later — marketplace and trades.** A marketplace with no supply and no demand is worth nothing;
it becomes valuable only when projects already live on the platform.

**Not yet — full BIM, digital twin, operations.** Autodesk, Bentley and Siemens live here with
enormous resources. Entering on their ground is a losing move.

## What would tell me I am wrong

- If architects look at the published case study and say "nice site" rather than "how did you make
  this" — then the record is not the wedge, and this is project management software in a crowded
  market.
- If practices will keep records for a client but not for themselves, the retention story fails.
- If conflict detection cannot beat an experienced project architect reading two drawings side by
  side, that pillar is theatre.

Each of these is cheap to test and expensive to assume.

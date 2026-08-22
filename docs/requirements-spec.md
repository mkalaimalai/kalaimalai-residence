# Requirements Specification — Kalaimalai Residence → Owner-Side Construction Platform (India)

Status: **Open / living document** · Date: 2026-08-13 · Owner: Madhu Kalaimalai
Supersedes nothing; companion to `docs/technical-review.md` (2026-07-26) and
`docs/enterprise-grade-plan.md` (2026-08-12). Those two diagnose. **This one states the
requirements** — what is built (verified), what must be built, and in what order, to launch
as a product in the Indian market.

Every requirement carries an ID. `CR-*` = current implementation (as-built, verified by
inspection). `FR-*` = functional requirement. `NFR-*` = non-functional. `MR-*` = market /
commercial requirement. Requirements are marked:

- ✅ **Done** — verified present in the repo
- 🟡 **Partial** — exists but incomplete or unenforced
- ⬜ **Not started**

---

## Part 0 — The product in one paragraph

India has no homeowner-side advocate. Livspace, HomeLane, DesignCafe and Brick & Bolt are all
**supply-side**: they sell to the owner while representing themselves. The owner of a ₹1–5 Cr
design-led home carries every coordination risk — architect, civil, MEP, interiors, automation,
imports — with WhatsApp groups and Excel as their only tooling, and no way to answer the only
question that matters: *"is this quote fair?"*

This repo is a working, unusually well-modelled single-tenant version of that owner's system,
built by living the problem once. The product requirement is to make it **multi-tenant, safe,
auditable, and sellable in India** — while keeping it owner-first even when it is commercially
tempting to sell seats to builders.

**Non-goals for v1** (explicitly deferred, revisit at 50+ projects): computer vision, procurement
marketplace, eight languages, escrow, lending.

---

## Part 1 — Current implementation (as-built)

### 1.1 Repo shape

| Surface | Path | Stack | State |
|---|---|---|---|
| Public editorial site (1.0) | `apps/web/app/1.0/**` | Next 16 Server Components → seed | ✅ shipping to GitHub Pages |
| Signed-in multi-project site (2.0) | `apps/web/app/(v2)/**` | Next 16 client, fetches API | ✅ 11 routes |
| Owner portal | `apps/web/app/portal/**` | Next 16 client + Supabase Auth | ✅ 12 routes |
| Admin app | `apps/admin` | Next 16 `output: "export"`, own origin, :3001 | ✅ separate deployable |
| API | `apps/api` | FastAPI, DDD/hexagonal, 9 bounded contexts | ✅ over Supabase Postgres |
| iOS / Android | `apps/ios`, `apps/android` | SwiftUI / Compose | 🟡 read-only viewers, hand-copied models |
| Shared packages | `packages/{contracts,api-client,theme}` | TS workspaces | ✅ |

**CR-1 ✅ The repository is the only data door.** `apps/web/lib/repository.ts` — swapping seed →
API was a config flag (`DATA_SOURCE=api`), not a rewrite. This is proven, not aspirational.

**CR-2 ✅ Relations are by ID, never display name.** Every cross-reference is `*Ids: string[]`
resolved at render time via `lib/relations`. A rename never severs a link.

**CR-3 ✅ `packages/contracts/src/index.ts` is the locked contract** — 14 entity interfaces
(`Space`, `Domain`, `Drawing`, `Vendor`, `ProcurementItem`, `Decision`, `Snag`, `BOQ`,
`Material`, `Lesson`, `ProgressEntry`, `Warranty`, `Project`, `GalleryItem`), consumed by web,
admin and (by hand-copy) the two native clients.

**CR-4 ✅ The backend models more than the seed does.** 23 tables across 9 contexts, including
`quotes`, `quote_line_items`, `boq_line_items`, `purchase_orders`, `deliveries`, `inspections`,
`notifications`, `media_sets`, `user_profiles` — none of which exist in `data/*.ts`. This is
already a construction-management schema, not a documentation site's backend.

**CR-5 ✅ Bounded contexts.** `project`, `commercial` (richest), `quality`, `document`, `vendor`,
`handover`, `notification`, `media`, `identity` — each with the full hexagonal stack
(`domain/` → `application/` → `infrastructure/` → `interfaces/`). A shared `app/shared/crud.py`
factory generates standard routes with a per-resource `public_read` flag; that flag is what keeps
portal data out of the public build.

**CR-6 ✅ Identity is Supabase Auth.** No second user store, no password in our API. Role is read
from `app_metadata.role` (`app/shared/auth.py`) — deliberately not `user_metadata`, which the user
can self-write with the public anon key. `user_profiles.role` is a mirror, never the authorization
source. `PATCH /me` accepts `displayName` and nothing else.

**CR-7 ✅ `project_id` on every entity** via the `ProjectScoped` mixin (`app/shared/db.py`).
`Project` is the tenant root and carries none.

**CR-8 ✅ Alembic migrations** (`apps/api/migrations/versions/`) replaced the four raw SQL files.

**CR-9 ✅ CI** (`.github/workflows/ci.yml`) runs typecheck, vitest, ruff, mypy, OpenAPI export.

**CR-10 ✅ File uploads to Google Drive** — `POST /uploads`, `POST /media-sets/{id}/files`,
admin-only, multipart, images/PDFs, 25 MB each (`app/shared/drive.py`).

**CR-11 ✅ Data-integrity gate.** `npm run verify` checks entity counts, that every `*Id(s)`
reference resolves, that image paths exist, and walks a full relation chain. Exits non-zero.

### 1.2 What is verified *missing* today

These are stated as facts, each checked against the tree on 2026-08-13:

| ID | Finding | Evidence |
|---|---|---|
| **CR-G1** | No organizations, no memberships, no per-project roles | `grep -rni "organization\|org_id\|membership" apps/api/app/` → comments only |
| **CR-G2** | Tenant scope comes from a **query parameter** the caller supplies | `app/shared/crud.py` — `project_id: str \| None = Query(None, alias="projectId")`; omitting it returns every tenant's rows |
| **CR-G3** | RLS enabled on `user_profiles` only; every other table is world-readable via PostgREST with the anon key that ships in the browser bundle | `CLAUDE.md` states this explicitly |
| **CR-G4** | `slug` is **globally** unique on `spaces` and `domains`, not per-project | `contexts/project/infrastructure/orm.py:17,37` — `unique=True`. Customer #2 cannot create `master-bedroom` |
| **CR-G5** | No `created_at` / `updated_at` / `created_by` on any model | `app/shared/db.py` has no timestamp mixin |
| **CR-G6** | No delete, no soft delete, no archive, no offboarding | `app/shared/crud.py` has no delete path |
| **CR-G7** | No pagination — every collection GET returns every row | no `limit`/`offset`/cursor anywhere |
| **CR-G8** | No structured logging, error tracking, metrics, or rate limiting | one logger, in the notification stub |
| **CR-G9** | **Zero pytest tests.** The `commercial` context — quotes, BOQ line items, POs, deliveries, approve/negotiate/reject — is the most consequential code in the repo and has none | `find apps/api -name "test_*.py"` → empty |
| **CR-G10** | Routes unversioned (`/projects`, not `/v1/projects`); OpenAPI exported but not diffed against a baseline | `app/bootstrap.py` |
| **CR-G11** | Uploads live in a real person's personal Google Drive, shared by public link; no per-tenant isolation, no signed expiring URLs | `app/shared/drive.py` |
| **CR-G12** | Static export (`output: "export"`) means no server, so real prices structurally cannot live in the web bundle — the product's most valuable feature is blocked by the deployment target | `next.config.ts` |
| **CR-G13** | 80+ uncommitted modified/deleted files in the working tree, including the whole `apps/mobile` deletion | `git status` |
| **CR-G14** | Two frontends (1.0 seed/server, 2.0 client/API) render the same content by different means; every feature is a per-task decision about which tree gets it | — |

**The single most important line in this document:** CR-G1 + CR-G2 together mean *any
authenticated user can read every tenant's data by changing or omitting `?projectId=`.* Today that
is harmless — one project, one family. On the day customer #2 signs, it is a breach. Retrofitting
tenancy after real customer data exists is the most expensive migration in SaaS.

---

## Part 2 — Functional requirements

### 2.1 Tenancy & access (blocks customer #2 — nothing ships on top of this)

| ID | Requirement | State |
|---|---|---|
| **FR-1.1** | `organizations` table (id, name, created_at) | ⬜ |
| **FR-1.2** | `memberships` table (org_id, user_id, role ∈ owner\|admin\|member\|viewer, `UNIQUE(org_id,user_id)`) | ⬜ |
| **FR-1.3** | `projects.org_id` — the tenant root gains an owner; every entity reaches its org through its project | ⬜ |
| **FR-1.4** | A `TenantContext` dependency resolves the permitted project-id set **server-side from the verified JWT `sub`**, never from a query param. `?projectId=` becomes a *narrowing* filter within that set | ⬜ |
| **FR-1.5** | An id outside the permitted set returns **404, not 403** — do not leak existence | ⬜ |
| **FR-1.6** | `require_admin` becomes `require_project_role(project_id, role)`. The global `app_metadata.role` survives only as a platform-staff superuser flag and is renamed to say so | ⬜ |
| **FR-1.7** | RLS enabled on **every** table with policies keyed to `memberships`. The API connects as `postgres` and bypasses RLS, so this costs nothing at runtime — it exists to close the PostgREST anon-key path | ⬜ |
| **FR-1.8** | Composite `UNIQUE(project_id, slug)` on `spaces` and `domains`, with an Alembic revision (fixes CR-G4) | ⬜ |
| **FR-1.9** | Invite flow: an org owner invites a user by email at a role; the invitee accepts and gains membership | ⬜ |
| **FR-1.10** | Per-project membership for external parties — an architect or vendor sees *one* project, not the org | ⬜ |

**Exit criterion for the whole section:** a test proves a user in org A gets 404 on every org-B
collection endpoint, **and** the same is true with the raw anon key against PostgREST.

### 2.2 The owner's core loop (already largely built — this is the asset)

| ID | Requirement | State |
|---|---|---|
| **FR-2.1** | Room matrix + per-space design record (spaces, domains, materials, drawings, decisions) | ✅ |
| **FR-2.2** | Vendor register with scope and contact | ✅ |
| **FR-2.3** | Procurement tracking incl. EUR ex-works → estimated landed INR (`landedFromEUR`) | ✅ |
| **FR-2.4** | BOQ with line-item decomposition and packages | ✅ backend, 🟡 UI |
| **FR-2.5** | Quote header + line items + approve / negotiate / reject workflow | ✅ backend + admin UI |
| **FR-2.6** | Purchase orders and deliveries | ✅ backend, ⬜ UI |
| **FR-2.7** | Snags with priority and status; inspections | ✅ |
| **FR-2.8** | Decisions log with type and status | ✅ |
| **FR-2.9** | Progress entries (site diary) | ✅ |
| **FR-2.10** | Warranties | ✅ |
| **FR-2.11** | Media sets — renderings and drawing sheets attached to project / domain / space | ✅ |
| **FR-2.12** | Lessons + gallery (the credibility/content engine) | ✅ |

### 2.3 The India-specific product (this is where the moat is)

Ordered by defensibility. A gap is only a moat if a well-funded competitor cannot close it in a
quarter — which rules out localisation and WhatsApp-as-channel, both of which are table stakes,
not moats.

| ID | Requirement | Why defensible | State |
|---|---|---|---|
| **FR-3.1** | **Benchmark-on-quote.** Given category + city + spec + quoted rate, return the median and range with sample size and an explicit confidence caveat. Free, public, unauthenticated — the lead magnet | Every project adds a real quote to the corpus. Value compounds with usage; nobody else owns it because everyone else is supply-side | ⬜ |
| **FR-3.2** | **Consented, anonymized, k-anonymous extracts** feeding FR-3.1. Consent is captured at project creation, revocable, and the extract job enforces a minimum k before any figure is published | This must be decided in the tenancy phase, not discovered later | ⬜ |
| **FR-3.3** | **Change orders as first-class entities** — cause, cost delta, schedule delta, approver — not a PATCH to a BOQ row. This is where projects actually go wrong and no owner-side tool in India models it | Requires trustworthy history from day one; cannot be added as a feature later | ⬜ |
| **FR-3.4** | **Quote approval chain** — who approved, at what figure, against which BOQ line, when | Construction disputes are the normal case, not the exception | ⬜ |
| **FR-3.5** | **Payment milestones tied to verified progress entries, not to dates.** RERA-aligned stage schedule (foundation → plinth → slab → brickwork → plaster → flooring → finishing → handover) | State-by-state regulatory logic is slow, boring and compounding; once approvals live in the system switching cost is near-infinite | ⬜ |
| **FR-3.6** | **Approvals register** — plan sanction, CLU, RERA registration, Fire NOC, utility connections — with per-state logic starting with **Karnataka RERA only** | Same as above. Start with one state | ⬜ |
| **FR-3.7** | **Snag lifecycle with SLA** (critical 24h, high 72h), photo evidence sign-off, rolling by stage rather than only at handover, and liability-period/warranty linkage — `handover.Warranty` exists but is not connected to the clock | Owner-led QA is a complete gap in India | 🟡 |
| **FR-3.8** | **Handover dossier** — one button producing a permanent, shareable home record: as-built drawings, warranties with expiry alerts, vendor contacts, material specs. `app/shared/pdf.py` is part-way there | Converts a project tool into a 10-year relationship; the retention hook | ⬜ |
| **FR-3.9** | GST handling on quotes and POs (1% / 5% / 12% slabs + input credit) | Table stakes for any Indian commercial doc | ⬜ |
| **FR-3.10** | Indian number formatting (lakh/crore) and regional unit mapping (cent, sq yard, anna) throughout | `formatINR` exists; units do not | 🟡 |
| **FR-3.11** | WhatsApp as a **notification and capture channel** — snag photo in, progress update out. Treated as distribution, not as a moat. The `notification` context is the seam | ⬜ |

### 2.4 Explicitly deferred

| ID | Deferred | Reason |
|---|---|---|
| **FR-D1** | Computer-vision site intelligence | Needs a labelled dataset that does not exist. Presupposes the data flywheel; it is a year-3 feature |
| **FR-D2** | Procurement marketplace / demand aggregation | Demand aggregation requires demand. Capital-intensive and wrong-ordered |
| **FR-D3** | Eight languages | Localisation is a sprint for anyone funded. Ship English + one regional language when a customer asks |
| **FR-D4** | Escrow, home-loan origination, financing | Regulated, slow, and not what the first ten customers are buying |
| **FR-D5** | Selling seats to builders | Commercially tempting and strategically fatal. The entire position is that we are the only party in India on the owner's side |

---

## Part 3 — Non-functional requirements

| ID | Requirement | State |
|---|---|---|
| **NFR-1** | **Audit trail.** Append-only `audit_events` (actor, org, project, entity, action, before/after diff, timestamp), written by the **service layer, not by triggers**, so it captures intent | ⬜ |
| **NFR-2** | `created_at` / `updated_at` / `created_by` on every model via a mixin | ⬜ |
| **NFR-3** | Soft delete + archive + tenant data export + offboarding. A customer asking for their data to be removed must have an answer | ⬜ |
| **NFR-4** | Cursor pagination on every collection with a hard default cap | ⬜ |
| **NFR-5** | Structured JSON logging with request/correlation IDs | ⬜ |
| **NFR-6** | Error tracking (Sentry) + uptime/latency alerting + defined SLOs | ⬜ |
| **NFR-7** | Rate limiting — per-IP global, per-user on writes and uploads | ⬜ |
| **NFR-8** | `/v1` route prefix; CI diffs the exported OpenAPI against a committed baseline and fails on a breaking change | ⬜ |
| **NFR-9** | Native client models (`Models.swift`, `Models.kt`) **generated from OpenAPI in CI** rather than hand-copied. Removes an entire class of production bug across four clients | ⬜ |
| **NFR-10** | Object storage on S3/R2 with per-tenant prefixes and signed, expiring URLs. Retire the personal Google Drive | ⬜ |
| **NFR-11** | Automated backups **with a restore drill**, not just a backup schedule | ⬜ |
| **NFR-12** | pytest suite. First suite is cross-tenant isolation; second is the `commercial` context | ⬜ |
| **NFR-13** | A Node runtime for the app (Vercel or equivalent). Keep the 1.0 case study on Pages if the URL is wanted; the product needs a server. Real prices can never live in a static bundle | ⬜ |
| **NFR-14** | TypeScript strict, no `any`; `tsc --noEmit` clean; ruff + mypy clean | ✅ |
| **NFR-15** | Branch protection on `main`; every change a reviewed commit. Clear the 80-file working tree first | ⬜ |
| **NFR-16** | **DPDP Act** posture: India data residency, consent records, purpose limitation on the benchmark corpus, breach-notification runbook | ⬜ |
| **NFR-17** | Enterprise procurement readiness — SSO/SAML, SCIM, DPA + subprocessor list, SOC 2 Type I readiness, documented RTO/RPO, status page. None is engineering-hard; all is procurement-blocking, and all is cheaper designed for in Phase 1 than bolted on | ⬜ |
| **NFR-18** | Decide and document the 1.0 / 2.0 endgame in `CLAUDE.md` so feature work stops being a per-task judgment call | ⬜ |
| **NFR-19** | Price point must clear ₹499–2,999/mo for an individual, or a per-project fee. Global tools at $400–1,100/mo are structurally unsellable here | ⬜ |

---

## Part 4 — Market requirements

| ID | Requirement |
|---|---|
| **MR-1** | **ICP:** a homeowner building a ₹1–5 Cr design-led house in Bengaluru, coordinating 4+ specialist vendors themselves. Not volume interiors. Not builders |
| **MR-2** | **The claim to test:** *"a homeowner building a ₹1–5 Cr house in Bengaluru will pay for a system that tells them whether their quotes are fair and keeps their vendors coordinated."* One data point exists (the founder) and it is the most biased one available |
| **MR-3** | **Validation gate: five paying projects, run manually,** using 2.0/admin as the internal tool, at ₹50k–2L each. The number matters less than money changing hands. This is not a coding task |
| **MR-4** | Do not build past the gate. Phase 3 features are chosen by what those five customers ask for **unprompted** — likely RERA milestones and snag lifecycle, but let evidence choose |
| **MR-5** | **Positioning: the only owner-side advocate in India.** Every competitor — Livspace, HomeLane, DesignCafe, Brick & Bolt — is supply-side. Hold this line |
| **MR-6** | **Avoid head-on:** volume interiors (crowded, consolidating duopoly, well-funded) and tech-enabled contracting (Brick & Bolt owns it) |
| **MR-7** | **Cautionary precedent:** Sweeten (US) wound down in 2023 — pure-marketplace economics plus quality enforcement are brutal. Lead with service + software where quality is controllable, not with matching |
| **MR-8** | **The moat is a data asset (real BOQs and quotes, benchmarked) plus regulatory depth — not features.** Both compound with use. Neither can be bought. Neither is reachable through projects that aren't real customers' |

---

## Part 5 — Sequenced plan

### Phase 0 — This week (hygiene, hours not weeks)

- [ ] **FR-1.8** — composite `UNIQUE(project_id, slug)`. A correctness bug today, one hour
- [ ] **NFR-15** — commit or revert the 80-file working tree; turn on branch protection
- [ ] Write the cross-tenant isolation test **first**, watch it fail, then build tenancy against it
- [ ] `docs/research.md` is 1 line, `docs/sources.md` is empty — fill or delete

### Phase 1 — Make it safe (4–6 weeks) · *blocks customer #2*

FR-1.1 … FR-1.10, FR-3.2 (consent model decided here, not later), NFR-1, NFR-2, NFR-12.

**Exit:** org-A user 404s on every org-B resource, in the API *and* through PostgREST with the
anon key. Do not accept a second customer until this is green.

### Phase 2 — Make it operable (4–6 weeks)

NFR-3 … NFR-11, NFR-13. Ship the Node runtime here; it unblocks everything with a real price in it.

### Phase 3 — The lead magnet (3–4 weeks, overlaps Phase 2)

**FR-3.1 + FR-3.2** — the free "is my quote fair?" tool, seeded with the founder's own real BOQ
and quotes, anonymised and **behind the API, never in `data/*.ts`**. This is the only work that
acquires users and builds the moat simultaneously. Kukun proved the pattern.

### Phase 4 — Validation (8–12 weeks, overlapping, not a coding task)

**MR-3.** Five paying projects, run manually. Learn three things no amount of building reveals:
whether owners pay for coordination or only complain about its absence; which features they ask
for unprompted; and what the service costs to deliver, which decides whether software can ever
make it profitable.

### Phase 5 — Productise what the service proved

FR-3.3 … FR-3.8, ordered by Phase 4 evidence. Then NFR-16, NFR-17 when the first customer with a
procurement department appears.

---

## Part 6 — Locked constraints (from `.specify/memory/constitution.md`)

These win over any plan in this document.

1. The repository (`lib/repository.ts`) is the only data door.
2. Relations by ID, never by display name.
3. Only render a link if its public page exists.
4. `packages/contracts` is the contract — schema changes are their own reviewed feature.
5. Every entity belongs to exactly one project; slugs are unique **per project**.
6. Public side stays anonymized; genuinely sensitive figures stay out of `data/` entirely.
7. TypeScript strict, no `any`; theme tokens, never hardcoded hex.

---

## Open questions

1. **Org vs. project as the billing unit.** A homeowner is one org with one project; a studio like
   Anagami is one org with many. Pricing (NFR-19) has to pick one before FR-1.1 lands.
2. **Does the 1.0 tree survive?** (NFR-18.) It is a genuinely good case-study site and free
   marketing. But two frontends is a tax on every feature. Recommend: freeze 1.0 as a marketing
   artifact, build only in 2.0.
3. **Consent default for the benchmark corpus** (FR-3.2) — opt-in or opt-out? Opt-in is correct
   under DPDP and slower to reach k-anonymity. Recommend opt-in with an explicit "your data makes
   the benchmark better for you too" framing at project creation.
4. **Which state after Karnataka** for FR-3.6, and on what trigger.

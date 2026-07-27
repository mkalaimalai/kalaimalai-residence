# Technical Review — Kalaimalai Residence → Product

Date: 2026-07-26 · Reviewer: Claude Code · Scope: full repo (frontend 1.0 + 2.0, `apps/api/`, seed data, docs)

---

## 1. What exists today

Three things live in this repo, and they are at very different maturity levels.

| Layer | State | Assessment |
|---|---|---|
| **Public site (`app/`, 1.0)** | Complete, shipping to GitHub Pages | Production-quality. Server Components → `lib/repository.ts` → typed seed. |
| **Private portal (`app/portal/**`)** | Complete | Real Supabase Auth, client-side fetch via `lib/api-client.ts`, admin CRUD. |
| **Backend (`apps/api/`)** | Complete for one project, **not multi-tenant** | DDD/hexagonal FastAPI over Postgres, 7 bounded contexts, 26 controllers. |
| **Frontend 2.0 (`app/2.0/`)** | Uncommitted, 13 files | API-first, multi-project picker. This is the real product prototype. |

Verified during review: `npm run typecheck` passes clean, `npm run verify` passes (all relation chains resolve, all image paths exist).

### The architecture is genuinely good

The three rules that make this reusable as a product rather than a one-off site:

1. **Repository is the only data door** (`lib/repository.ts`) — swapping seed → API was a config flag (`DATA_SOURCE=api`), not a rewrite. That already happened successfully, which is the proof.
2. **Relations by ID, never by name** — every cross-reference is `*Ids: string[]` resolved at render time. A rename never severs a link.
3. **`types/index.ts` is a locked contract** — 14 entities shared by the seed, the API (camelCase-mapped), and both frontends.

This is the head start. Most people building in this space start with a CRUD app and discover the domain model 18 months in. You have a domain model derived from actually building a house.

### The backend has already outgrown the seed

Worth stating explicitly, because it's not in `CLAUDE.md`: `apps/api/` models entities that **do not exist in `data/*.ts`**:

- `Quote`, `QuoteLineItem` — vendor quoting workflow
- `PurchaseOrder`, `Delivery` — procurement execution
- `BOQLineItem`, `boq-packages` — BOQ decomposition
- `Inspection` — quality workflow beyond ad-hoc snags
- `Notification` — an eventing surface

That is no longer "a documentation site's backend." That is the skeleton of a construction-management SaaS. The seed is now the smaller of the two models.

---

## 2. Bounded contexts as they stand

```
project      Space, Domain, ProgressEntry, Project
commercial   BOQ, BOQLineItem, ProcurementItem, Material, Quote,
             QuoteLineItem, PurchaseOrder, Delivery      ← richest context
quality      Snag, Inspection, Decision
document     Drawing, GalleryItem, Lesson
vendor       Vendor
handover     Warranty
notification Notification
```

Each context has the full hexagonal stack (`domain/entities.py`, `domain/repository.py`, `application/use_cases.py`, `infrastructure/orm.py` + `repository_impl.py`, `interfaces/rest_controller.py`). A shared `crud.py` factory generates the standard routes with a `public_read` flag per resource — that flag is what keeps portal data out of the public build. Clean separation.

---

## 3. The blocking gaps

These are ranked by what actually stops this becoming an app. Everything else is secondary.

### 🔴 Gap 1 — There is no tenancy model. This is the one that matters.

Verified by inspection:

- `project_id` exists on **only 4 ORM models** (`orm.py:75,116,132,147` — the new commercial ones). `Space`, `Domain`, `Drawing`, `Snag`, `Vendor`, `Warranty`, `Decision`, `ProgressEntry` have **no `project_id` at all**.
- `apps/api/app/shared/auth.py` resolves a **global** role: `admin` or `viewer`, read from `user_metadata.role`. There is no organisation, no membership table, no per-project authorization.
- No row-level security anywhere in the codebase.

Consequence: **any authenticated admin can read and write every project's data.** Today that is fine — there is one project and one family. The moment there is a second customer it is a data breach. `app/2.0`'s project picker is currently a client-side filter over a shared pool, not an isolation boundary.

This is not a refactor you can defer. Retrofitting tenancy after customer data exists is the single most expensive migration in SaaS.

### 🟠 Gap 2 — Sensitive data has nowhere safe to live, by design

`next.config.ts` sets `output: "export"`. There is no server. Anything in `data/*.ts` ships to every visitor. The constitution correctly bans real prices from the seed — but that means the product's most valuable feature (**cost transparency and benchmarking**) is structurally impossible in the current deployment target.

A real product needs a Node runtime or server-rendered app. Static export was the right call for a case-study site and is the wrong call for the app.

### 🟡 Gap 3 — No tests, anywhere

`npm run verify` is a data-integrity script, not a test suite — and `CLAUDE.md` is honest about this ("There is no test runner"). For a documentation site that's a defensible trade. For a product handling payment milestones and BOQ figures, an untested `commercial` context is a liability. There is no pytest suite for the API either.

### 🟡 Gap 4 — Two frontends, one team

`app/` (Server Components, seed) and `app/2.0/` (client-side, API) render the same content by different means. Shared presentational components keep the cost down, but every feature is currently a decision about which tree gets it. Fine as a transition; expensive if it lasts.

---

## 4. What the existing business docs get right — and what they miss

`docs/business-brainstorm.html` and `docs/product-vision.html` are strong work. The market read is sound: the volume-interiors segment is a consolidating duopoly, tech-enabled contracting is being locked up, and the owner-side coordination layer is genuinely unserved.

The gap in those docs is that the **product scope outruns the build capacity by roughly an order of magnitude.** The vision names eight pillars — RERA engine, WhatsApp-native, 8 languages, payment/escrow, procurement marketplace, computer-vision site intelligence, snag lifecycle, 10-year Home OS. Each is a company. Attempting all eight is the most reliable way to ship none.

The review's contribution is narrowing. See below.

---

## 5. Where the unique Indian problem actually is

The vision doc lists many Indian-specific gaps. Only some are *defensible* — a gap is only a moat if a well-funded competitor can't close it in a quarter.

| Candidate | Defensible? | Why |
|---|---|---|
| Multi-language | ❌ | Localisation is a sprint for anyone funded. Table stakes, not a moat. |
| WhatsApp-native | ⚠️ | Correct channel insight, but the API is available to everyone. A distribution choice, not a moat. |
| Computer-vision site intelligence | ❌ (now) | Needs a labelled dataset you don't have. This is a year-3 feature that presupposes the data flywheel. |
| Procurement marketplace | ❌ (now) | Demand aggregation requires demand. Capital-intensive and wrong-ordered. |
| **RERA / approvals + milestone payments** | ✅ | State-by-state regulatory logic is slow, boring, and compounding. Once approvals live in the system, switching cost is near-infinite. |
| **Owner-side cost benchmarking** | ✅ | Every project adds a real quote to the corpus. Value grows with usage, and nobody owns it because everyone else is supply-side. |
| **Multi-vendor coordination for premium builds** | ✅ | This is the pain you personally lived, and the entity model already encodes it. |

The honest read: **your moat is a data asset (real BOQs and quotes, benchmarked) plus regulatory depth — not features.** Both compound. Neither can be bought.

And the sharpest positioning insight is one your own docs already contain but understate: *every existing player is supply-side.* Livspace, HomeLane, Brick & Bolt all sell to you while representing themselves. **There is no homeowner-side advocate in India.** That is the wedge, and the reason the product should stay owner-first even when it's commercially tempting to sell seats to builders.

---

## 6. Recommended next step

Do not build BuildHome. Build the smallest thing that proves a stranger will pay.

### The claim to test

> A homeowner building a ₹1–5 Cr house in Bengaluru will pay for a system that tells them whether their quotes are fair and keeps their vendors coordinated.

You have exactly one data point (yourself), and it's the most biased one available. Everything below is designed to get the second through tenth.

### Phase 0 — Make the platform multi-tenant (2–3 weeks, do this first)

Non-negotiable prerequisite. Nothing else is safe to build on top.

1. Add `organizations` and `memberships` (`user_id`, `org_id`, `role`) tables. Projects belong to orgs.
2. Add `project_id` to **every** entity — the 10 that lack it, not just the commercial 4.
3. Replace the global `admin`/`viewer` check in `shared/auth.py` with a scoped resolution: `(user, project) → role`. Enforce it in `shared/crud.py` so every generated route inherits it — that factory is the leverage point; one change covers 26 controllers.
4. Add Postgres RLS as defence in depth. Application-layer checks alone are one forgotten `WHERE` clause from a leak.
5. **Write the tenancy tests.** If exactly one part of this codebase has tests, it must be this part. `pytest` + one fixture per role, asserting cross-tenant reads 404.

### Phase 1 — Ship the cost-benchmark tool as a public utility (3–4 weeks)

The lead magnet, and the data flywheel's first turn.

- A free "Is my quote fair?" tool. User enters category, city, spec, quoted price. Returns a range with sample size and a confidence caveat.
- Seed the corpus with your own real BOQ and quotes — anonymised, and this time **behind the API, not in `data/*.ts`**.
- Every submission enriches the corpus. Value compounds per user, which is what the site cannot currently do.
- Requires moving off static export to a Node runtime (Vercel). Keep the case-study site on Pages if you like the URL; the app needs a server.

Why first: it's the only feature that acquires users and builds the moat simultaneously. Kukun proved the pattern; the vision doc already identifies it.

### Phase 2 — Sell the owner's-rep service manually to 5 homeowners (8–12 weeks, overlapping)

**This is the actual validation step, and it is not a coding task.**

Take five paying projects. Run coordination yourself using `app/2.0` as the internal tool. Charge — ₹50k–2L per project, whatever clears. The number matters less than the fact that money changes hands.

You will learn three things no amount of building reveals:
- Whether homeowners pay for coordination or only complain about its absence
- Which of the eight pillars they actually ask for unprompted
- What the service costs you to deliver, which determines whether software can ever make it profitable

Software follows demonstrated demand. Not before.

### Phase 3 — Productise what the service proved (post-validation)

Only now pick from the eight pillars, ordered by what the five customers actually demanded. Likely — but do not assume — RERA milestones and snag lifecycle. Let the evidence choose.

### What to explicitly defer

Computer vision. Procurement marketplace. Eight languages. Escrow. Financing. Every one is a real opportunity, and every one is fatal as a starting point. Revisit at 50+ projects.

---

## 7. Immediate engineering hygiene

Independent of strategy, worth doing this week:

- [ ] Commit or delete `app/2.0/` — 13 untracked files including the multi-project prototype is a real risk of loss
- [ ] Commit or revert the 8 modified files (`data/project.ts` is +202 lines of uncommitted work)
- [ ] Add `pytest` to `apps/api/` with tenancy tests as the first suite
- [ ] `docs/research.md` is 1 line, `docs/sources.md` is empty — fill or remove
- [ ] Decide the 1.0/2.0 endgame and write it into `CLAUDE.md`, so feature work stops being a per-task judgment call

---

## 8. Summary

**What you have:** a well-architected single-tenant construction-documentation platform with an unusually good domain model, a backend that has quietly grown into a procurement system, and market research that correctly identifies an unserved segment.

**What stands between it and a product:** tenancy, a server runtime, tests, and — most of all — evidence that someone other than you will pay.

**The one thing to do next:** Phase 0. Multi-tenancy is the only work that is *certainly* required no matter which of the eight pillars wins. Everything else should wait for five paying customers to tell you what to build.

The moat is the benchmark corpus and regulatory depth. Both compound with use, neither can be bought, and both are only reachable through projects that aren't your own.

# Residence Archive — iOS (native)

A **native SwiftUI** content viewer for the archive: the portfolio index, one project's
public site, its rooms, domains, gallery and material library. Read-only by design — it
calls the API's public endpoints only.

This is not a replacement for `apps/mobile`. That app is Expo/React Native and covers iOS
*and* Android from one codebase; this one is Swift and covers iOS alone, with native
navigation, `AsyncImage` and Dynamic Type. Both read the same API and render the same
entities. See "Why two mobile apps" below before adding a feature to either.

## Run it

```bash
# 1. the API must be running — there is no seed fallback here
cd apps/api && PYTHONPATH="$(pwd)" .venv/bin/python -m uvicorn app.main:app --port 8099

# 2. open and hit Run (scheme: ResidenceArchive)
open apps/ios/ResidenceArchive.xcodeproj
```

Or from the command line:

```bash
cd apps/ios
xcodebuild build -scheme ResidenceArchive -destination 'platform=iOS Simulator,name=iPhone 16'
```

Requires Xcode 16 (the project uses `objectVersion = 77`). Deployment target is iOS 17.

### Pointing it at the API

| Variable | Default | Notes |
|---|---|---|
| `API_URL` | `http://localhost:8099` | Where the FastAPI backend lives |
| `SITE_ORIGIN` | the GitHub Pages URL | Where **images** are served from |

Both are set in the shared scheme's *Run → Environment Variables*, so changing them is an
edit in Xcode rather than a rebuild of a config file. `Config.swift` also falls back to
`UserDefaults` (settable as the launch argument `-apiURL`), which is what makes it possible
to drive the app from `simctl` without touching the scheme.

> **On a physical device, `localhost` is the phone, not your Mac.** Set `API_URL` to your
> machine's LAN address (e.g. `http://192.168.1.5:8099`) or every screen shows the error
> state. The simulator is fine with localhost.

Two hosts are needed because the API returns **root-relative image paths**
(`/images/spaces/x.jpg`) and does not serve the files — they live in the web app's
`public/`. `imageURL(_:siteOrigin:)` absolutises them, mirroring `resolveImageUrl` in
`@kr/api-client`.

Plain-HTTP access to `localhost` and the local network is allowed by the two App Transport
Security exceptions in `ResidenceArchive-Info.plist`. Remove them once the API is deployed
behind TLS.

## Screens

| Screen | Shows | Endpoint |
|---|---|---|
| `PortfolioView` | Portfolio index | `GET /projects/public` |
| `ProjectDetailView` | Hero, concept, stats, rooms, domains | the five collections below |
| `SpaceDetailView` | Room detail + resolved relations | — (from the store) |
| `DomainDetailView` | Domain scope + its rooms | — (from the store) |
| `GalleryView` | Images grouped by category | — (from the store) |
| `MaterialsView` | Material library, searchable | — (from the store) |

Opening a project loads `spaces`, `domains`, `materials`, `gallery` and `vendors`
concurrently into a `ProjectStore`; every screen above it reads from that store. Only two
things fetch, and everything else resolves in memory.

## Rules this app inherits from the constitution

- **§5 — every collection GET passes `projectId`.** `APIClient.list` takes it as a
  *required* parameter, not an optional convenience, because omitting it returns every
  project's rows and would silently mix tenants.
- **§2 — relations are by ID, resolved at render time.** `byIds` / `byId` in `Models.swift`
  are pure functions over an already-loaded array — the native `lib/relations.ts`.
- **§3 — only link where a screen exists.** Rooms and domains push; vendors, drawings and
  decisions are portal-domain and render as inert chips or counts. Nothing here navigates
  into a dead end.
- **§6 — the public side stays anonymized.** The app calls `/projects/public`, which omits
  `internalName` / `villaNo` / `community` / `address` server-side. There is no code path
  in this app that can request them.

## What it shares with the web, and what it can't

It shares the **contract**, not the code. `Models.swift` is a hand-maintained Swift mirror
of `@kr/contracts`, and `APIClient.swift` mirrors `@kr/api-client`. Swift cannot import
TypeScript, so these are the one place where drift is possible — a field added to
`packages/contracts/src/index.ts` must be added here too. Decoding is strict, so drift
surfaces as a visible failure on first load rather than as a silently empty screen.

The theme is likewise re-declared in `Theme.swift` (SwiftUI has no CSS variables), same as
`apps/mobile/lib/theme.ts`. Three copies of the palette now exist; keep them in sync by hand.

## Why two mobile apps

`apps/mobile` exists because one Expo codebase covers both platforms cheaply. This app
exists to be genuinely native on iOS. They are not layered — neither depends on the other,
and deleting either leaves the other working. Add a screen to whichever you actually ship;
adding it to both doubles the maintenance for a viewer that is read-only either way.

## Not built yet

- **Sign-in.** Without a Supabase session the `require_user` endpoints are unreachable, so
  renderings and drawing sheets (`GET /media-sets`) are absent. `APIClient` has no token
  getter at all yet — that is the hook to add when it grows one.
- No offline caching: every launch re-fetches, and there is no persistence.
- No app icon or launch image, and no tests.
- No signing/distribution config, so this runs in the simulator and on a personally
  provisioned device, but does not produce a store binary.

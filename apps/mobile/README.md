# Residence Archive — mobile (iOS + Android)

An Expo / React Native **content viewer** for the archive. One codebase, both platforms.
Read-only by design: it calls the API's public endpoints only.

## Run it

```bash
npm install                 # from the repo root — workspaces install everything
npm run mobile              # or: npm run start --workspace @kr/mobile
# then press `i` for the iOS simulator, `a` for Android
```

The API must be running (`uvicorn app.main:app --port 8099` in `api/`), because unlike
the 1.0 web site there is no seed fallback here.

### Pointing it at the API

| Variable | Default | Notes |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | `http://localhost:8099` | Where the FastAPI backend lives |
| `EXPO_PUBLIC_SITE_ORIGIN` | the GitHub Pages URL | Where **images** are served from |

> **On a physical device, `localhost` is the phone, not your Mac.** Set
> `EXPO_PUBLIC_API_URL=http://<your-lan-ip>:8099` or the app will fail to load with a
> network error. The simulator is fine with localhost.

Two hosts are needed because the API returns **root-relative image paths**
(`/images/spaces/x.jpg`) and does not serve the files — they live in the web app's
`public/`. `resolveImageUrl()` in `@kr/api-client` absolutises them against
`SITE_ORIGIN`.

## Screens

| Route | Shows | Endpoint |
|---|---|---|
| `/` | Portfolio index | `GET /projects/public` |
| `/project/[id]` | Concept + room list | `GET /projects/public`, `GET /spaces?projectId=` |
| `/project/[id]/gallery` | Image grid | `GET /gallery?projectId=` |
| `/project/[id]/materials` | Material library by category | `GET /materials?projectId=` |
| `/space/[id]` | Room detail + relations | `GET /spaces/{id}`, then domains/materials/vendors scoped to its project |

Every collection call passes `projectId` — omitting it returns every project's rows
(constitution §5).

## What it shares with the web

- `@kr/contracts` — the entity interfaces (`Space`, `Domain`, …). One definition.
- `@kr/api-client` — transport, endpoint list, response types.

What it does **not** share: components (React Native has no DOM) and the theme, which is
re-declared natively in `lib/theme.ts` because RN has no CSS variables. Keep that file in
sync with `app/globals.css` by hand.

## Why this app is not an npm workspace member

**It installs on its own** — that is deliberate, and the one thing to preserve when
changing dependencies here.

React Native 0.76 requires React **18.3.1**; Next.js 16 requires React **19**. With the
app inside the workspace, npm hoisted part of Expo to the repo root and left
`expo-router`, `react-native` and `react` nested in `apps/mobile/node_modules`. Metro then
loaded `babel-preset-expo` from one tree and `expo-router` from the other, the preset
never inlined `EXPO_ROUTER_APP_ROOT`, and every bundle died on:

```
expo-router/_ctx.ios.js: Invalid call: process.env.EXPO_ROUTER_APP_ROOT
```

Adding a `babel.config.js`, exporting the env var by hand, and
`resolver.disableHierarchicalLookup` all failed to fix it, because none of them address
the split install. Taking the app out of the workspace and depending on the shared
packages via `file:` puts one consistent Expo tree in `apps/mobile/node_modules`, and both
platforms bundle.

Consequences to keep in mind:

- `npm install` at the repo root does **not** install this app. Run `npm install` in
  `apps/mobile` too (the root `mobile` script uses `npm --prefix`).
- `file:` deps are copied, not symlinked, on install — after changing
  `packages/contracts` or `packages/api-client`, re-run `npm install` here to pick it up.
  Metro still watches the real sources during `expo start`, so this only bites on a cold
  install.

## Not built yet

Sign-in (so no `require_user` endpoints — renderings and drawing sheets are unavailable),
gallery/materials/journey screens, offline caching, and app icons/splash. There is no
EAS build config yet either, so this runs in Expo Go / simulators but does not produce a
store binary.

# apps/android — native Kotlin/Compose viewer

A native Android client for the same FastAPI backend the web app and the Expo app use.
It is a **read-only public viewer**: the portfolio index, one project's detail, its
rooms, its gallery and its materials library — the "viewing" half of the web app,
nothing from the portal or the admin surface.

This is a plain Gradle build. It is **not** an npm workspace member and has no
`package.json`; nothing in the JS toolchain builds, lints or type-checks it.

## Running it

Requires Android Studio (or a standalone Android SDK + `ANDROID_HOME`). There is no
committed Gradle wrapper — generate one once, or just open the folder in Android Studio,
which does it for you:

```bash
cd apps/android
gradle wrapper --gradle-version 8.9   # only needed once
./gradlew assembleDebug
./gradlew installDebug                # to a running emulator or attached device
```

The API must be running (`cd apps/api && uvicorn app.main:app --reload --port 8099`).

## Pointing it at your API

Two values are compiled in as `BuildConfig` fields, overridable from
`apps/android/local.properties` (gitignored) or with `-P`:

| Property      | Default                                     | What it is                      |
| ------------- | ------------------------------------------- | ------------------------------- |
| `API_URL`     | `http://10.0.2.2:8099`                      | Origin of the FastAPI backend   |
| `SITE_ORIGIN` | `https://mkalaimalai-residence.github.io`   | Where images resolve against    |

`10.0.2.2` is the **emulator's** alias for the host machine's loopback — `localhost`
inside the emulator is the emulator itself, so it can never reach a local uvicorn. On a
physical device use your Mac's LAN address:

```bash
./gradlew installDebug -PAPI_URL=http://192.168.1.5:8099
```

Cleartext HTTP is permitted only for the loopback aliases (see
`res/xml/network_security_config.xml`); a build pointed at a real host still needs HTTPS.
Add your LAN address there if you test over Wi-Fi.

`SITE_ORIGIN` exists because image paths from the API are root-relative
(`/images/spaces/x.jpg`) and resolve against the **web app's** origin — the API serves no
files, and a native client has no origin of its own. Same reasoning as `resolveImageUrl`
in `packages/api-client`.

## Layout

```
data/Models.kt      Kotlin mirror of packages/contracts — only the fields this app renders
data/ApiClient.kt   OkHttp + kotlinx.serialization; the native counterpart of packages/api-client
ui/theme/Theme.kt   the palette from apps/web/app/globals.css, restated for Compose
ui/Common.kt        UiState + the loading/error shell + the shared card chrome
ui/ResidenceApp.kt  routes and the top bar
ui/screens/         projects, project detail, space detail, gallery, materials
```

## Constraints it inherits from the constitution

- **§5 — every collection fetch passes `projectId`.** The API returns *every* project's
  rows when it is omitted, which on a portfolio-wide app silently merges two houses.
  That is why `SpaceDetailScreen` takes a `projectId` it never displays: it scopes the
  lookup.
- **§6 — public means anonymized.** The app calls `/projects/public`, never `/projects`.
  Villa number, community and address are not in the response and must not be added.
- **§3 — only link what has a public page.** Vendors, drawings and decisions are
  portal-domain, so space relations are not resolved into navigable chips here.
- **§4 — `packages/contracts` is the contract.** `Models.kt` is a hand-kept mirror, not a
  generated file. `ignoreUnknownKeys` means *adding* a field to the contract is safe, but
  *renaming* one silently empties a screen — grep here when you change the contract.

## Not implemented

No authentication, so anything behind `require_user` is out of reach — most visibly
`/media-sets`, meaning renderings and drawing sheets have no tab here the way they do in
the 2.0 web tree. Wire Supabase auth into `ApiClient` (a token getter on each request,
mirroring `lib/api-v2.ts`) before adding those screens.

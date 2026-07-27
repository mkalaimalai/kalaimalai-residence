import Foundation

/// Where the app points, and why it needs two hosts.
///
/// The API returns **root-relative** image paths (`/images/spaces/x.jpg`) and does not
/// serve the files — they live in the web app's `public/`. A native client has no origin
/// of its own, so every image path must be absolutised against the deployed site. This
/// mirrors `resolveImageUrl` in `@kr/api-client` and `SITE_ORIGIN` in `apps/mobile`.
enum Config {
    /// Origin of the FastAPI backend, no trailing slash.
    ///
    /// Resolution order, so the same binary works in the simulator, on a device and in a
    /// test run without an edit:
    /// 1. `API_URL` in the scheme's environment variables
    /// 2. `apiURL` in `UserDefaults` (settable as the launch argument `-apiURL <value>`)
    /// 3. the local dev default
    ///
    /// **On a physical device `localhost` is the phone, not your Mac** — set `API_URL` to
    /// your machine's LAN address (e.g. `http://192.168.1.5:8099`) or every request fails.
    static let apiURL: URL = url(
        forKey: "API_URL",
        defaultsKey: "apiURL",
        fallback: "http://localhost:8099"
    )

    /// Where the *images* are served from — the web app's origin, not the API's.
    static let siteOrigin: URL = url(
        forKey: "SITE_ORIGIN",
        defaultsKey: "siteOrigin",
        fallback: "https://mkalaimalai-residence.github.io"
    )

    private static func url(forKey env: String, defaultsKey: String, fallback: String) -> URL {
        let raw = ProcessInfo.processInfo.environment[env]
            ?? UserDefaults.standard.string(forKey: defaultsKey)
            ?? fallback
        // A malformed override should surface as a broken build setting, not as a silent
        // fall-through to production, so trim and validate rather than defaulting quietly.
        let trimmed = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        guard let url = URL(string: trimmed), url.scheme != nil else {
            preconditionFailure("\(env) is not a valid URL: \(raw)")
        }
        return url
    }
}

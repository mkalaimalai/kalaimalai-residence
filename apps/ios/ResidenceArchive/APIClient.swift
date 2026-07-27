import Foundation

/// Thrown on any non-2xx response, carrying the status so callers can branch on 401 —
/// same contract as `ApiError` in `@kr/api-client`.
struct APIError: LocalizedError, Sendable {
    let status: Int
    let path: String

    var errorDescription: String? {
        switch status {
        case 401: "Sign-in required for \(path)."
        case 404: "Not found: \(path)."
        case 500...: "The server failed on \(path)."
        default: "Request failed (\(status)) for \(path)."
        }
    }
}

/// Native binding to the FastAPI backend — the Swift counterpart of `@kr/api-client`.
///
/// Read-only by design: this app calls the **public** endpoints only, so there is no
/// session and no `Authorization` header. That is what limits it to `/projects/public`,
/// `/spaces`, `/domains`, `/materials`, `/gallery` and `/vendors`; the `require_user`
/// endpoints (renderings and drawing sheets, via `/media-sets`) stay out of reach until
/// the app grows a Supabase login.
struct APIClient: Sendable {
    let baseURL: URL
    let session: URLSession

    init(baseURL: URL = Config.apiURL, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
    }

    // MARK: - Transport

    private func get<T: Decodable>(_ path: String, query: [URLQueryItem] = []) async throws -> T {
        guard var components = URLComponents(
            url: baseURL.appendingPathComponent(path),
            resolvingAgainstBaseURL: false
        ) else {
            throw APIError(status: -1, path: path)
        }
        if !query.isEmpty { components.queryItems = query }
        guard let url = components.url else { throw APIError(status: -1, path: path) }

        let (data, response) = try await session.data(from: url)
        guard let http = response as? HTTPURLResponse else {
            throw APIError(status: -1, path: path)
        }
        guard (200..<300).contains(http.statusCode) else {
            throw APIError(status: http.statusCode, path: path)
        }
        return try JSONDecoder().decode(T.self, from: data)
    }

    /// Collection GETs are project-scoped: the API filters on `project_id` when
    /// `projectId` is present and returns **every project's rows** when it is not. Any
    /// caller rendering a single project must pass it — constitution §5. That is why
    /// `projectId` is a required parameter here rather than an optional convenience.
    private func list<T: Decodable>(_ path: String, projectId: String) async throws -> [T] {
        try await get(path, query: [URLQueryItem(name: "projectId", value: projectId)])
    }

    // MARK: - Endpoints

    /// The portfolio index. Public — anonymized identity only.
    func publicProjects() async throws -> [PublicProject] {
        try await get("/projects/public")
    }

    func spaces(projectId: String) async throws -> [Space] {
        try await list("/spaces", projectId: projectId)
    }

    func domains(projectId: String) async throws -> [Domain] {
        try await list("/domains", projectId: projectId)
    }

    func materials(projectId: String) async throws -> [Material] {
        try await list("/materials", projectId: projectId)
    }

    func gallery(projectId: String) async throws -> [GalleryItem] {
        try await list("/gallery", projectId: projectId)
    }

    func vendors(projectId: String) async throws -> [Vendor] {
        try await list("/vendors", projectId: projectId)
    }
}

// MARK: - Images

/// Absolutise a root-relative image path against the site origin.
///
/// The API returns paths like `/images/spaces/x.jpg` and does not serve the files — the
/// web app's `public/` does. Mirrors `resolveImageUrl` in `@kr/api-client`.
/// Returns `nil` for an empty path so callers can render a placeholder instead of
/// firing a request that is guaranteed to 404.
func imageURL(_ path: String, siteOrigin: URL = Config.siteOrigin) -> URL? {
    let trimmed = path.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty else { return nil }
    if trimmed.lowercased().hasPrefix("http://") || trimmed.lowercased().hasPrefix("https://") {
        return URL(string: trimmed)
    }
    return URL(string: trimmed.hasPrefix("/") ? String(trimmed.dropFirst()) : trimmed,
               relativeTo: siteOrigin)?.absoluteURL
}

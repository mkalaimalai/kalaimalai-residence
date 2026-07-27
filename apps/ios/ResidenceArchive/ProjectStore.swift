import Foundation
import Observation

/// Everything one project's screens need, loaded once and shared down the stack.
///
/// Why a store rather than a `.task` per screen: constitution §2 says relations resolve
/// from an **already-loaded** source array at render time. A room lists its domains,
/// materials and vendors by id, so the detail screen must hold those collections — not
/// fetch one entity at a time. Loading the five collections together also means opening a
/// room is instant instead of showing a second spinner.
///
/// Scoped to a single project by construction: `projectId` is a `let`, so there is no way
/// to render project A's rooms while holding project B's materials.
@MainActor
@Observable
final class ProjectStore {
    struct Content: Sendable {
        var spaces: [Space]
        var domains: [Domain]
        var materials: [Material]
        var gallery: [GalleryItem]
        var vendors: [Vendor]
    }

    let project: PublicProject
    private let client: APIClient

    private(set) var state: Loadable<Content> = .idle

    init(project: PublicProject, client: APIClient = APIClient()) {
        self.project = project
        self.client = client
    }

    var content: Content? { state.value }

    /// Idempotent: safe to call from `.task`, which re-runs when the view re-appears.
    func loadIfNeeded() async {
        if case .idle = state {} else { return }
        await load()
    }

    func load() async {
        state = .loading
        let id = project.id
        do {
            // The five collections are independent, so fetch them concurrently rather than
            // paying five sequential round-trips.
            async let spaces = client.spaces(projectId: id)
            async let domains = client.domains(projectId: id)
            async let materials = client.materials(projectId: id)
            async let gallery = client.gallery(projectId: id)
            async let vendors = client.vendors(projectId: id)

            state = .loaded(
                Content(
                    spaces: try await spaces,
                    domains: try await domains,
                    materials: try await materials,
                    gallery: try await gallery,
                    vendors: try await vendors
                )
            )
        } catch {
            state = .failed(error)
        }
    }
}

/// The portfolio index — the one screen that is not project-scoped.
@MainActor
@Observable
final class PortfolioStore {
    private let client: APIClient
    private(set) var state: Loadable<[PublicProject]> = .idle

    init(client: APIClient = APIClient()) {
        self.client = client
    }

    func loadIfNeeded() async {
        if case .idle = state {} else { return }
        await load()
    }

    func load() async {
        state = .loading
        do {
            state = .loaded(try await client.publicProjects())
        } catch {
            state = .failed(error)
        }
    }
}

import Foundation

/// Swift mirror of `@kr/contracts` — the locked entity contract (constitution §4).
///
/// Only the read-side entities this viewer renders are modelled. Property names match the
/// API's camelCase exactly, so no `CodingKeys` are needed; decoding is deliberately strict
/// so a contract drift fails loudly here instead of rendering a half-empty screen.
///
/// `status` fields stay `String` rather than becoming enums on purpose: the API may add a
/// status without a client release, and a strict enum would turn that into a decode crash.
/// `StatusStyle` maps the known values for display and degrades gracefully for the rest.

/// `Project` minus the portal-only identity fields (`internalName`, `villaNo`,
/// `community`, `address`) that constitution §6 keeps off the public side.
/// This is the shape of `GET /projects/public`.
struct PublicProject: Codable, Identifiable, Hashable, Sendable {
    let id: String
    let publicTitle: String
    let publicSubtitle: String
    let city: String
    let designer: String
    let direction: String
    let heroImage: String
    let conceptStatement: String
    let plotArea: String
    let builtUpArea: String
    let floors: Int
    let status: String
    let startDate: String
}

struct Space: Codable, Identifiable, Hashable, Sendable {
    let projectId: String
    let id: String
    let slug: String
    let name: String
    let description: String
    let designIntent: String
    let image: String
    let domainIds: [String]
    let materialIds: [String]
    /// Free text, not a linked entity — same as the web contract.
    let furniture: [String]
    let lighting: [String]
    let vendorIds: [String]
    let drawingIds: [String]
    let decisionIds: [String]
    let status: String
    let lessonIds: [String]
}

struct Domain: Codable, Identifiable, Hashable, Sendable {
    let projectId: String
    let id: String
    let slug: String
    let name: String
    let description: String
    let spaceIds: [String]
    let drawingIds: [String]
    let vendorIds: [String]
    let status: String
    let lessonIds: [String]
}

struct Material: Codable, Identifiable, Hashable, Sendable {
    let projectId: String
    let id: String
    let name: String
    let category: String
    let spaceIds: [String]
    let vendorId: String
    let status: String
    let image: String
    let notes: String
}

struct GalleryItem: Codable, Identifiable, Hashable, Sendable {
    let projectId: String
    let id: String
    let title: String
    let category: String
    let image: String
    /// `""` when not space-specific.
    let spaceId: String
    /// `""` when not domain-specific.
    let domainId: String
    let caption: String
}

struct Vendor: Codable, Identifiable, Hashable, Sendable {
    let projectId: String
    let id: String
    let name: String
    let category: String
    let location: String
    let finalized: Bool
    let rating: Double
}

// MARK: - Relations

/// Resolve `*Ids` to records — the native equivalent of `lib/relations.ts`.
///
/// Constitution §2: every cross-reference is by ID, never by display name, and resolution
/// happens at render time from an already-loaded source array. These are pure functions
/// over collections the caller already holds; they never fetch.
extension Array where Element: Identifiable, Element.ID == String {
    /// Records for `ids`, in the order the ids were given, skipping ones that don't resolve.
    func byIds(_ ids: [String]) -> [Element] {
        let index = Dictionary(map { ($0.id, $0) }, uniquingKeysWith: { first, _ in first })
        return ids.compactMap { index[$0] }
    }

    func byId(_ id: String) -> Element? {
        first { $0.id == id }
    }
}

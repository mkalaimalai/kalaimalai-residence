import SwiftUI

@main
struct ResidenceArchiveApp: App {
    var body: some Scene {
        WindowGroup {
            PortfolioView()
                .tint(Theme.accent)
        }
    }
}

/// Destinations *within* one project.
///
/// Deliberately a different type from the root's `PublicProject` destination. A
/// `NavigationStack` resolves `navigationDestination` by value type, and registering the
/// same type twice in one stack is undefined — so the root registers `PublicProject` and
/// `ProjectDetailView` registers `ProjectRoute`, and the two never collide.
///
/// Rooms and domains are pushed **by value** because the store has already loaded them;
/// pushing an id would mean re-fetching what we are holding.
enum ProjectRoute: Hashable {
    case space(Space)
    case domain(Domain)
    case gallery
    case materials
}

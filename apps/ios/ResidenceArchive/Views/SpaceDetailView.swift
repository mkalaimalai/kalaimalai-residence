import SwiftUI

/// One room. Mirrors the web's `/[projectId]/spaces/[slug]`.
///
/// Every relation on this screen is resolved from the store's already-loaded collections
/// via `byIds` — constitution §2. Nothing here fetches.
///
/// Constitution §3 decides what is tappable: **domains** have a screen in this app, so
/// they push; **vendors** are portal-domain and render as inert chips. Drawings and
/// decisions are portal-domain too and are shown as counts rather than as links to
/// nowhere. Materials get a chip each — the materials screen is a flat library, not a
/// per-material page.
struct SpaceDetailView: View {
    let space: Space
    let store: ProjectStore

    private var content: ProjectStore.Content? { store.content }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                RemoteImage(path: space.image, aspectRatio: 16 / 10)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.lg))

                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    Text(space.name)
                        .font(.editorialTitle(26))
                        .foregroundStyle(Theme.foreground)
                    StatusBadge(status: space.status)
                }

                if !space.description.isEmpty {
                    LabeledSection(title: "Overview") { Prose(text: space.description) }
                }

                if !space.designIntent.isEmpty {
                    LabeledSection(title: "Design intent") { Prose(text: space.designIntent) }
                }

                if let content {
                    domains(content)
                    materials(content)
                    vendors(content)
                }

                if !space.furniture.isEmpty {
                    LabeledSection(title: "Furniture") { WrappingChips(items: space.furniture) }
                }

                if !space.lighting.isEmpty {
                    LabeledSection(title: "Lighting") { WrappingChips(items: space.lighting) }
                }

                portalOnlyCounts
            }
            .padding(Theme.Spacing.md)
        }
        .background(Theme.background)
        .navigationTitle(space.name)
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: - Relations

    @ViewBuilder
    private func domains(_ content: ProjectStore.Content) -> some View {
        let resolved = content.domains.byIds(space.domainIds)
        if !resolved.isEmpty {
            LabeledSection(title: "Domains") {
                VStack(spacing: Theme.Spacing.sm) {
                    ForEach(resolved) { domain in
                        NavigationLink(value: ProjectRoute.domain(domain)) {
                            HStack {
                                Text(domain.name)
                                    .font(.callout)
                                    .foregroundStyle(Theme.foreground)
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .font(.caption)
                                    .foregroundStyle(Theme.muted)
                            }
                            .padding(Theme.Spacing.md)
                            .background(Theme.card, in: RoundedRectangle(cornerRadius: Theme.Radius.md))
                            .overlay(
                                RoundedRectangle(cornerRadius: Theme.Radius.md)
                                    .stroke(Theme.border, lineWidth: 1)
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    @ViewBuilder
    private func materials(_ content: ProjectStore.Content) -> some View {
        let resolved = content.materials.byIds(space.materialIds)
        if !resolved.isEmpty {
            LabeledSection(title: "Materials") {
                WrappingChips(items: resolved.map(\.name))
            }
        }
    }

    @ViewBuilder
    private func vendors(_ content: ProjectStore.Content) -> some View {
        let resolved = content.vendors.byIds(space.vendorIds)
        if !resolved.isEmpty {
            LabeledSection(title: "Vendors") {
                // Read-only: vendors have no public page, so no link (constitution §3).
                WrappingChips(items: resolved.map(\.name))
            }
        }
    }

    /// Drawings and decisions live in the portal, not here. Showing the counts keeps the
    /// room's real shape visible without implying a tap target that does not exist.
    @ViewBuilder
    private var portalOnlyCounts: some View {
        let counts = [
            ("Drawings", space.drawingIds.count),
            ("Decisions", space.decisionIds.count),
            ("Lessons", space.lessonIds.count),
        ].filter { $0.1 > 0 }

        if !counts.isEmpty {
            LabeledSection(title: "In the portal") {
                WrappingChips(items: counts.map { "\($0.0): \($0.1)" })
            }
        }
    }
}

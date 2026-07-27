import SwiftUI

/// One domain (Architecture, Lighting, Carpentry, …). Mirrors the web's
/// `/[projectId]/domains/[slug]`.
///
/// A domain's rooms resolve out of the store's already-loaded `spaces` and push onto the
/// same stack, so the room ↔ domain relationship is walkable in both directions — the same
/// chain `npm run verify` checks on the data side.
struct DomainDetailView: View {
    let domain: Domain
    let store: ProjectStore

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    Text(domain.name)
                        .font(.editorialTitle(26))
                        .foregroundStyle(Theme.foreground)
                    StatusBadge(status: domain.status)
                }

                if !domain.description.isEmpty {
                    LabeledSection(title: "Scope") { Prose(text: domain.description) }
                }

                if let content = store.content {
                    let rooms = content.spaces.byIds(domain.spaceIds)
                    if !rooms.isEmpty {
                        LabeledSection(title: "Rooms · \(rooms.count)") {
                            VStack(spacing: Theme.Spacing.sm) {
                                ForEach(rooms) { space in
                                    NavigationLink(value: ProjectRoute.space(space)) {
                                        HStack(spacing: Theme.Spacing.md) {
                                            RemoteImage(path: space.image, aspectRatio: 1)
                                                .frame(width: 56, height: 56)
                                                .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.sm))
                                            Text(space.name)
                                                .font(.callout)
                                                .foregroundStyle(Theme.foreground)
                                            Spacer()
                                            Image(systemName: "chevron.right")
                                                .font(.caption)
                                                .foregroundStyle(Theme.muted)
                                        }
                                        .padding(Theme.Spacing.sm)
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

                    let vendors = content.vendors.byIds(domain.vendorIds)
                    if !vendors.isEmpty {
                        LabeledSection(title: "Vendors") {
                            WrappingChips(items: vendors.map(\.name))
                        }
                    }
                }

                if !domain.drawingIds.isEmpty {
                    LabeledSection(title: "In the portal") {
                        WrappingChips(items: ["Drawings: \(domain.drawingIds.count)"])
                    }
                }
            }
            .padding(Theme.Spacing.md)
        }
        .background(Theme.background)
        .navigationTitle(domain.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}

import SwiftUI

/// One project's public site, condensed into a single scroll: hero, concept statement,
/// the stats, entries into gallery/materials, then the rooms and the domains.
///
/// Mirrors the web's `/[projectId]` page. This is the screen that owns the project's
/// `ProjectStore` and publishes it to everything pushed above it, so a room detail can
/// resolve its `domainIds` / `materialIds` / `vendorIds` without a second fetch.
struct ProjectDetailView: View {
    @State var store: ProjectStore

    private var project: PublicProject { store.project }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                RemoteImage(path: project.heroImage, aspectRatio: 16 / 10)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.lg))

                header

                LabeledSection(title: "Concept") {
                    Prose(text: project.conceptStatement)
                }

                StatGrid(stats: stats)

                LoadableView(state: store.state, retry: { Task { await store.load() } }) { content in
                    VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                        browseLinks(content)
                        rooms(content.spaces)
                        domains(content.domains)
                    }
                }
            }
            .padding(Theme.Spacing.md)
        }
        .background(Theme.background)
        .navigationTitle(project.city)
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(for: ProjectRoute.self) { route in
            destination(route)
        }
        .refreshable { await store.load() }
        .task { await store.loadIfNeeded() }
    }

    // MARK: - Sections

    private var header: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            Text(project.publicTitle)
                .font(.editorialTitle(28))
                .foregroundStyle(Theme.foreground)
            Text(project.publicSubtitle)
                .font(.callout)
                .foregroundStyle(Theme.muted)
            HStack(spacing: Theme.Spacing.sm) {
                Chip(text: project.designer)
                Chip(text: project.direction)
            }
            .padding(.top, Theme.Spacing.xs)
        }
    }

    private var stats: [(label: String, value: String)] {
        [
            ("Plot area", project.plotArea),
            ("Built-up area", project.builtUpArea),
            ("Floors", String(project.floors)),
            ("Status", project.status),
            ("Started", project.startDate),
        ].filter { !$0.1.isEmpty }
    }

    private func browseLinks(_ content: ProjectStore.Content) -> some View {
        HStack(spacing: Theme.Spacing.md) {
            NavigationLink(value: ProjectRoute.gallery) {
                BrowseTile(icon: "photo.on.rectangle.angled",
                           title: "Gallery",
                           count: content.gallery.count)
            }
            NavigationLink(value: ProjectRoute.materials) {
                BrowseTile(icon: "square.grid.2x2",
                           title: "Materials",
                           count: content.materials.count)
            }
        }
        .buttonStyle(.plain)
    }

    private func rooms(_ spaces: [Space]) -> some View {
        LabeledSection(title: "Rooms · \(spaces.count)") {
            if spaces.isEmpty {
                EmptyState(icon: "door.left.hand.closed", message: "No rooms yet.")
            } else {
                LazyVStack(spacing: Theme.Spacing.md) {
                    ForEach(spaces) { space in
                        NavigationLink(value: ProjectRoute.space(space)) {
                            SpaceRow(space: space)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private func domains(_ domains: [Domain]) -> some View {
        LabeledSection(title: "Domains · \(domains.count)") {
            LazyVStack(spacing: Theme.Spacing.sm) {
                ForEach(domains) { domain in
                    NavigationLink(value: ProjectRoute.domain(domain)) {
                        DomainRow(domain: domain)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    /// Routes pushed above this screen still need the project's collections, so each one
    /// is handed the same store rather than constructing its own.
    @ViewBuilder
    private func destination(_ route: ProjectRoute) -> some View {
        switch route {
        case .space(let space):
            SpaceDetailView(space: space, store: store)
        case .domain(let domain):
            DomainDetailView(domain: domain, store: store)
        case .gallery:
            GalleryView(store: store)
        case .materials:
            MaterialsView(store: store)
        }
    }
}

// MARK: - Rows

private struct BrowseTile: View {
    let icon: String
    let title: String
    let count: Int

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(Theme.accent)
            Text(title)
                .font(.callout.weight(.medium))
                .foregroundStyle(Theme.foreground)
            Text("\(count) items")
                .font(.caption)
                .foregroundStyle(Theme.muted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(Theme.Spacing.md)
        .background(Theme.card, in: RoundedRectangle(cornerRadius: Theme.Radius.md))
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Radius.md).stroke(Theme.border, lineWidth: 1)
        )
    }
}

private struct SpaceRow: View {
    let space: Space

    var body: some View {
        HStack(spacing: Theme.Spacing.md) {
            RemoteImage(path: space.image, aspectRatio: 1)
                .frame(width: 84, height: 84)
                .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.sm))

            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                Text(space.name)
                    .font(.callout.weight(.medium))
                    .foregroundStyle(Theme.foreground)
                Text(space.description)
                    .font(.caption)
                    .foregroundStyle(Theme.muted)
                    .lineLimit(2)
                StatusBadge(status: space.status)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(Theme.muted)
        }
        .padding(Theme.Spacing.sm)
        .background(Theme.card, in: RoundedRectangle(cornerRadius: Theme.Radius.md))
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Radius.md).stroke(Theme.border, lineWidth: 1)
        )
    }
}

private struct DomainRow: View {
    let domain: Domain

    var body: some View {
        HStack(spacing: Theme.Spacing.md) {
            VStack(alignment: .leading, spacing: 2) {
                Text(domain.name)
                    .font(.callout.weight(.medium))
                    .foregroundStyle(Theme.foreground)
                Text(domain.description)
                    .font(.caption)
                    .foregroundStyle(Theme.muted)
                    .lineLimit(2)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            StatusBadge(status: domain.status)
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(Theme.muted)
        }
        .padding(Theme.Spacing.md)
        .background(Theme.card, in: RoundedRectangle(cornerRadius: Theme.Radius.md))
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Radius.md).stroke(Theme.border, lineWidth: 1)
        )
    }
}

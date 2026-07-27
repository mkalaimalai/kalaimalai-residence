import SwiftUI

/// The material library, grouped by category and searchable.
/// Mirrors the web's `/[projectId]/materials` (and `MaterialsLibrary` on 1.0).
///
/// Each material lists the rooms it appears in, resolved from the store's `spaces` — the
/// reverse of the room screen's material chips, and the reason both are useful.
struct MaterialsView: View {
    let store: ProjectStore

    @State private var query = ""

    private var materials: [Material] { store.content?.materials ?? [] }
    private var spaces: [Space] { store.content?.spaces ?? [] }

    private var filtered: [Material] {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return materials }
        return materials.filter {
            $0.name.localizedCaseInsensitiveContains(trimmed)
                || $0.category.localizedCaseInsensitiveContains(trimmed)
                || $0.notes.localizedCaseInsensitiveContains(trimmed)
        }
    }

    private var groups: [(category: String, items: [Material])] {
        Dictionary(grouping: filtered, by: \.category)
            .sorted { $0.key < $1.key }
            .map { (category: $0.key, items: $0.value.sorted { $0.name < $1.name }) }
    }

    var body: some View {
        ScrollView {
            if filtered.isEmpty {
                EmptyState(
                    icon: "square.grid.2x2",
                    message: materials.isEmpty
                        ? "No materials in this project yet."
                        : "No material matches “\(query)”."
                )
            } else {
                LazyVStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                    ForEach(groups, id: \.category) { group in
                        LabeledSection(title: group.category) {
                            VStack(spacing: Theme.Spacing.sm) {
                                ForEach(group.items) { material in
                                    MaterialRow(
                                        material: material,
                                        rooms: spaces.byIds(material.spaceIds).map(\.name)
                                    )
                                }
                            }
                        }
                    }
                }
                .padding(Theme.Spacing.md)
            }
        }
        .background(Theme.background)
        .navigationTitle("Materials")
        .navigationBarTitleDisplayMode(.inline)
        .searchable(text: $query, prompt: "Search materials")
    }
}

private struct MaterialRow: View {
    let material: Material
    let rooms: [String]

    var body: some View {
        HStack(alignment: .top, spacing: Theme.Spacing.md) {
            RemoteImage(path: material.image, aspectRatio: 1)
                .frame(width: 64, height: 64)
                .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.sm))

            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                HStack {
                    Text(material.name)
                        .font(.callout.weight(.medium))
                        .foregroundStyle(Theme.foreground)
                    Spacer()
                    StatusBadge(status: material.status)
                }
                if !material.notes.isEmpty {
                    Text(material.notes)
                        .font(.caption)
                        .foregroundStyle(Theme.muted)
                        .lineLimit(3)
                }
                if !rooms.isEmpty {
                    Text(rooms.joined(separator: " · "))
                        .font(.caption2)
                        .foregroundStyle(Theme.accent)
                        .lineLimit(2)
                }
            }
        }
        .padding(Theme.Spacing.sm)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.card, in: RoundedRectangle(cornerRadius: Theme.Radius.md))
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Radius.md).stroke(Theme.border, lineWidth: 1)
        )
    }
}

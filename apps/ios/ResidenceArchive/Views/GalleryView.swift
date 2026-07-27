import SwiftUI

/// The project's images, grouped by the contract's `GalleryCategory`.
/// Mirrors the web's `/[projectId]/gallery`.
struct GalleryView: View {
    let store: ProjectStore

    @State private var selected: GalleryItem?

    private var items: [GalleryItem] { store.content?.gallery ?? [] }

    /// Grouped by category, with the categories in the contract's declared order rather
    /// than alphabetically — renders first, handover last, which is how the archive reads.
    private static let categoryOrder = [
        "render", "drawing", "progress", "final",
        "material", "furniture", "lighting", "landscape",
    ]

    private var groups: [(category: String, items: [GalleryItem])] {
        let grouped = Dictionary(grouping: items, by: \.category)
        return grouped
            .sorted { lhs, rhs in
                let l = Self.categoryOrder.firstIndex(of: lhs.key) ?? Self.categoryOrder.count
                let r = Self.categoryOrder.firstIndex(of: rhs.key) ?? Self.categoryOrder.count
                return l == r ? lhs.key < rhs.key : l < r
            }
            .map { (category: $0.key, items: $0.value) }
    }

    var body: some View {
        ScrollView {
            if items.isEmpty {
                EmptyState(icon: "photo.on.rectangle", message: "No images in this project yet.")
            } else {
                LazyVStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                    ForEach(groups, id: \.category) { group in
                        LabeledSection(title: "\(group.category) · \(group.items.count)") {
                            LazyVGrid(
                                columns: [GridItem(.adaptive(minimum: 150), spacing: Theme.Spacing.sm)],
                                spacing: Theme.Spacing.sm
                            ) {
                                ForEach(group.items) { item in
                                    Button { selected = item } label: {
                                        RemoteImage(path: item.image, aspectRatio: 1)
                                            .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.sm))
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                    }
                }
                .padding(Theme.Spacing.md)
            }
        }
        .background(Theme.background)
        .navigationTitle("Gallery")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(item: $selected) { item in
            GalleryItemSheet(item: item)
        }
    }
}

/// Full-bleed view of one image with its caption. A sheet rather than a pushed screen:
/// looking at an image is a detour, not a step deeper into the archive.
private struct GalleryItemSheet: View {
    let item: GalleryItem
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                    RemoteImage(path: item.image, aspectRatio: 4 / 3)
                        .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.md))
                    Text(item.title)
                        .font(.editorialTitle(20))
                        .foregroundStyle(Theme.foreground)
                    if !item.caption.isEmpty {
                        Prose(text: item.caption)
                    }
                    Chip(text: item.category)
                }
                .padding(Theme.Spacing.md)
            }
            .background(Theme.background)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

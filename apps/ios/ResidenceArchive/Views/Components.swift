import SwiftUI

/// Async image with the archive's placeholder treatment.
///
/// Paths arrive root-relative and are absolutised against the *site* origin, not the API —
/// see `imageURL(_:siteOrigin:)`. An empty path resolves to `nil` and renders the
/// placeholder without firing a doomed request; not every entity has an image (materials
/// frequently don't).
struct RemoteImage: View {
    let path: String
    var aspectRatio: CGFloat = 4 / 3

    var body: some View {
        Rectangle()
            .fill(Theme.surface)
            .aspectRatio(aspectRatio, contentMode: .fit)
            .overlay {
                if let url = imageURL(path) {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .success(let image):
                            image.resizable().scaledToFill()
                        case .failure:
                            placeholder(icon: "photo.badge.exclamationmark")
                        case .empty:
                            ProgressView().tint(Theme.muted)
                        @unknown default:
                            placeholder(icon: "photo")
                        }
                    }
                } else {
                    placeholder(icon: "photo")
                }
            }
            .clipped()
    }

    private func placeholder(icon: String) -> some View {
        Image(systemName: icon)
            .font(.title3)
            .foregroundStyle(Theme.muted.opacity(0.6))
    }
}

/// Status pill — spaces, domains and materials all carry one.
struct StatusBadge: View {
    let status: String

    var body: some View {
        Text(status)
            .font(.caption2.weight(.medium))
            .padding(.horizontal, Theme.Spacing.sm)
            .padding(.vertical, Theme.Spacing.xs)
            .background(StatusStyle.color(for: status).opacity(0.14), in: Capsule())
            .foregroundStyle(StatusStyle.color(for: status))
    }
}

/// A read-only chip.
///
/// Constitution §3 — only render a link if its public page exists. Domains and rooms have
/// screens in this app and are pushed onto the stack; vendors, drawings and decisions are
/// portal-domain, so they render as inert chips here. That rule is why nothing in this app
/// navigates into a dead end.
struct Chip: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.caption)
            .padding(.horizontal, Theme.Spacing.sm + 2)
            .padding(.vertical, Theme.Spacing.xs + 1)
            .background(Theme.surface, in: Capsule())
            .overlay(Capsule().stroke(Theme.border, lineWidth: 1))
            .foregroundStyle(Theme.muted)
    }
}

/// Chips that wrap onto as many lines as they need. `LazyVGrid` with an adaptive column
/// would stretch every chip to a shared width; this keeps each one its natural size.
struct WrappingChips: View {
    let items: [String]

    var body: some View {
        FlowLayout(spacing: Theme.Spacing.sm) {
            ForEach(items, id: \.self) { Chip(text: $0) }
        }
    }
}

/// Minimal flow layout — place subviews left to right, wrapping at the proposed width.
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let width = proposal.width ?? .infinity
        let rows = layout(subviews: subviews, width: width)
        let height = rows.reduce(CGFloat.zero) { $0 + $1.height + spacing }
        return CGSize(width: width == .infinity ? rows.map(\.width).max() ?? 0 : width,
                      height: max(0, height - spacing))
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var y = bounds.minY
        for row in layout(subviews: subviews, width: bounds.width) {
            var x = bounds.minX
            for index in row.indices {
                let size = subviews[index].sizeThatFits(.unspecified)
                subviews[index].place(
                    at: CGPoint(x: x, y: y),
                    anchor: .topLeading,
                    proposal: ProposedViewSize(size)
                )
                x += size.width + spacing
            }
            y += row.height + spacing
        }
    }

    private struct Row {
        var indices: [Int] = []
        var width: CGFloat = 0
        var height: CGFloat = 0
    }

    private func layout(subviews: Subviews, width: CGFloat) -> [Row] {
        var rows: [Row] = []
        var current = Row()
        for index in subviews.indices {
            let size = subviews[index].sizeThatFits(.unspecified)
            let needed = current.indices.isEmpty ? size.width : current.width + spacing + size.width
            if needed > width, !current.indices.isEmpty {
                rows.append(current)
                current = Row()
            }
            current.width = current.indices.isEmpty ? size.width : current.width + spacing + size.width
            current.height = max(current.height, size.height)
            current.indices.append(index)
        }
        if !current.indices.isEmpty { rows.append(current) }
        return rows
    }
}

/// Labelled block used for every prose section on the detail screens.
/// Named `LabeledSection` rather than `Section` so it never shadows SwiftUI's own `Section`.
struct LabeledSection<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            Text(title).sectionHeading()
            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct Prose: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.callout)
            .foregroundStyle(Theme.foreground.opacity(0.85))
            .lineSpacing(4)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}

/// Key/value stats — plot area, built-up area, floors, status.
struct StatGrid: View {
    let stats: [(label: String, value: String)]

    var body: some View {
        LazyVGrid(
            columns: [GridItem(.flexible(), alignment: .leading),
                      GridItem(.flexible(), alignment: .leading)],
            alignment: .leading,
            spacing: Theme.Spacing.md
        ) {
            ForEach(stats, id: \.label) { stat in
                VStack(alignment: .leading, spacing: 2) {
                    Text(stat.label).sectionHeading()
                    Text(stat.value)
                        .font(.callout.weight(.medium))
                        .foregroundStyle(Theme.foreground)
                }
            }
        }
    }
}

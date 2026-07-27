import SwiftUI

/// The portfolio index — every project, from `GET /projects/public`.
///
/// This is the native counterpart of the web's `/` (the 2.0 portfolio index). The web
/// version sits behind `V2AuthGate`; this one does not, because it calls the *public*
/// endpoint, which returns the anonymized projection only — no `villaNo`, no address
/// (constitution §6).
struct PortfolioView: View {
    @State private var store = PortfolioStore()

    var body: some View {
        NavigationStack {
            ScrollView {
                LoadableView(state: store.state, retry: { Task { await store.load() } }) { projects in
                    if projects.isEmpty {
                        EmptyState(icon: "square.stack.3d.up.slash", message: "No projects published yet.")
                    } else {
                        LazyVStack(spacing: Theme.Spacing.lg) {
                            ForEach(projects) { project in
                                NavigationLink(value: project) {
                                    ProjectCard(project: project)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(Theme.Spacing.md)
                    }
                }
            }
            .background(Theme.background)
            .navigationTitle("Archive")
            .navigationDestination(for: PublicProject.self) { project in
                ProjectDetailView(store: ProjectStore(project: project))
            }
            .refreshable { await store.load() }
            .task { await store.loadIfNeeded() }
        }
    }
}

private struct ProjectCard: View {
    let project: PublicProject

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            RemoteImage(path: project.heroImage, aspectRatio: 16 / 10)

            VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                Text(project.publicTitle)
                    .font(.editorialTitle(22))
                    .foregroundStyle(Theme.foreground)
                    .multilineTextAlignment(.leading)

                Text(project.publicSubtitle)
                    .font(.footnote)
                    .foregroundStyle(Theme.muted)
                    .lineLimit(3)
                    .multilineTextAlignment(.leading)

                HStack(spacing: Theme.Spacing.sm) {
                    Label(project.city, systemImage: "mappin.and.ellipse")
                        .font(.caption)
                        .foregroundStyle(Theme.muted)
                    Spacer()
                    StatusBadge(status: project.status)
                }
            }
            .padding(Theme.Spacing.md)
        }
        .background(Theme.card)
        .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.lg))
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Radius.lg)
                .stroke(Theme.border, lineWidth: 1)
        )
    }
}

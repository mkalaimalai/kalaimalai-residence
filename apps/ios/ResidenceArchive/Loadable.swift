import SwiftUI

/// The four states any API-backed screen can be in.
///
/// Every screen here loads over the network with no seed fallback (unlike the 1.0 web
/// site), so "empty" and "failed" are ordinary outcomes that deserve real UI rather than
/// a permanent spinner.
enum Loadable<Value> {
    case idle
    case loading
    case loaded(Value)
    case failed(Error)
}

extension Loadable {
    var value: Value? {
        if case .loaded(let value) = self { return value }
        return nil
    }
}

/// Renders a `Loadable` uniformly: spinner while loading, the content when it arrives, and
/// a retry affordance when it fails. Keeping this in one place is what stops each screen
/// from inventing its own error treatment.
struct LoadableView<Value, Content: View>: View {
    let state: Loadable<Value>
    let retry: () -> Void
    @ViewBuilder let content: (Value) -> Content

    var body: some View {
        switch state {
        case .idle, .loading:
            ProgressView()
                .tint(Theme.muted)
                .frame(maxWidth: .infinity, minHeight: 240)
        case .loaded(let value):
            content(value)
        case .failed(let error):
            ErrorState(error: error, retry: retry)
        }
    }
}

struct ErrorState: View {
    let error: Error
    let retry: () -> Void

    var body: some View {
        VStack(spacing: Theme.Spacing.md) {
            Image(systemName: "wifi.exclamationmark")
                .font(.largeTitle)
                .foregroundStyle(Theme.muted)
            Text("Couldn't load")
                .font(.editorialTitle(20))
                .foregroundStyle(Theme.foreground)
            Text(message)
                .font(.footnote)
                .multilineTextAlignment(.center)
                .foregroundStyle(Theme.muted)
            Button("Try again", action: retry)
                .buttonStyle(.bordered)
                .tint(Theme.accent)
        }
        .padding(Theme.Spacing.xl)
        .frame(maxWidth: .infinity)
    }
}

private extension ErrorState {
    /// The most common failure by far is "the API isn't running / isn't reachable", and a
    /// raw `NSURLErrorDomain` string helps nobody. Name the actual cause and where to fix it.
    var message: String {
        if let api = error as? APIError {
            return api.errorDescription ?? "Request failed."
        }
        let nsError = error as NSError
        if nsError.domain == NSURLErrorDomain {
            return """
            Can't reach the API at \(Config.apiURL.absoluteString).

            Start it with `uvicorn app.main:app --port 8099` in apps/api. On a device, set \
            API_URL to your Mac's LAN address — localhost is the phone.
            """
        }
        return nsError.localizedDescription
    }
}

struct EmptyState: View {
    let icon: String
    let message: String

    var body: some View {
        VStack(spacing: Theme.Spacing.sm) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(Theme.muted)
            Text(message)
                .font(.footnote)
                .foregroundStyle(Theme.muted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Theme.Spacing.xl)
    }
}

import SwiftUI

/// Native mirror of the web theme tokens in `apps/web/app/globals.css`, and of
/// `apps/mobile/lib/theme.ts`.
///
/// SwiftUI has no CSS variables, so the palette is duplicated here rather than imported —
/// same warm editorial light ground and deep espresso dark ground, same semantic names, so
/// a value can be traced across all three platforms. Keep the three in sync by hand.
///
/// Each colour is built from a light/dark pair so the whole app follows the system
/// appearance without any view checking `colorScheme` itself.
enum Theme {
    static let background = adaptive(light: 0xF6F3EE, dark: 0x1A1613)
    static let surface    = adaptive(light: 0xEFEAE2, dark: 0x211C18)
    static let card       = adaptive(light: 0xFFFFFF, dark: 0x262019)
    static let border     = adaptive(light: 0xDED6CA, dark: 0x3A322A)
    static let foreground = adaptive(light: 0x26211C, dark: 0xF2ECE4)
    static let muted      = adaptive(light: 0x6F675E, dark: 0xA99C8D)
    static let accent     = adaptive(light: 0x8C6E4A, dark: 0xC79E6B)

    enum Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
        static let xl: CGFloat = 32
    }

    enum Radius {
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
        static let lg: CGFloat = 16
    }

    private static func adaptive(light: UInt32, dark: UInt32) -> Color {
        Color(UIColor { $0.userInterfaceStyle == .dark ? UIColor(hex: dark) : UIColor(hex: light) })
    }
}

private extension UIColor {
    convenience init(hex: UInt32) {
        self.init(
            red: CGFloat((hex >> 16) & 0xFF) / 255,
            green: CGFloat((hex >> 8) & 0xFF) / 255,
            blue: CGFloat(hex & 0xFF) / 255,
            alpha: 1
        )
    }
}

// MARK: - Typography

/// The web pairs Fraunces (serif headings) with Inter (sans body). Rather than ship and
/// register the font files, headings use the system serif face at matching weights — the
/// editorial contrast survives, and Dynamic Type keeps working for free.
extension Font {
    static func editorialTitle(_ size: CGFloat) -> Font {
        .system(size: size, weight: .regular, design: .serif)
    }
}

extension View {
    /// Section heading used across the detail screens.
    func sectionHeading() -> some View {
        font(.caption.weight(.semibold))
            .textCase(.uppercase)
            .kerning(1.1)
            .foregroundStyle(Theme.muted)
    }
}

// MARK: - Status colours

/// Maps the contract's status vocabularies (`SpaceStatus`, `DomainStatus`, material
/// status) onto the palette. Unknown values fall back to `muted` rather than crashing —
/// see the note on `status: String` in `Models.swift`.
enum StatusStyle {
    static func color(for status: String) -> Color {
        switch status.lowercased() {
        case "completed", "verified", "closed", "approved":
            Color.green
        case "execution", "in progress", "ordered", "shipped":
            Theme.accent
        case "design", "for review", "quoted", "negotiating":
            Color.orange
        case "concept", "not started", "identified", "draft", "open":
            Theme.muted
        default:
            Theme.muted
        }
    }
}

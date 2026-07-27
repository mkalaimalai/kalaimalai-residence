package com.kalaimalai.residence.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * Native mirror of the web theme tokens in `apps/web/app/globals.css`, matching
 * `apps/mobile/lib/theme.ts` value for value.
 *
 * Compose has no CSS variables, so the palette is duplicated rather than imported —
 * same warm editorial light ground, same deep espresso dark ground, same semantic
 * names, so a colour can be traced across all three clients. Keep them in sync by hand.
 *
 * Dynamic colour is deliberately NOT used: the wallpaper-derived Material You palette
 * would override the editorial identity this site is built around.
 */

private val LightBackground = Color(0xFFF6F3EE)
private val LightSurface = Color(0xFFEFEAE2)
private val LightCard = Color(0xFFFFFFFF)
private val LightBorder = Color(0xFFDED6CA)
private val LightForeground = Color(0xFF26211C)
private val LightMuted = Color(0xFF6F675E)
private val LightAccent = Color(0xFF8C6E4A)

private val DarkBackground = Color(0xFF1A1613)
private val DarkSurface = Color(0xFF211C18)
private val DarkCard = Color(0xFF262019)
private val DarkBorder = Color(0xFF3A322A)
private val DarkForeground = Color(0xFFF2ECE4)
private val DarkMuted = Color(0xFFA99C8D)
private val DarkAccent = Color(0xFFC79E6B)

/**
 * The tokens Material3's own scheme has no slot for. `border` and `muted` are semantic
 * on the web side, and mapping them onto `outline`/`onSurfaceVariant` alone would lose
 * the distinction, so they are carried alongside via a CompositionLocal.
 */
data class ResidenceColors(
    val background: Color,
    val surface: Color,
    val card: Color,
    val border: Color,
    val foreground: Color,
    val muted: Color,
    val accent: Color,
)

private val LightColors = ResidenceColors(
    background = LightBackground,
    surface = LightSurface,
    card = LightCard,
    border = LightBorder,
    foreground = LightForeground,
    muted = LightMuted,
    accent = LightAccent,
)

private val DarkColors = ResidenceColors(
    background = DarkBackground,
    surface = DarkSurface,
    card = DarkCard,
    border = DarkBorder,
    foreground = DarkForeground,
    muted = DarkMuted,
    accent = DarkAccent,
)

val LocalResidenceColors = androidx.compose.runtime.staticCompositionLocalOf { LightColors }

/** Shorthand so screens read `colors.muted`, like the RN components do. */
val colors: ResidenceColors
    @Composable get() = LocalResidenceColors.current

/** Matches `spacing`/`radius` in `apps/mobile/lib/theme.ts`. */
object Spacing {
    val xs = 4.dp
    val sm = 8.dp
    val md = 16.dp
    val lg = 24.dp
    val xl = 32.dp
}

object Radius {
    val sm = 8.dp
    val md = 12.dp
    val lg = 16.dp
}

private val ResidenceTypography = Typography(
    titleLarge = TextStyle(fontSize = 22.sp, fontWeight = FontWeight.SemiBold),
    titleMedium = TextStyle(fontSize = 16.sp, fontWeight = FontWeight.SemiBold),
    bodyLarge = TextStyle(fontSize = 16.sp, lineHeight = 24.sp),
    bodyMedium = TextStyle(fontSize = 14.sp, lineHeight = 20.sp),
    labelSmall = TextStyle(fontSize = 12.sp, fontWeight = FontWeight.SemiBold, letterSpacing = 1.sp),
)

@Composable
fun ResidenceTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val residence = if (darkTheme) DarkColors else LightColors

    val scheme = if (darkTheme) {
        darkColorScheme(
            primary = residence.accent,
            background = residence.background,
            onBackground = residence.foreground,
            surface = residence.surface,
            onSurface = residence.foreground,
            surfaceContainer = residence.card,
            outline = residence.border,
            onSurfaceVariant = residence.muted,
        )
    } else {
        lightColorScheme(
            primary = residence.accent,
            background = residence.background,
            onBackground = residence.foreground,
            surface = residence.surface,
            onSurface = residence.foreground,
            surfaceContainer = residence.card,
            outline = residence.border,
            onSurfaceVariant = residence.muted,
        )
    }

    androidx.compose.runtime.CompositionLocalProvider(LocalResidenceColors provides residence) {
        MaterialTheme(
            colorScheme = scheme,
            typography = ResidenceTypography,
            content = content,
        )
    }
}

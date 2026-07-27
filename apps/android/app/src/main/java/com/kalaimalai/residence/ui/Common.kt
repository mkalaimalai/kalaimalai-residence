package com.kalaimalai.residence.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.State
import androidx.compose.runtime.produceState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.kalaimalai.residence.data.ApiException
import com.kalaimalai.residence.ui.theme.Radius
import com.kalaimalai.residence.ui.theme.Spacing
import com.kalaimalai.residence.ui.theme.colors
import kotlinx.coroutines.CancellationException

/**
 * The three states every screen here has. Mirrors what the RN screens express with a
 * nullable data field plus a nullable error string, but makes "loading" a real case
 * instead of "data is still null".
 */
sealed interface UiState<out T> {
    data object Loading : UiState<Nothing>
    data class Error(val message: String) : UiState<Nothing>
    // Covariant, so the `is Ready` smart cast in `StateContent` keeps `value` typed as
    // T instead of widening to Any?.
    data class Ready<out T>(val value: T) : UiState<T>
}

/**
 * Re-runs [load] whenever any of [keys] changes, folding the result into a [UiState].
 *
 * `produceState` cancels the coroutine when the composable leaves, which matters on
 * back navigation mid-fetch — but cancellation must not be shown as an error, hence the
 * explicit rethrow.
 */
@Composable
fun <T> loadState(vararg keys: Any?, load: suspend () -> T): State<UiState<T>> =
    produceState<UiState<T>>(UiState.Loading, *keys) {
        value = UiState.Loading
        value = try {
            UiState.Ready(load())
        } catch (e: CancellationException) {
            throw e
        } catch (e: ApiException) {
            // 401 means the endpoint is behind `require_user` and this app is anonymous.
            UiState.Error(
                if (e.status == 401) "This content requires a signed-in account."
                else "Could not load (${e.status})."
            )
        } catch (e: Exception) {
            UiState.Error(e.message ?: "Could not reach the API.")
        }
    }

/**
 * Renders the loading spinner and the error message, and calls [content] only once
 * there is data — so screens never branch on null.
 */
@Composable
fun <T> StateContent(state: UiState<T>, content: @Composable (T) -> Unit) {
    when (state) {
        is UiState.Loading -> Centered { CircularProgressIndicator(color = colors.accent) }
        is UiState.Error -> Centered {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(Spacing.sm),
                modifier = Modifier.padding(Spacing.lg),
            ) {
                Text(
                    state.message,
                    color = colors.foreground,
                    textAlign = TextAlign.Center,
                )
                Text(
                    "The API must be running and reachable from this device.",
                    color = colors.muted,
                    textAlign = TextAlign.Center,
                )
            }
        }
        is UiState.Ready -> content(state.value)
    }
}

@Composable
private fun Centered(content: @Composable () -> Unit) {
    Box(
        modifier = Modifier.fillMaxSize().background(colors.background),
        contentAlignment = Alignment.Center,
    ) { content() }
}

/**
 * The card chrome every list row and tile shares: clipped corners, card ground, hairline
 * border. Clipping before the background is what keeps a child image from painting over
 * the rounded corner.
 */
@Composable
fun Modifier.cardSurface(shape: Shape = RoundedCornerShape(Radius.md)): Modifier =
    this.clip(shape).background(colors.card).border(1.dp, colors.border, shape)

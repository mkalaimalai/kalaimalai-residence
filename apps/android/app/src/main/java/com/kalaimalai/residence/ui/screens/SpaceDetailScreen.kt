package com.kalaimalai.residence.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import coil.compose.AsyncImage
import com.kalaimalai.residence.data.ApiClient
import com.kalaimalai.residence.data.Space
import com.kalaimalai.residence.ui.StateContent
import com.kalaimalai.residence.ui.cardSurface
import com.kalaimalai.residence.ui.loadState
import com.kalaimalai.residence.ui.theme.Radius
import com.kalaimalai.residence.ui.theme.Spacing
import com.kalaimalai.residence.ui.theme.colors

/**
 * One room: hero, description, design intent, and the free-text furniture / lighting
 * lists.
 *
 * The space is located inside the project's own `/spaces?projectId=` response rather
 * than by `GET /spaces/{id}`, so the lookup stays inside the tenant boundary and this
 * screen can never render a room belonging to another project.
 *
 * Relations (`materialIds`, `vendorIds`, `drawingIds`, …) are deliberately not resolved
 * here: vendors, drawings and decisions are portal-domain and have no public page, so
 * per constitution §3 they must not become navigable chips in a public viewer.
 */
@Composable
fun SpaceDetailScreen(projectId: String, spaceId: String, onTitle: (String) -> Unit) {
    val state by loadState(projectId, spaceId) {
        ApiClient.spaces(projectId).find { it.id == spaceId }
    }

    StateContent(state) { space ->
        LaunchedEffect(space?.name) { space?.name?.let(onTitle) }

        if (space == null) {
            Text(
                "That space is not part of this project.",
                color = colors.muted,
                modifier = Modifier.padding(Spacing.lg),
            )
            return@StateContent
        }
        SpaceBody(space)
    }
}

@Composable
private fun SpaceBody(space: Space) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().background(colors.background),
        contentPadding = PaddingValues(Spacing.md),
        verticalArrangement = Arrangement.spacedBy(Spacing.md),
    ) {
        item {
            AsyncImage(
                model = ApiClient.imageUrl(space.image),
                contentDescription = space.name,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(4f / 3f)
                    .cardSurface(RoundedCornerShape(Radius.lg)),
            )
        }

        item {
            Column(verticalArrangement = Arrangement.spacedBy(Spacing.xs)) {
                Text(
                    space.name,
                    style = MaterialTheme.typography.titleLarge,
                    color = colors.foreground,
                )
                Text(
                    space.status,
                    style = MaterialTheme.typography.bodyMedium,
                    color = colors.muted,
                )
            }
        }

        if (space.description.isNotBlank()) {
            item { Paragraph("Overview", space.description) }
        }
        if (space.designIntent.isNotBlank()) {
            item { Paragraph("Design intent", space.designIntent) }
        }
        if (space.furniture.isNotEmpty()) {
            item { BulletList("Furniture", space.furniture) }
        }
        if (space.lighting.isNotEmpty()) {
            item { BulletList("Lighting", space.lighting) }
        }
    }
}

@Composable
private fun Paragraph(label: String, body: String) {
    Column(verticalArrangement = Arrangement.spacedBy(Spacing.xs)) {
        SectionLabel(label)
        Text(body, style = MaterialTheme.typography.bodyLarge, color = colors.foreground)
    }
}

@Composable
private fun BulletList(label: String, items: List<String>) {
    Column(verticalArrangement = Arrangement.spacedBy(Spacing.xs)) {
        SectionLabel(label)
        items.forEach {
            Text(
                "· $it",
                style = MaterialTheme.typography.bodyLarge,
                color = colors.foreground,
            )
        }
    }
}

@Composable
private fun SectionLabel(label: String) {
    Text(
        label.uppercase(),
        style = MaterialTheme.typography.labelSmall,
        color = colors.accent,
    )
}

package com.kalaimalai.residence.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.kalaimalai.residence.data.ApiClient
import com.kalaimalai.residence.data.PublicProject
import com.kalaimalai.residence.data.Space
import com.kalaimalai.residence.ui.StateContent
import com.kalaimalai.residence.ui.cardSurface
import com.kalaimalai.residence.ui.loadState
import com.kalaimalai.residence.ui.theme.Radius
import com.kalaimalai.residence.ui.theme.Spacing
import com.kalaimalai.residence.ui.theme.colors
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope

/** What this screen needs, fetched together so the header and list appear as one. */
private data class ProjectDetail(val project: PublicProject?, val spaces: List<Space>)

/**
 * Project detail — hero, concept statement, key figures, and the room list.
 *
 * Every collection fetch passes `projectId`. Omitting it returns EVERY project's rows
 * (constitution §5), which on a portfolio-wide app would silently mix two houses
 * together.
 *
 * `/projects/public` has no by-id variant, so the project is found client-side in the
 * list — the same thing the Expo screen does.
 */
@Composable
fun ProjectDetailScreen(
    projectId: String,
    onTitle: (String) -> Unit,
    onOpenSpace: (String) -> Unit,
    onOpenGallery: () -> Unit,
    onOpenMaterials: () -> Unit,
) {
    val state by loadState(projectId) {
        coroutineScope {
            val projects = async { ApiClient.publicProjects() }
            val spaces = async { ApiClient.spaces(projectId) }
            ProjectDetail(
                project = projects.await().find { it.id == projectId },
                spaces = spaces.await(),
            )
        }
    }

    StateContent(state) { detail ->
        detail.project?.publicTitle?.let { name ->
            LaunchedEffect(name) { onTitle(name) }
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize().background(colors.background),
            contentPadding = PaddingValues(Spacing.md),
            verticalArrangement = Arrangement.spacedBy(Spacing.md),
        ) {
            detail.project?.let { project ->
                item { ProjectHeader(project, onOpenGallery, onOpenMaterials) }
            }

            item {
                Text(
                    "${detail.spaces.size} SPACES",
                    style = MaterialTheme.typography.labelSmall,
                    color = colors.accent,
                )
            }

            items(detail.spaces, key = { it.id }) { space ->
                SpaceRow(space) { onOpenSpace(space.id) }
            }
        }
    }
}

@Composable
private fun ProjectHeader(
    project: PublicProject,
    onOpenGallery: () -> Unit,
    onOpenMaterials: () -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
        AsyncImage(
            model = ApiClient.imageUrl(project.heroImage),
            contentDescription = project.publicTitle,
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(4f / 3f)
                .cardSurface(RoundedCornerShape(Radius.lg)),
        )
        Text(
            project.publicTitle,
            style = MaterialTheme.typography.titleLarge,
            color = colors.foreground,
        )
        Text(
            project.publicSubtitle,
            style = MaterialTheme.typography.bodyMedium,
            color = colors.muted,
        )
        Text(
            project.conceptStatement,
            style = MaterialTheme.typography.bodyLarge,
            color = colors.foreground,
        )

        Facts(project)

        Row(horizontalArrangement = Arrangement.spacedBy(Spacing.sm)) {
            NavChip("Gallery", onOpenGallery)
            NavChip("Materials", onOpenMaterials)
        }
    }
}

/** The public figures — the anonymized set only; no villa number or address. */
@Composable
private fun Facts(project: PublicProject) {
    val facts = listOfNotNull(
        project.city.takeIf { it.isNotBlank() }?.let { "Location" to it },
        project.designer.takeIf { it.isNotBlank() }?.let { "Designer" to it },
        project.plotArea.takeIf { it.isNotBlank() }?.let { "Plot" to it },
        project.builtUpArea.takeIf { it.isNotBlank() }?.let { "Built-up" to it },
        project.floors.takeIf { it > 0 }?.let { "Floors" to it.toString() },
        project.status.takeIf { it.isNotBlank() }?.let { "Status" to it },
    )
    if (facts.isEmpty()) return

    Column(
        modifier = Modifier.fillMaxWidth().cardSurface().padding(Spacing.md),
        verticalArrangement = Arrangement.spacedBy(Spacing.sm),
    ) {
        facts.forEach { (label, value) ->
            Row(modifier = Modifier.fillMaxWidth()) {
                Text(
                    label,
                    style = MaterialTheme.typography.bodyMedium,
                    color = colors.muted,
                    modifier = Modifier.weight(1f),
                )
                Text(
                    value,
                    style = MaterialTheme.typography.bodyMedium,
                    color = colors.foreground,
                )
            }
        }
    }
}

@Composable
private fun NavChip(label: String, onClick: () -> Unit) {
    Text(
        label,
        style = MaterialTheme.typography.titleMedium,
        color = colors.foreground,
        modifier = Modifier
            .cardSurface(RoundedCornerShape(Radius.sm))
            .clickable(onClick = onClick)
            .padding(horizontal = Spacing.md, vertical = Spacing.sm),
    )
}

@Composable
private fun SpaceRow(space: Space, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .cardSurface()
            .clickable(onClick = onClick),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        AsyncImage(
            model = ApiClient.imageUrl(space.image),
            contentDescription = space.name,
            contentScale = ContentScale.Crop,
            modifier = Modifier.size(96.dp),
        )
        Column(
            modifier = Modifier.padding(Spacing.md),
            verticalArrangement = Arrangement.spacedBy(Spacing.xs),
        ) {
            Text(
                space.name,
                style = MaterialTheme.typography.titleMedium,
                color = colors.foreground,
            )
            Text(
                space.status,
                style = MaterialTheme.typography.bodyMedium,
                color = colors.muted,
            )
        }
    }
}

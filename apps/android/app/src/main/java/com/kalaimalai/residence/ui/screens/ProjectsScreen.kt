package com.kalaimalai.residence.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.style.TextOverflow
import coil.compose.AsyncImage
import com.kalaimalai.residence.data.ApiClient
import com.kalaimalai.residence.data.PublicProject
import com.kalaimalai.residence.ui.StateContent
import com.kalaimalai.residence.ui.cardSurface
import com.kalaimalai.residence.ui.loadState
import com.kalaimalai.residence.ui.theme.Radius
import com.kalaimalai.residence.ui.theme.Spacing
import com.kalaimalai.residence.ui.theme.colors

/**
 * Portfolio index — every project in the archive. Mirrors the web's `/` route and the
 * Expo app's `app/index.tsx`.
 *
 * Uses `/projects/public`, which omits the portal-only identity fields (villa number,
 * address) per constitution §6. This app is a public viewer; it must never fetch
 * `/projects`.
 */
@Composable
fun ProjectsScreen(onOpenProject: (String) -> Unit) {
    val state by loadState { ApiClient.publicProjects() }

    StateContent(state) { projects ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().background(colors.background),
            contentPadding = PaddingValues(Spacing.md),
            verticalArrangement = Arrangement.spacedBy(Spacing.md),
        ) {
            items(projects, key = { it.id }) { project ->
                ProjectCard(project) { onOpenProject(project.id) }
            }
        }
    }
}

@Composable
private fun ProjectCard(project: PublicProject, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .cardSurface(RoundedCornerShape(Radius.lg))
            .clickable(onClick = onClick),
    ) {
        AsyncImage(
            model = ApiClient.imageUrl(project.heroImage),
            contentDescription = project.publicTitle,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxWidth().aspectRatio(4f / 3f),
        )
        Column(
            modifier = Modifier.padding(Spacing.md),
            verticalArrangement = Arrangement.spacedBy(Spacing.xs),
        ) {
            Text(
                project.publicTitle,
                style = MaterialTheme.typography.titleLarge,
                color = colors.foreground,
            )
            Text(
                listOf(project.city, project.status)
                    .filter { it.isNotBlank() }
                    .joinToString(" · "),
                style = MaterialTheme.typography.bodyMedium,
                color = colors.muted,
            )
            Text(
                project.publicSubtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = colors.muted,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}

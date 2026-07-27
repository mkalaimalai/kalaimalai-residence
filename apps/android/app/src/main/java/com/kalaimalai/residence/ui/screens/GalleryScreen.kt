package com.kalaimalai.residence.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.style.TextOverflow
import coil.compose.AsyncImage
import com.kalaimalai.residence.data.ApiClient
import com.kalaimalai.residence.data.GalleryItem
import com.kalaimalai.residence.ui.StateContent
import com.kalaimalai.residence.ui.cardSurface
import com.kalaimalai.residence.ui.loadState
import com.kalaimalai.residence.ui.theme.Spacing
import com.kalaimalai.residence.ui.theme.colors

/**
 * The project's gallery — mirrors the web's `/gallery`, two-up on phones.
 *
 * Scoped with `projectId` (constitution §5); without it the grid would show every
 * project's photographs at once.
 */
@Composable
fun GalleryScreen(projectId: String) {
    val state by loadState(projectId) { ApiClient.gallery(projectId) }

    StateContent(state) { items ->
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            modifier = Modifier.fillMaxSize().background(colors.background),
            contentPadding = PaddingValues(Spacing.md),
            horizontalArrangement = Arrangement.spacedBy(Spacing.md),
            verticalArrangement = Arrangement.spacedBy(Spacing.md),
        ) {
            items(items, key = { it.id }) { GalleryTile(it) }
        }
    }
}

@Composable
private fun GalleryTile(item: GalleryItem) {
    Column(modifier = Modifier.fillMaxWidth().cardSurface()) {
        AsyncImage(
            model = ApiClient.imageUrl(item.image),
            contentDescription = item.caption.ifBlank { item.title },
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxWidth().aspectRatio(1f),
        )
        Column(
            modifier = Modifier.padding(Spacing.sm),
            verticalArrangement = Arrangement.spacedBy(Spacing.xs),
        ) {
            Text(
                item.title,
                style = MaterialTheme.typography.titleMedium,
                color = colors.foreground,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            if (item.category.isNotBlank()) {
                Text(
                    item.category,
                    style = MaterialTheme.typography.labelSmall,
                    color = colors.accent,
                )
            }
        }
    }
}

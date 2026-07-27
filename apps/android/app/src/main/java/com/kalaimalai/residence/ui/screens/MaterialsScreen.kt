package com.kalaimalai.residence.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.kalaimalai.residence.data.ApiClient
import com.kalaimalai.residence.data.Material
import com.kalaimalai.residence.ui.StateContent
import com.kalaimalai.residence.ui.cardSurface
import com.kalaimalai.residence.ui.loadState
import com.kalaimalai.residence.ui.theme.Spacing
import com.kalaimalai.residence.ui.theme.colors

/**
 * The materials library, grouped by category the way the web's `MaterialsLibrary` does.
 *
 * `vendorId` is present on the row but is not rendered: vendors are portal-domain with
 * no public page (constitution §3), and vendor terms are exactly the sort of figure §6
 * keeps off the public side.
 */
@Composable
fun MaterialsScreen(projectId: String) {
    val state by loadState(projectId) {
        ApiClient.materials(projectId)
            .groupBy { it.category.ifBlank { "Other" } }
            .toSortedMap()
    }

    StateContent(state) { grouped ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().background(colors.background),
            contentPadding = PaddingValues(Spacing.md),
            verticalArrangement = Arrangement.spacedBy(Spacing.md),
        ) {
            grouped.forEach { (category, materials) ->
                item(key = "header-$category") {
                    Text(
                        category.uppercase(),
                        style = MaterialTheme.typography.labelSmall,
                        color = colors.accent,
                    )
                }
                items(materials, key = { it.id }) { MaterialRow(it) }
            }
        }
    }
}

@Composable
private fun MaterialRow(material: Material) {
    Row(modifier = Modifier.fillMaxWidth().cardSurface()) {
        AsyncImage(
            model = ApiClient.imageUrl(material.image),
            contentDescription = material.name,
            contentScale = ContentScale.Crop,
            modifier = Modifier.size(88.dp),
        )
        Column(
            modifier = Modifier.padding(Spacing.md),
            verticalArrangement = Arrangement.spacedBy(Spacing.xs),
        ) {
            Text(
                material.name,
                style = MaterialTheme.typography.titleMedium,
                color = colors.foreground,
            )
            if (material.status.isNotBlank()) {
                Text(
                    material.status,
                    style = MaterialTheme.typography.bodyMedium,
                    color = colors.muted,
                )
            }
            if (material.notes.isNotBlank()) {
                Text(
                    material.notes,
                    style = MaterialTheme.typography.bodyMedium,
                    color = colors.muted,
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
    }
}

package com.kalaimalai.residence.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.kalaimalai.residence.ui.screens.GalleryScreen
import com.kalaimalai.residence.ui.screens.MaterialsScreen
import com.kalaimalai.residence.ui.screens.ProjectDetailScreen
import com.kalaimalai.residence.ui.screens.ProjectsScreen
import com.kalaimalai.residence.ui.screens.SpaceDetailScreen
import com.kalaimalai.residence.ui.theme.colors

/**
 * Routes, mirroring the Expo app's file-based ones (`/`, `/project/[id]`, `/space/[id]`,
 * `/project/[id]/gallery`, `/project/[id]/materials`).
 *
 * The space route carries `projectId` as well as `spaceId`: slugs and lookups are only
 * unique *within* a project (constitution §5), so a space route that knew only its own
 * id could not scope its fetch.
 */
private object Routes {
    const val PROJECTS = "projects"
    const val PROJECT = "project/{projectId}"
    const val SPACE = "project/{projectId}/space/{spaceId}"
    const val GALLERY = "project/{projectId}/gallery"
    const val MATERIALS = "project/{projectId}/materials"

    fun project(id: String) = "project/$id"
    fun space(projectId: String, spaceId: String) = "project/$projectId/space/$spaceId"
    fun gallery(projectId: String) = "project/$projectId/gallery"
    fun materials(projectId: String) = "project/$projectId/materials"
}

private val projectArg = navArgument("projectId") { type = NavType.StringType }
private val spaceArg = navArgument("spaceId") { type = NavType.StringType }

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResidenceApp() {
    val nav = rememberNavController()

    // The bar title is hoisted rather than read from the back stack, because the
    // interesting titles (a project's name, a room's name) are only known once the
    // fetch lands — the route itself carries ids, not display text.
    var title by remember { mutableStateOf("Projects") }
    var canGoBack by remember { mutableStateOf(false) }

    Scaffold(
        containerColor = colors.background,
        topBar = {
            TopAppBar(
                title = {
                    Text(title, maxLines = 1, overflow = TextOverflow.Ellipsis)
                },
                navigationIcon = {
                    if (canGoBack) {
                        IconButton(onClick = { nav.popBackStack() }) {
                            Icon(
                                Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Back",
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = colors.surface,
                    titleContentColor = colors.foreground,
                    navigationIconContentColor = colors.foreground,
                ),
            )
        },
    ) { padding ->
        val setBar: (String, Boolean) -> Unit = { name, back ->
            title = name
            canGoBack = back
        }

        NavHost(
            navController = nav,
            startDestination = Routes.PROJECTS,
            modifier = Modifier.padding(padding),
        ) {
            composable(Routes.PROJECTS) {
                SetBar("Projects", back = false, apply = setBar)
                ProjectsScreen(onOpenProject = { nav.navigate(Routes.project(it)) })
            }

            composable(Routes.PROJECT, arguments = listOf(projectArg)) { entry ->
                val projectId = entry.projectId()
                SetBar("Project", back = true, apply = setBar)
                ProjectDetailScreen(
                    projectId = projectId,
                    // Refines the placeholder once the fetch names the house.
                    onTitle = { title = it },
                    onOpenSpace = { nav.navigate(Routes.space(projectId, it)) },
                    onOpenGallery = { nav.navigate(Routes.gallery(projectId)) },
                    onOpenMaterials = { nav.navigate(Routes.materials(projectId)) },
                )
            }

            composable(Routes.SPACE, arguments = listOf(projectArg, spaceArg)) { entry ->
                SetBar("Space", back = true, apply = setBar)
                SpaceDetailScreen(
                    projectId = entry.projectId(),
                    spaceId = entry.arguments?.getString("spaceId").orEmpty(),
                    onTitle = { title = it },
                )
            }

            composable(Routes.GALLERY, arguments = listOf(projectArg)) { entry ->
                SetBar("Gallery", back = true, apply = setBar)
                GalleryScreen(projectId = entry.projectId())
            }

            composable(Routes.MATERIALS, arguments = listOf(projectArg)) { entry ->
                SetBar("Materials", back = true, apply = setBar)
                MaterialsScreen(projectId = entry.projectId())
            }
        }
    }
}

private fun androidx.navigation.NavBackStackEntry.projectId(): String =
    arguments?.getString("projectId").orEmpty()

/**
 * Applies this destination's bar state on entry. Runs in a `LaunchedEffect` so it
 * happens as a side effect of composition rather than during it — writing hoisted state
 * inline would be a recomposition loop.
 */
@Composable
private fun SetBar(name: String, back: Boolean, apply: (String, Boolean) -> Unit) {
    LaunchedEffect(name, back) { apply(name, back) }
}

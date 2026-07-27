package com.kalaimalai.residence.data

import kotlinx.serialization.Serializable

/**
 * Kotlin mirror of the entity contract in `packages/contracts/src/index.ts`.
 *
 * These are hand-kept copies, not generated: Gradle cannot consume a TS package, and
 * the constitution's rule 4 ("the data model is the contract") means the TS file stays
 * the source of record. Only the fields this read-only viewer renders are declared —
 * the API sends more, and `ignoreUnknownKeys` drops the rest — so adding a field to the
 * contract does not break the app, but *renaming* one silently empties a screen.
 *
 * The API speaks camelCase on the wire (same shapes the web gets), so no `@SerialName`
 * mapping is needed.
 */

/**
 * `/projects/public` — `Project` minus the portal-only identity fields (internalName,
 * villaNo, community, address). This app is a public viewer and must never call the
 * gated `/projects`; the omission is constitution §6, not an oversight.
 */
@Serializable
data class PublicProject(
    val id: String,
    val publicTitle: String,
    val publicSubtitle: String = "",
    val city: String = "",
    val designer: String = "",
    val direction: String = "",
    val heroImage: String = "",
    val conceptStatement: String = "",
    val plotArea: String = "",
    val builtUpArea: String = "",
    val floors: Int = 0,
    val status: String = "",
    val startDate: String = "",
)

@Serializable
data class Space(
    val projectId: String = "",
    val id: String,
    val slug: String = "",
    val name: String,
    val description: String = "",
    val designIntent: String = "",
    val image: String = "",
    val furniture: List<String> = emptyList(),
    val lighting: List<String> = emptyList(),
    val materialIds: List<String> = emptyList(),
    val status: String = "",
)

@Serializable
data class GalleryItem(
    val projectId: String = "",
    val id: String,
    val title: String,
    val category: String = "",
    val image: String = "",
    val spaceId: String = "",
    val domainId: String = "",
    val caption: String = "",
)

@Serializable
data class Material(
    val projectId: String = "",
    val id: String,
    val name: String,
    val category: String = "",
    val spaceIds: List<String> = emptyList(),
    val status: String = "",
    val image: String = "",
    val notes: String = "",
)

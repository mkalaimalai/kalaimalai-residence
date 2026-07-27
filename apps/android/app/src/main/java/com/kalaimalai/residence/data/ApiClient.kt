package com.kalaimalai.residence.data

import com.kalaimalai.residence.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlinx.serialization.DeserializationStrategy
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.Json
import okhttp3.Call
import okhttp3.Callback
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import java.io.IOException
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

/** Thrown on any non-2xx response, carrying the status so callers can branch on 401. */
class ApiException(val status: Int, val path: String) :
    RuntimeException("API $status: $path")

/**
 * Native counterpart of `packages/api-client`.
 *
 * Read-only and anonymous: there is no session yet, so it is limited to the public
 * endpoints (`/projects/public`, `/spaces`, `/gallery`, `/materials`). `/media-sets`
 * and `/projects` sit behind `require_user` and would 401 — wire Supabase auth here
 * before reaching for them.
 *
 * Serializers are passed explicitly rather than via `reified` generics, so nothing here
 * needs to be `inline` and R8 has no reflective lookup to lose.
 */
object ApiClient {

    private val json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
    }

    private val http = OkHttpClient()

    private val root = BuildConfig.API_URL.trimEnd('/')

    suspend fun publicProjects(): List<PublicProject> =
        getList("/projects/public", null, PublicProject.serializer())

    /**
     * Collection GETs are project-scoped: the API filters on `project_id` when
     * `projectId` is present and returns EVERY project's rows when it is not
     * (constitution §5). Any screen rendering one project must pass it, or two houses
     * silently merge into one list.
     */
    suspend fun spaces(projectId: String?): List<Space> =
        getList("/spaces", projectId, Space.serializer())

    suspend fun gallery(projectId: String?): List<GalleryItem> =
        getList("/gallery", projectId, GalleryItem.serializer())

    suspend fun materials(projectId: String?): List<Material> =
        getList("/materials", projectId, Material.serializer())

    private suspend fun <T> getList(
        path: String,
        projectId: String?,
        item: DeserializationStrategy<T>,
    ): List<T> {
        val query = projectId?.let { "?projectId=$it" }.orEmpty()
        val body = fetch(path + query)
        return withContext(Dispatchers.Default) {
            json.decodeFromString(ListSerializer(item), body)
        }
    }

    /** One network round trip. Suspends without blocking a thread. */
    private suspend fun fetch(path: String): String =
        suspendCancellableCoroutine { cont ->
            // Built through HttpUrl so the query string survives intact and a malformed
            // base URL fails here rather than deep inside OkHttp.
            val call = http.newCall(Request.Builder().url((root + path).toHttpUrl()).build())

            cont.invokeOnCancellation { call.cancel() }

            call.enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    if (!cont.isCancelled) cont.resumeWithException(e)
                }

                override fun onResponse(call: Call, response: Response) {
                    response.use {
                        if (!it.isSuccessful) {
                            cont.resumeWithException(ApiException(it.code, path))
                        } else {
                            cont.resume(it.body?.string().orEmpty())
                        }
                    }
                }
            })
        }

    /**
     * Image paths from the API are root-relative (`/images/spaces/x.jpg`) and resolve
     * against the WEB app's origin — the API serves no files. A native client has no
     * origin of its own, so every path must be absolutised against the deployed site.
     */
    fun imageUrl(path: String): String = when {
        path.isBlank() -> ""
        path.startsWith("http://", true) || path.startsWith("https://", true) -> path
        else -> BuildConfig.SITE_ORIGIN.trimEnd('/') +
            (if (path.startsWith("/")) "" else "/") + path
    }
}

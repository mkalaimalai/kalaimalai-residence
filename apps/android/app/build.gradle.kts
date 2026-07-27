plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
}

/**
 * The two hosts the app talks to, overridable per machine from
 * `apps/android/local.properties` (gitignored) or `-P` on the command line:
 *
 *   API_URL=http://192.168.1.5:8099
 *   SITE_ORIGIN=https://mkalaimalai-residence.github.io
 *
 * `10.0.2.2` is the emulator's alias for the host machine's loopback — `localhost`
 * inside the emulator is the emulator itself, so it can never reach a local uvicorn.
 * On a physical device this must be the Mac's LAN address.
 */
val apiUrl: String = (project.findProperty("API_URL") as String?) ?: "http://10.0.2.2:8099"
val siteOrigin: String =
    (project.findProperty("SITE_ORIGIN") as String?) ?: "https://mkalaimalai-residence.github.io"

android {
    namespace = "com.kalaimalai.residence"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.kalaimalai.residence"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        buildConfigField("String", "API_URL", "\"$apiUrl\"")
        buildConfigField("String", "SITE_ORIGIN", "\"$siteOrigin\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)

    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.navigation.compose)
    debugImplementation(libs.androidx.compose.ui.tooling)

    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.okhttp)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.coil.compose)
}

pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

// Deliberately outside the npm workspace: this is a Gradle build that shares nothing
// with node_modules. It talks to the same FastAPI backend as apps/web and apps/mobile,
// but the contract is re-declared in Kotlin (see data/Models.kt) rather than imported.
rootProject.name = "KalaimalaiResidence"
include(":app")

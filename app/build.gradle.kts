import org.gradle.api.JavaVersion

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.airgo.djiapp"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.airgo.djiapp"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"
        multiDexEnabled = true

        ndk {
            abiFilters += listOf("armeabi-v7a", "arm64-v8a")
        }

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = "11"
    }

    buildFeatures {
        compose = true
        viewBinding = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.3"
    }

    buildTypes {
        debug {
            isMinifyEnabled = false
        }
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    // Handle duplicate native libs (safe for DJI SDK V4)
    packagingOptions {
        pickFirst("lib/arm64-v8a/libDJICSDKCommon.so")
        pickFirst("lib/armeabi-v7a/libDJICSDKCommon.so")
        pickFirst("lib/x86/libDJICSDKCommon.so")
        pickFirst("lib/x86_64/libDJICSDKCommon.so")
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")

    // Compose
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation("androidx.compose.material3:material3")
    implementation("androidx.navigation:navigation-compose:2.7.3")
    implementation("androidx.compose.material:material-icons-extended:1.6.0")

    // Multidex
    implementation("androidx.multidex:multidex:2.0.1")

    // DJI SDK V4 only
    implementation("com.dji:dji-sdk:4.16.4") {
        exclude(module = "fly-safe-database")
        exclude(module = "libacousticEchoCanceler")
    }
    compileOnly("com.dji:dji-sdk-provided:4.16.4")

    // OSMDroid
    implementation("org.osmdroid:osmdroid-android:6.1.17")

    // Networking
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")

    // Compose lifecycle
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.0")

    // Testing
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)

    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}
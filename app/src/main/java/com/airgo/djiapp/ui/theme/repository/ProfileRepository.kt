package com.airgo.djiapp.ui.theme.repository

import com.airgo.djiapp.ui.theme.network.ProfileApi
import com.airgo.djiapp.ui.theme.network.UserProfile
import com.airgo.djiapp.ui.theme.network.ProfileUpdateRequest
import com.airgo.djiapp.ui.theme.network.ProfileUpdateResponse
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

// Fetch profile
suspend fun fetchUserProfile(userEmail: String): UserProfile? {
    return withContext(Dispatchers.IO) {
        try {
            val api = ProfileApi.create()
            api.getUserProfile(userEmail)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}

// Update profile
suspend fun updateUserProfile(request: ProfileUpdateRequest): ProfileUpdateResponse? {
    return withContext(Dispatchers.IO) {
        try {
            val api = ProfileApi.create()
            api.updateUserProfile(request)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
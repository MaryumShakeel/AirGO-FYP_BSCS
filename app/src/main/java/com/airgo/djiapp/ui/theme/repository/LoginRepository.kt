package com.airgo.djiapp.ui.theme.repository

import com.airgo.djiapp.ui.theme.network.AuthApi
import com.airgo.djiapp.ui.theme.network.LoginRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

suspend fun loginUser(email: String, password: String): Boolean {
    return withContext(Dispatchers.IO) {
        try {
            val api = AuthApi.create()
            // Pass a LoginRequest object instead of separate email/password
            val response = api.loginUser(LoginRequest(email = email, password = password))
            response.success
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}
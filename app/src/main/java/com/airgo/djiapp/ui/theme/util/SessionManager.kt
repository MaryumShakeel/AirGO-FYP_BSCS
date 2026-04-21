package com.airgo.djiapp.ui.theme.util

import android.content.Context
import android.content.SharedPreferences

class SessionManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("airgo_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_LOGGED_IN_EMAIL = "logged_in_email"
    }

    // Save login session
    fun saveLoginSession(email: String) {
        prefs.edit().putString(KEY_LOGGED_IN_EMAIL, email).apply()
    }

    // Clear session (logout)
    fun clearSession() {
        prefs.edit().remove(KEY_LOGGED_IN_EMAIL).apply()
    }

    // Check if user is logged in
    fun isLoggedIn(): Boolean {
        return prefs.getString(KEY_LOGGED_IN_EMAIL, null) != null
    }

    // Get logged in email
    fun getLoggedInEmail(): String? {
        return prefs.getString(KEY_LOGGED_IN_EMAIL, null)
    }
}
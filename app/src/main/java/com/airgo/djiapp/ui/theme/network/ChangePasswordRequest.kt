package com.airgo.djiapp.ui.theme.network

data class ChangePasswordRequest(
    val email: String,
    val currentPassword: String,
    val newPassword: String
)
package com.airgo.djiapp.ui.theme.network

data class ProfileUpdateRequest(
    val email: String,
    val username: String,
    val phone: String,
    val cnic: String,
    val city: String,
    val dob: String
)

data class ProfileUpdateResponse(
    val success: Boolean,
    val message: String
)
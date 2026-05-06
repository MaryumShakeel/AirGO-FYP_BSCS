package com.airgo.djiapp.ui.theme.network

import retrofit2.http.GET
import retrofit2.http.Query
import retrofit2.http.Body
import retrofit2.http.Headers
import retrofit2.http.PATCH
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

// Model for user profile
data class UserProfile(
    val username: String,
    val email: String,
    val phone: String,
    val cnic: String,
    val city: String,
    val dob: String
)

interface ProfileApi {

    @GET("profile")
    suspend fun getUserProfile(
        @Query("email") email: String
    ): UserProfile

    @Headers("Content-Type: application/json")
    @PATCH("profile")
    suspend fun updateUserProfile(
        @Body request: ProfileUpdateRequest
    ): ProfileUpdateResponse

    companion object {
        fun create(): ProfileApi {
            val retrofit = Retrofit.Builder()
                .baseUrl("http://192.168.100.11:5000/api/") // Backend URL
                .addConverterFactory(GsonConverterFactory.create())
                .build()
            return retrofit.create(ProfileApi::class.java)
        }
    }
}
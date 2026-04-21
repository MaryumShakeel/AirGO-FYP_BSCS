package com.airgo.djiapp.ui.theme.network

import retrofit2.http.Body
import retrofit2.http.Headers
import retrofit2.http.POST
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val success: Boolean,
    val message: String
)

interface AuthApi {
    @Headers("Content-Type: application/json")
    @POST("login")
    suspend fun loginUser(@Body request: LoginRequest): LoginResponse

    companion object {
        fun create(): AuthApi {
            val retrofit = Retrofit.Builder()
                .baseUrl("http://192.168.100.11:5000/api/") // backend URL
                .addConverterFactory(GsonConverterFactory.create())
                .build()
            return retrofit.create(AuthApi::class.java)
        }
    }
}
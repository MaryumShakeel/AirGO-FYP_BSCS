package com.airgo.djiapp.ui.theme.network


import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

data class SendOtpRequest(val phone: String)
data class VerifyOtpRequest(val phone: String, val otp: String)
data class RegisterRequest(
    val username: String,
    val email: String,
    val cnic: String,
    val password: String,
    val city: String,
    val dob: String,
    val phone: String
)

interface ApiService {

    @POST("otp/send-otp")
    suspend fun sendOtp(
        @Body request: SendOtpRequest
    ): Response<Unit>

    @POST("otp/verify-otp")
    suspend fun verifyOtp(
        @Body request: VerifyOtpRequest
    ): Response<Unit>

    @POST("auth/register")
    suspend fun register(
        @Body request: RegisterRequest
    ): Response<Void>

}
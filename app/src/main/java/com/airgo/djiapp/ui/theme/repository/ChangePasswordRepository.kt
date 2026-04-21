package com.airgo.djiapp.ui.theme.repository

import com.airgo.djiapp.ui.theme.network.ChangePasswordRequest
import com.airgo.djiapp.ui.theme.network.ChangePasswordResponse
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

interface ChangePasswordApi {

    @POST("profile/changePassword")
    suspend fun changePassword(
        @Body request: ChangePasswordRequest
    ): ChangePasswordResponse
}

private val api: ChangePasswordApi by lazy {

    Retrofit.Builder()
        .baseUrl("http://192.168.100.11:5000/api/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(ChangePasswordApi::class.java)
}

suspend fun changePassword(request: ChangePasswordRequest): ChangePasswordResponse? {
    return withContext(Dispatchers.IO) {
        try {
            api.changePassword(request)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
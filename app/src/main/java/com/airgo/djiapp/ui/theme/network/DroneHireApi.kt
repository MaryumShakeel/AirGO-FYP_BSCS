package com.airgo.djiapp.ui.theme.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

data class DroneHireResponse(
    val success: Boolean,
    val message: String
)

interface DroneHireApi {

    @POST("dronehire/create")
    suspend fun createOrder(
        @Body request: DroneHireRequest
    ): Response<DroneHireResponse>

}
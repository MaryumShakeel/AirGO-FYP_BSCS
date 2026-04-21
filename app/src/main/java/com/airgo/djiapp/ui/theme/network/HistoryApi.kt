package com.airgo.djiapp.ui.theme.network

import retrofit2.Response
import retrofit2.http.GET

interface HistoryApi {
    @GET("droneHire/all")  // backend GET route
    suspend fun getAllOrders(): Response<List<HistoryResponse>>
}
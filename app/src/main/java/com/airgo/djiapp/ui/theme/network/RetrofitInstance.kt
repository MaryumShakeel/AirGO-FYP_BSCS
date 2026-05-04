package com.airgo.djiapp.ui.theme.network

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitInstance {

    private const val BASE_URL = "http://192.168.100.11:5000/api/"
    val droneHireApi: DroneHireApi by lazy {

        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(DroneHireApi::class.java)

    }
}

// F-11: 192.168.18.178

// Riphah-S: 172.21.250.178

// Home: 192.168.100.11

// Papa: 192.168.36.229
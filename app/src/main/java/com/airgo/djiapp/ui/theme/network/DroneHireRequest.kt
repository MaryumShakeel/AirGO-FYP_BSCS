package com.airgo.djiapp.ui.theme.network

data class DroneHireRequest(

    val pickupAddress: String,
    val dropOffAddress: String,

    val pickupLat: Double,
    val pickupLng: Double,

    val dropLat: Double,
    val dropLng: Double,

    val itemName: String,
    val itemWeight: Double,

    val distanceKm: Double,
    val estimatedTime: Int,
    val deliveryCost: Int

)
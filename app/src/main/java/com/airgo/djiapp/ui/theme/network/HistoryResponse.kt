package com.airgo.djiapp.ui.theme.network


data class HistoryResponse(
    val _id: String,
    val itemName: String,
    val pickupAddress: String,
    val dropOffAddress: String,
    val distanceKm: Double,
    val estimatedTime: Int,
    val deliveryCost: Int,
    val paymentStatus: String,
    val orderStatus: String,
    val createdAt: String
)
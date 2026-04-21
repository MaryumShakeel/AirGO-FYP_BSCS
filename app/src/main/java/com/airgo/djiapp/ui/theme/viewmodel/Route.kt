package com.airgo.djiapp.ui.theme.viewmodel

import org.osmdroid.util.GeoPoint

data class Route(

    val start: GeoPoint,

    val destination: GeoPoint,

    val path: List<GeoPoint>,

    val distanceKm: Double

)
package com.airgo.djiapp.ui.theme.drone


import dji.sdk.base.BaseProduct
import dji.sdk.sdkmanager.DJISDKManager

object DroneManager {

    fun getDrone(): BaseProduct? {
        return DJISDKManager.getInstance().product
    }

    fun isDroneConnected(): Boolean {
        return getDrone()?.isConnected == true
    }
}
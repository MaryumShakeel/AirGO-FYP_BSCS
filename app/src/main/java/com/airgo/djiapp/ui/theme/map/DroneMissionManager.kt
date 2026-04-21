package com.airgo.djiapp.ui.theme.map

import android.util.Log
import dji.common.mission.waypoint.Waypoint
import dji.common.mission.waypoint.WaypointMission
import dji.common.mission.waypoint.WaypointMissionFinishedAction
import dji.common.mission.waypoint.WaypointMissionFlightPathMode
import dji.common.mission.waypoint.WaypointMissionHeadingMode
import dji.common.util.CommonCallbacks
import dji.sdk.flightcontroller.FlightController
import dji.sdk.mission.waypoint.WaypointMissionOperator
import dji.sdk.products.Aircraft
import dji.sdk.sdkmanager.DJISDKManager
import org.osmdroid.util.GeoPoint
import dji.common.flightcontroller.FlightControllerState

object DroneMissionManager {

    private val missionOperator: WaypointMissionOperator by lazy {
        DJISDKManager.getInstance().missionControl.waypointMissionOperator
    }

    // ✅ ADD: Flight Controller reference
    val flightController: FlightController? by lazy {
        val aircraft = DJISDKManager.getInstance().product as? Aircraft
        aircraft?.flightController
    }

    // --- Drone connection flag ---
    var isDroneConnected: Boolean = false
        private set

    fun setDroneConnected(connected: Boolean) {
        isDroneConnected = connected
    }

    /**
     * Convert A* route to DJI Waypoints
     */
    fun createMission(route: List<GeoPoint>): WaypointMission {
        val waypoints = mutableListOf<Waypoint>()
        for (point in route) {
            val waypoint = Waypoint(point.latitude, point.longitude, 20f)
            waypoint.speed = 8f
            waypoints.add(waypoint)
        }

        return WaypointMission.Builder()
            .waypointList(waypoints)
            .waypointCount(waypoints.size)
            .autoFlightSpeed(8f)
            .maxFlightSpeed(10f)
            .finishedAction(WaypointMissionFinishedAction.GO_HOME)
            .headingMode(WaypointMissionHeadingMode.AUTO)
            .flightPathMode(WaypointMissionFlightPathMode.NORMAL)
            .build()
    }

    /**
     * Upload Mission
     */
    fun uploadMission(
        mission: WaypointMission,
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        if (!isDroneConnected) {
            Log.e("DRONE", "Drone not connected yet. Cannot upload mission.")
            onError("Drone not connected yet")
            return
        }

        val error = missionOperator.loadMission(mission)
        if (error == null) {
            missionOperator.uploadMission { uploadError ->
                if (uploadError == null) {
                    Log.d("DRONE", "Mission Uploaded")
                    onSuccess()
                } else {
                    Log.e("DRONE", uploadError.description)
                    onError(uploadError.description)
                }
            }
        } else {
            Log.e("DRONE", error.description)
            onError(error.description)
        }
    }

    /**
     * Start Mission
     */
    fun startMission(
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        missionOperator.startMission { error ->
            if (error == null) {
                Log.d("DRONE", "Mission Started")
                onSuccess()
            } else {
                Log.e("DRONE", error.description)
                onError(error.description)
            }
        }
    }

    fun startTakeoff(onSuccess: () -> Unit, onError: (String) -> Unit) {
        flightController?.startTakeoff { error ->
            if (error == null) {
                Log.d("DRONE", "Takeoff started")
                onSuccess()
                // ADD THIS BLOCK RIGHT HERE
                Log.d("DRONE", "TAKEOFF SUCCESS")
                Log.d("DRONE", "MODE: ${flightController?.state?.flightMode}")
            } else {
                Log.e("DRONE", "Takeoff failed: ${error.description}")
                onError(error.description)
            }
        }
    }

    /**
     * ✅ PAUSE MISSION
     */
    fun pauseMission() {
        try {
            missionOperator.pauseMission { error ->
                if (error == null) {
                    Log.d("DRONE", "Mission Paused")
                } else {
                    Log.e("DRONE", "Pause failed: ${error.description}")
                }
            }
        } catch (e: Exception) {
            Log.e("DRONE", "Pause exception: ${e.message}")
        }
    }

    /**
     * ✅ RESUME MISSION
     */
    fun resumeMission() {
        try {
            missionOperator.resumeMission { error ->
                if (error == null) {
                    Log.d("DRONE", "Mission Resumed")
                } else {
                    Log.e("DRONE", "Resume failed: ${error.description}")
                }
            }
        } catch (e: Exception) {
            Log.e("DRONE", "Resume exception: ${e.message}")
        }
    }

    /**
     * ✅ RETURN TO HOME
     */
    fun returnToHome() {
        try {
            flightController?.startGoHome { error: dji.common.error.DJIError? ->
                if (error == null) {
                    Log.d("DRONE", "Returning Home")
                } else {
                    Log.e("DRONE", "RTH failed: ${error.description}")
                }
            }
        } catch (e: Exception) {
            Log.e("DRONE", "RTH exception: ${e.message}")
        }
    }

    /**
     * Drone Telemetry (GPS location)
     */
    fun listenToDroneLocation(onLocationUpdate: (GeoPoint) -> Unit) {
        val aircraft = DJISDKManager.getInstance().product as? Aircraft
        val fc: FlightController? = aircraft?.flightController

        fc?.setStateCallback { state: FlightControllerState ->
            val lat = state.aircraftLocation.latitude
            val lng = state.aircraftLocation.longitude

            if (lat != 0.0 && lng != 0.0) {
                onLocationUpdate(GeoPoint(lat, lng))
            }
        }
    }
}
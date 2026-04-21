package com.airgo.djiapp.ui.theme.map

import com.airgo.djiapp.ui.theme.viewmodel.Route
import org.osmdroid.util.GeoPoint
import java.util.PriorityQueue
import kotlin.math.*

object DroneRoutePlanner {

    private const val GRID_SIZE = 0.0005

    fun calculateRoute(start: GeoPoint, destination: GeoPoint): Route {

        val distance = calculateDistance(start, destination)

        val path = aStarPath(start, destination)

        return Route(
            start = start,
            destination = destination,
            path = path,
            distanceKm = distance
        )
    }

    // ---------------- A* NODE ----------------
    private data class Node(
        val lat: Int,
        val lon: Int,
        val g: Double,
        val h: Double,
        val parent: Node?
    ) {
        val f: Double get() = g + h
    }

    // ---------------- A* ALGORITHM ----------------
    private fun aStarPath(start: GeoPoint, end: GeoPoint): List<GeoPoint> {

        val openSet = PriorityQueue<Node>(compareBy { it.f })
        val closedSet = mutableSetOf<String>()

        fun heuristic(lat: Int, lon: Int): Double {
            val dLat = (lat * GRID_SIZE) - end.latitude
            val dLon = (lon * GRID_SIZE) - end.longitude
            return sqrt(dLat * dLat + dLon * dLon)
        }

        val startLat = (start.latitude / GRID_SIZE).toInt()
        val startLon = (start.longitude / GRID_SIZE).toInt()

        val startNode = Node(
            lat = startLat,
            lon = startLon,
            g = 0.0,
            h = heuristic(startLat, startLon),
            parent = null
        )

        openSet.add(startNode)

        val directions = listOf(
            1 to 0, -1 to 0,
            0 to 1, 0 to -1,
            1 to 1, -1 to -1,
            1 to -1, -1 to 1
        )

        while (openSet.isNotEmpty()) {

            val current = openSet.poll()
            val key = "${current.lat},${current.lon}"

            if (key in closedSet) continue
            closedSet.add(key)

            val currentGeo = GeoPoint(
                current.lat * GRID_SIZE,
                current.lon * GRID_SIZE
            )

            // Goal check
            if (calculateDistance(currentGeo, end) < 0.3) {
                return reconstructPath(current)
            }

            for (dir in directions) {

                val newLat = current.lat + dir.first
                val newLon = current.lon + dir.second
                val newKey = "$newLat,$newLon"

                if (newKey in closedSet) continue

                val newGeo = GeoPoint(
                    newLat * GRID_SIZE,
                    newLon * GRID_SIZE
                )

                val gCost = current.g + calculateDistance(currentGeo, newGeo)
                val hCost = heuristic(newLat, newLon)

                openSet.add(
                    Node(
                        lat = newLat,
                        lon = newLon,
                        g = gCost,
                        h = hCost,
                        parent = current
                    )
                )
            }
        }

        return generateFallbackStraightPath(start, end)
    }

    // ---------------- PATH RECONSTRUCTION ----------------
    private fun reconstructPath(node: Node): List<GeoPoint> {

        val path = mutableListOf<GeoPoint>()
        var current: Node? = node

        while (current != null) {

            path.add(
                GeoPoint(
                    current.lat * GRID_SIZE,
                    current.lon * GRID_SIZE
                )
            )

            current = current.parent
        }

        return path.reversed()
    }

    // ---------------- FALLBACK PATH ----------------
    private fun generateFallbackStraightPath(start: GeoPoint, end: GeoPoint): List<GeoPoint> {

        val steps = 20
        val path = mutableListOf<GeoPoint>()

        for (i in 0..steps) {

            val lat = start.latitude + (end.latitude - start.latitude) * i / steps
            val lon = start.longitude + (end.longitude - start.longitude) * i / steps

            path.add(GeoPoint(lat, lon))
        }

        return path
    }

    // ---------------- DISTANCE (UNCHANGED) ----------------
    private fun calculateDistance(a: GeoPoint, b: GeoPoint): Double {

        val earthRadius = 6371.0

        val dLat = Math.toRadians(b.latitude - a.latitude)
        val dLon = Math.toRadians(b.longitude - a.longitude)

        val lat1 = Math.toRadians(a.latitude)
        val lat2 = Math.toRadians(b.latitude)

        val h = sin(dLat / 2).pow(2) +
                cos(lat1) * cos(lat2) *
                sin(dLon / 2).pow(2)

        return earthRadius * 2 * atan2(sqrt(h), sqrt(1 - h))
    }
}
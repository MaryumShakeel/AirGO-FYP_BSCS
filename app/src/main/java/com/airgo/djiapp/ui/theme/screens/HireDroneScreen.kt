package com.airgo.djiapp.ui.theme.screens

import com.airgo.djiapp.ui.theme.network.DroneHireRequest
import com.airgo.djiapp.ui.theme.network.RetrofitInstance
import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Geocoder
import android.view.MotionEvent
import android.net.Uri
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Place
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.navigation.NavController
import com.airgo.djiapp.ui.theme.map.DroneRoutePlanner
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.Polyline
import org.osmdroid.views.overlay.mylocation.GpsMyLocationProvider
import org.osmdroid.views.overlay.mylocation.MyLocationNewOverlay
import androidx.compose.ui.Alignment
import java.util.*
import kotlin.math.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HireDroneScreen(navController: NavController) {

    val context = LocalContext.current
    val amber = Color(0xFFFFBF24)
    val coroutineScope = rememberCoroutineScope()
    val geocoder = Geocoder(context, Locale.getDefault())

    var pickupAddress by remember { mutableStateOf("") }
    var dropOffAddress by remember { mutableStateOf("") }
    var itemName by remember { mutableStateOf("") }
    var itemWeight by remember { mutableStateOf("") }

    var pickupPoint by remember { mutableStateOf<GeoPoint?>(null) }
    var dropOffPoint by remember { mutableStateOf<GeoPoint?>(null) }
    var routePath by remember { mutableStateOf<List<GeoPoint>>(emptyList()) }
    var routeDistance by remember { mutableStateOf(0.0) }

    var pickupMarker: Marker? by remember { mutableStateOf(null) }
    var dropOffMarker: Marker? by remember { mutableStateOf(null) }
    var routePolyline: Polyline? by remember { mutableStateOf(null) }

    val deliveryCost by remember { derivedStateOf { (routeDistance * 130).toInt() } }
    val estimatedTime by remember { derivedStateOf { (routeDistance * 2.5).toInt() } }

    // Payment states
    var cardName by remember { mutableStateOf("") }
    var cardNumber by remember { mutableStateOf("") }
    var expiryDate by remember { mutableStateOf("") }
    var cvc by remember { mutableStateOf("") }
    var paymentSuccessful by remember { mutableStateOf(false) }

    // LOCATION PERMISSION
    var hasLocationPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val permissionLauncher =
        rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) {
            hasLocationPermission = it
        }

    LaunchedEffect(Unit) {
        if (!hasLocationPermission) {
            permissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row {
                        Text("Air", fontWeight = FontWeight.Bold)
                        Text("GO", fontWeight = FontWeight.Bold, color = amber)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = { navController.navigate("home") }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
                    }
                }
            )
        }
    ) { padding ->

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {

            // --- Map with Hover Message ---
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            ) {
                // Map
                AndroidView(
                    modifier = Modifier.fillMaxSize(),
                    factory = { ctx ->

                        Configuration.getInstance().load(
                            ctx,
                            ctx.getSharedPreferences("osmdroid", Context.MODE_PRIVATE)
                        )

                        val map = MapView(ctx)
                        map.setTileSource(TileSourceFactory.MAPNIK)
                        map.setMultiTouchControls(true)
                        val controller = map.controller
                        controller.setZoom(17.0)

                        if (hasLocationPermission) {
                            val locationOverlay = MyLocationNewOverlay(GpsMyLocationProvider(ctx), map)
                            locationOverlay.enableMyLocation()
                            locationOverlay.enableFollowLocation()
                            map.overlays.add(locationOverlay)
                            locationOverlay.runOnFirstFix {
                                locationOverlay.myLocation?.let {
                                    controller.setCenter(GeoPoint(it.latitude, it.longitude))
                                }
                            }
                        }

                        map.setOnTouchListener { _, event ->
                            if (event.action == MotionEvent.ACTION_UP) {
                                val geo = map.projection.fromPixels(event.x.toInt(), event.y.toInt())
                                val geoPoint = GeoPoint(geo.latitude, geo.longitude)

                                coroutineScope.launch {
                                    val address = withContext(Dispatchers.IO) {
                                        try {
                                            geocoder.getFromLocation(
                                                geoPoint.latitude,
                                                geoPoint.longitude,
                                                1
                                            )?.firstOrNull()?.getAddressLine(0)
                                                ?: "Unknown"
                                        } catch (e: Exception) {
                                            "Unknown"
                                        }
                                    }

                                    if (pickupPoint == null) {
                                        pickupPoint = geoPoint
                                        pickupAddress = address
                                    } else {
                                        dropOffPoint = geoPoint
                                        dropOffAddress = address
                                    }
                                }
                            }
                            false
                        }

                        map
                    },
                    update = { map ->

                        pickupPoint?.let {
                            if (pickupMarker == null) {
                                pickupMarker = Marker(map).apply {
                                    position = it
                                    title = "Pickup"
                                    map.overlays.add(this)
                                }
                            } else pickupMarker!!.position = it
                        }

                        dropOffPoint?.let {
                            if (dropOffMarker == null) {
                                dropOffMarker = Marker(map).apply {
                                    position = it
                                    title = "Drop"
                                    map.overlays.add(this)
                                }
                            } else dropOffMarker!!.position = it
                        }

                        routePolyline?.let { map.overlays.remove(it) }

                        if (routePath.isNotEmpty()) {
                            routePolyline = Polyline().apply {
                                setPoints(routePath)
                                outlinePaint.color = android.graphics.Color.BLUE
                                width = 8f
                            }
                            map.overlays.add(routePolyline)
                        }

                        map.invalidate()
                    }
                )

                // Hover Info Message
                Box(
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .padding(horizontal = 16.dp, vertical = 12.dp)
                        .background(
                            color = Color.Black.copy(alpha = 0.8f),
                            shape = RoundedCornerShape(12.dp)
                        )
                        .padding(12.dp)
                ) {
                    Text(
                        text = "⚠️ The drone will hover for 1 minute at pick-up and drop-off locations for item handover.",
                        fontStyle = FontStyle.Italic,
                        fontSize = 14.sp,
                        color = Color.White
                    )
                }
            }

            // --- Form Inputs & Payment ---
            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {

                Text("Hire Drone Delivery", fontSize = 20.sp, fontWeight = FontWeight.Bold)

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = pickupAddress,
                    onValueChange = { pickupAddress = it },
                    label = { Text("Pick-up Location") },
                    leadingIcon = { Icon(Icons.Default.LocationOn, null) },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = dropOffAddress,
                    onValueChange = { dropOffAddress = it },
                    label = { Text("Drop-off Location") },
                    leadingIcon = { Icon(Icons.Default.Place, null) },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = itemName,
                    onValueChange = { itemName = it },
                    label = { Text("Item Name") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = itemWeight,
                    onValueChange = { input ->

                        val filtered = input.filter { it.isDigit() || it == '.' }

                        if (filtered.count { it == '.' } <= 1) {

                            val value = filtered.toDoubleOrNull()

                            if (value == null || (value >= 0 && value <= 1)) {
                                itemWeight = filtered
                            }
                        }
                    },
                    label = { Text("Weight (kg)") },
                    placeholder = { Text("0 – 1 kg only") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(20.dp))

                if (routeDistance > 0) {

                    Card(
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF3E0))
                    ) {

                        Column(Modifier.padding(18.dp)) {

                            Text(
                                "Delivery Summary",
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            Text("Distance: %.2f km".format(routeDistance))
                            Text("Estimated Time: $estimatedTime minutes")

                            Spacer(modifier = Modifier.height(6.dp))

                            Text(
                                "Cost: PKR $deliveryCost",
                                fontWeight = FontWeight.Bold,
                                color = amber
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // PAYMENT CARD

                    Card(
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = Color(0xFFFFF8E1)
                        ),
                        elevation = CardDefaults.cardElevation(8.dp)
                    ) {

                        Column(
                            modifier = Modifier.padding(18.dp)
                        ) {

                            Text(
                                "Card Payment",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            OutlinedTextField(
                                value = cardName,
                                onValueChange = { cardName = it },
                                label = { Text("Name on Card") },
                                modifier = Modifier.fillMaxWidth(),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = amber,
                                    focusedLabelColor = amber,
                                    cursorColor = amber
                                )
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            OutlinedTextField(
                                value = cardNumber,
                                onValueChange = { input ->

                                    val digits = input.filter { it.isDigit() }.take(16)

                                    cardNumber = digits.chunked(4).joinToString(" ")
                                },
                                label = { Text("Card Number") },
                                placeholder = { Text("xxxx xxxx xxxx xxxx") },
                                modifier = Modifier.fillMaxWidth(),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = amber,
                                    focusedLabelColor = amber,
                                    cursorColor = amber
                                )
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            Row {

                                OutlinedTextField(
                                    value = expiryDate,
                                    onValueChange = { input ->

                                        val digits = input.filter { it.isDigit() }.take(4)

                                        expiryDate = when {
                                            digits.length <= 2 -> digits
                                            else -> digits.substring(0, 2) + "/" + digits.substring(2)
                                        }
                                    },
                                    label = { Text("Expiry Date") },
                                    placeholder = { Text("MM/YY") },
                                    modifier = Modifier.weight(1f),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = amber,
                                        focusedLabelColor = amber,
                                        cursorColor = amber
                                    )
                                )

                                Spacer(modifier = Modifier.width(10.dp))

                                OutlinedTextField(
                                    value = cvc,
                                    onValueChange = {
                                        if (it.length <= 3)
                                            cvc = it
                                    },
                                    label = { Text("CVC") },
                                    modifier = Modifier.weight(1f),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = amber,
                                        focusedLabelColor = amber,
                                        cursorColor = amber
                                    )
                                )
                            }

                            Spacer(modifier = Modifier.height(14.dp))

                            val cardValid =
                                cardName.isNotBlank() &&
                                        cardNumber.replace(" ", "").length == 16 &&
                                        expiryDate.length == 5 &&
                                        cvc.length == 3

                            Button(
                                onClick = { paymentSuccessful = true },
                                enabled = cardValid,
                                modifier = Modifier.fillMaxWidth(),
                                colors = ButtonDefaults.buttonColors(containerColor = amber)
                            ) {
                                Text("Pay PKR $deliveryCost", color = Color.Black)
                            }

                            if (paymentSuccessful) {

                                Spacer(modifier = Modifier.height(10.dp))

                                Text(
                                    "Payment Successful ✓",
                                    color = Color(0xFF2E7D32),
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Hire drone button
                    Button(
                        onClick = {

                            coroutineScope.launch {

                                val request = DroneHireRequest(
                                    pickupAddress,
                                    dropOffAddress,
                                    pickupPoint!!.latitude,
                                    pickupPoint!!.longitude,
                                    dropOffPoint!!.latitude,
                                    dropOffPoint!!.longitude,
                                    itemName,
                                    itemWeight.toDouble(),
                                    routeDistance,
                                    estimatedTime,
                                    deliveryCost
                                )

                                try {

                                    val response = RetrofitInstance.droneHireApi.createOrder(request)

                                    if (response.isSuccessful) {

                                        android.widget.Toast
                                            .makeText(context, "Order Created", android.widget.Toast.LENGTH_SHORT)
                                            .show()

                                        navController.navigate(
                                            "orderTracking/" +
                                                    "${pickupPoint!!.latitude}/" +
                                                    "${pickupPoint!!.longitude}/" +
                                                    "${dropOffPoint!!.latitude}/" +
                                                    "${dropOffPoint!!.longitude}/" +
                                                    "${Uri.encode(pickupAddress)}/" +
                                                    "${Uri.encode(dropOffAddress)}/" +
                                                    "${routeDistance}/" +
                                                    "${estimatedTime}/" +
                                                    "${deliveryCost}"
                                        )

                                    } else {

                                        android.widget.Toast
                                            .makeText(context, "API Error: ${response.code()}", android.widget.Toast.LENGTH_SHORT)
                                            .show()
                                    }

                                } catch (e: Exception) {
                                    e.printStackTrace()

                                    android.widget.Toast
                                        .makeText(context, "Error: ${e.message}", android.widget.Toast.LENGTH_LONG)
                                        .show()

                                    Log.e("API_ERROR", "Full error: ", e)
                                }

                            }

                        },
                        enabled = paymentSuccessful,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Black)
                    ) {
                        Text("Request Drone", color = amber)
                    }
                }
            }
        }
    }

    LaunchedEffect(pickupPoint, dropOffPoint) {
        if (pickupPoint != null && dropOffPoint != null) {
            withContext(Dispatchers.Default) {
                val route = DroneRoutePlanner.calculateRoute(
                    pickupPoint!!,
                    dropOffPoint!!
                )
                routePath = route.path
                routeDistance = route.distanceKm
            }
        }
    }
}

private fun distance(a: GeoPoint, b: GeoPoint): Double {

    val earthRadius = 6371.0
    val dLat = Math.toRadians(b.latitude - a.latitude)
    val dLon = Math.toRadians(b.longitude - a.longitude)

    val lat1 = Math.toRadians(a.latitude)
    val lat2 = Math.toRadians(b.latitude)

    val h =
        sin(dLat / 2).pow(2) +
                cos(lat1) * cos(lat2) *
                sin(dLon / 2).pow(2)

    return earthRadius * 2 * atan2(sqrt(h), sqrt(1 - h))
}
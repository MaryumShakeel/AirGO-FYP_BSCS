package com.airgo.djiapp.ui.theme.screens

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.navigation.NavController
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.Polyline
import com.airgo.djiapp.ui.theme.map.DroneRoutePlanner
import com.airgo.djiapp.ui.theme.map.DroneMissionManager
import com.airgo.djiapp.ui.theme.ai.DroneFrameSender
import kotlinx.coroutines.delay
import android.util.Log
import androidx.compose.ui.text.font.FontWeight




@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DeliveryInfoCard(
    pickupAddress: String,
    dropAddress: String,
    distanceKm: Double,
    estimatedTime: Int,
    deliveryCost: Int
) {
    val amber = Color(0xFFFFA000)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFEDE3C7)),
        elevation = CardDefaults.cardElevation(8.dp)
    ) {
        Column(modifier = Modifier.padding(18.dp)) {

            Text(
                text = "Drone Delivering Package",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Pickup:",
                color = amber,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = pickupAddress,
                color = Color.Black
            )


            Text(
                text = "Drop-off:",
                color = amber,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = dropAddress,
                color = Color.Black
            )


            Spacer(modifier = Modifier.height(8.dp))

            Row {
                Text("Distance:", color = amber, fontWeight = FontWeight.Bold)
                Text(" %.2f km  ".format(distanceKm), color = Color.Black)

                Text("Time:", color = amber, fontWeight = FontWeight.Bold)
                Text(" $estimatedTime min  ", color = Color.Black)

                Text("Fare:", color = amber, fontWeight = FontWeight.Bold)
                Text(" PKR $deliveryCost", color = Color.Black)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderTrackingScreen(
    navController: NavController,
    pickupLat: Double,
    pickupLng: Double,
    dropLat: Double,
    dropLng: Double,
    pickupAddress: String,
    dropAddress: String,
    distanceKm: Double,
    estimatedTime: Int,
    deliveryCost: Int
) {
    val context = LocalContext.current
    val amber = Color(0xFFFFBF24)
    val labelColor = Color(0xFFFFA000)

    val pickup = GeoPoint(pickupLat, pickupLng)
    val drop = GeoPoint(dropLat, dropLng)

    var route by remember { mutableStateOf<List<GeoPoint>>(emptyList()) }
    var dronePosition by remember { mutableStateOf(pickup) }

    var isDroneConnected by remember { mutableStateOf(false) }
    var missionStarted by remember { mutableStateOf(false) }
    var isStartingMission by remember { mutableStateOf(false) }

    var aiStarted by remember { mutableStateOf(false) }

    // ✅ NEW STATES
    var reachedPickup by remember { mutableStateOf(false) }
    var reachedDrop by remember { mutableStateOf(false) }
    var hoverDonePickup by remember { mutableStateOf(false) }
    var hoverDoneDrop by remember { mutableStateOf(false) }

    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // Drone connection checker
    LaunchedEffect(Unit) {
        while (true) {
            isDroneConnected = DroneMissionManager.isDroneConnected
            delay(500)
        }
    }

    // Route + drone listener
    LaunchedEffect(Unit) {
        val result = DroneRoutePlanner.calculateRoute(pickup, drop)
        route = result.path

        DroneMissionManager.listenToDroneLocation { location ->
            dronePosition = location
        }
    }

    // AI stream
    LaunchedEffect(isDroneConnected, missionStarted) {
        if (isDroneConnected && !missionStarted && !aiStarted) {
            aiStarted = true
            DroneFrameSender.startStreaming { null }
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            DroneMissionManager.stopJoystickMode()
            DroneFrameSender.stopStreaming()
        }
    }

    // ================= PICKUP HOVER =================
    LaunchedEffect(dronePosition) {
        if (!reachedPickup && dronePosition.distanceToAsDouble(pickup) < 0.0002) {
            reachedPickup = true

            scope.launch {
                snackbarHostState.showSnackbar("📦 Please make the package ready")
            }

            DroneMissionManager.pauseMission()

            delay(60000) // 1 min hover

            hoverDonePickup = true
            DroneMissionManager.resumeMission()

            scope.launch {
                snackbarHostState.showSnackbar("🚀 Package loaded. Heading to destination")
            }
        }
    }

    // ================= DROP HOVER =================
    LaunchedEffect(dronePosition) {
        if (!reachedDrop && dronePosition.distanceToAsDouble(drop) < 0.0002) {
            reachedDrop = true

            scope.launch {
                snackbarHostState.showSnackbar("📍 Drone reached destination")
            }

            DroneMissionManager.pauseMission()

            delay(60000) // 1 min hover

            hoverDoneDrop = true

            scope.launch {
                snackbarHostState.showSnackbar("📦 Please collect your package")
            }

            // RETURN TO HOME
            DroneMissionManager.returnToHome()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Drone Delivery 🚁", fontSize = 22.sp, color = amber)
                        Text("Track your order in real-time", fontSize = 14.sp, color = Color.Gray)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back", tint = amber)
                    }
                },
                actions = {
                    Card(
                        modifier = Modifier
                            .padding(end = 8.dp)
                            .size(40.dp),
                        shape = RoundedCornerShape(50),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(6.dp)
                    ) {
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier.fillMaxSize()
                        ) {
                            TextButton(
                                onClick = {
                                    navController.navigate("home") {
                                        popUpTo("orderTracking") { inclusive = true }
                                    }
                                },
                                contentPadding = PaddingValues(0.dp)
                            ) {
                                Text(
                                    text = "Exit",
                                    color = amber,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFFFFF8E1))
            )
        }
    ) { padding ->

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {


            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            ) {
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
                        map.controller.setZoom(16.0)
                        map.controller.setCenter(pickup)
                        map
                    },
                    update = { map ->
                        map.overlays.clear()

                        val pickupMarker = Marker(map).apply { position = pickup }
                        val dropMarker = Marker(map).apply { position = drop }
                        val droneMarker = Marker(map).apply { position = dronePosition }

                        val polyline = Polyline().apply {
                            setPoints(route)
                            outlinePaint.color = android.graphics.Color.BLUE
                            width = 8f
                        }

                        map.overlays.add(polyline)
                        map.overlays.add(pickupMarker)
                        map.overlays.add(dropMarker)
                        map.overlays.add(droneMarker)
                        map.invalidate()
                    }
                )


                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 16.dp),
                    contentAlignment = Alignment.TopCenter
                )
                {
                    if (isDroneConnected) {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFE8F5E9)),
                            shape = RoundedCornerShape(50)
                        ) {
                            Text(
                                text = "🟢 Drone Connected",
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                                color = Color(0xFF2E7D32)
                            )
                        }
                    }
                    else
                    {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE)),
                            shape = RoundedCornerShape(50)
                        ) {
                            Text(
                                text = "🔴 Drone Disconnected",
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                                color = Color(0xFFC62828)
                            )
                        }
                    }
                }


                // ✅ Delivery Info Card (BOTTOM OVERLAY)
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(bottom = 16.dp),
                    contentAlignment = Alignment.BottomCenter
                ) {
                    DeliveryInfoCard(
                        pickupAddress = pickupAddress,
                        dropAddress = dropAddress,
                        distanceKm = distanceKm,
                        estimatedTime = estimatedTime,
                        deliveryCost = deliveryCost
                    )
                }


            }

            if (!missionStarted) {
                Button(
                    onClick = {
                        if (!isDroneConnected) return@Button

                        isStartingMission = true

                        DroneMissionManager.startJoystickMode(
                            onSuccess = {
                                missionStarted = true
                                isStartingMission = false

                                scope.launch {
                                    snackbarHostState.showSnackbar("🚁 Drone is hovering")
                                }
                            },
                            onError = {
                                isStartingMission = false
                            }
                        )
                    },



                    enabled = isDroneConnected && !isStartingMission,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .height(55.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = amber)
                ) {
                    Text(if (isStartingMission) "Starting..." else "Start Delivery Flight 🚀", color = Color.Black)
                }
            }

            val isDelivered = hoverDoneDrop

            if (isDelivered) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFE8F5E9))
                ) {
                    Column(
                        Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("Delivery Completed!")
                        Spacer(Modifier.height(8.dp))
                        Text("Drone is returning to home")

                        Spacer(Modifier.height(16.dp))

                        Button(
                            onClick = { navController.navigate("history") },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFBF24)),
                            elevation = ButtonDefaults.buttonElevation(defaultElevation = 6.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("View Order History", color = Color.White, fontWeight = FontWeight.Bold)
                        }

                        Spacer(Modifier.height(8.dp))

                        Button(
                            onClick = { navController.navigate("home") },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFBF24)),
                            elevation = ButtonDefaults.buttonElevation(defaultElevation = 6.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Back to Home", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }


        }
    }
}
package com.airgo.djiapp.ui.theme.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.ui.draw.shadow
import com.airgo.djiapp.ui.theme.network.HistoryApi
import com.airgo.djiapp.ui.theme.network.HistoryResponse
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.text.SimpleDateFormat
import java.util.*

data class OrderHistoryItem(
    val id: String,
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen(navController: NavController) {

    val gradientBackground = Brush.verticalGradient(
        colors = listOf(Color(0xFFFFF9E0), Color(0xFFFFF3B0)) // soft gradient like HomeScreen
    )
    val black = Color.Black
    val darkAmber = Color(0xFFFFA000)

    var orders by remember { mutableStateOf(listOf<OrderHistoryItem>()) }
    var isLoading by remember { mutableStateOf(true) }

    val scope = rememberCoroutineScope()

    // Setup Retrofit
    val retrofit = Retrofit.Builder()
        .baseUrl("http://192.168.100.11:5000/api/") // your backend base URL
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    val historyApi = retrofit.create(HistoryApi::class.java)

    // Fetch orders
    LaunchedEffect(Unit) {
        scope.launch {
            try {
                val response = historyApi.getAllOrders()
                if (response.isSuccessful) {
                    val list = response.body()?.map {
                        OrderHistoryItem(
                            id = it._id,
                            itemName = it.itemName,
                            pickupAddress = it.pickupAddress,
                            dropOffAddress = it.dropOffAddress,
                            distanceKm = it.distanceKm,
                            estimatedTime = it.estimatedTime,
                            deliveryCost = it.deliveryCost,
                            paymentStatus = it.paymentStatus,
                            orderStatus = it.orderStatus,
                            createdAt = SimpleDateFormat(
                                "dd MMM yyyy, HH:mm",
                                Locale.getDefault()
                            ).format(
                                SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
                                    .parse(it.createdAt)!!
                            )
                        )
                    } ?: emptyList()
                    orders = list
                } else {
                    // Log error if needed
                    println("HistoryScreen: Failed to fetch orders, code ${response.code()}")
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                isLoading = false
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Order History",
                        fontWeight = FontWeight.Bold,
                        fontSize = 22.sp,
                        color = black
                    )
                },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back", tint = darkAmber)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White),
                modifier = Modifier.shadow(4.dp)
            )
        },
        content = { padding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .background(gradientBackground)
            ) {
                Column(modifier = Modifier.fillMaxSize()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "All your previous deliveries",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = darkAmber,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                    )

                    if (isLoading) {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(color = darkAmber)
                        }
                    } else if (orders.isEmpty()) {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Text(
                                text = "No previous orders found",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Medium,
                                color = darkAmber
                            )
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            items(orders) { order ->
                                Card(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .shadow(3.dp, RoundedCornerShape(16.dp)),
                                    shape = RoundedCornerShape(16.dp),
                                    colors = CardDefaults.cardColors(containerColor = Color.White),
                                    elevation = CardDefaults.cardElevation(6.dp)
                                ) {
                                    Column(modifier = Modifier.padding(16.dp)) {
                                        Text(
                                            text = "Order ID: ${order.id}",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 16.sp,
                                            color = darkAmber
                                        )
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            text = "Item: ${order.itemName}",
                                            fontSize = 14.sp,
                                            color = black
                                        )
                                        Text(
                                            text = "Pickup: ${order.pickupAddress}",
                                            fontSize = 14.sp,
                                            color = black
                                        )
                                        Text(
                                            text = "Drop-off: ${order.dropOffAddress}",
                                            fontSize = 14.sp,
                                            color = black
                                        )
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text(
                                                text = "Distance: %.2f km".format(order.distanceKm),
                                                fontSize = 12.sp,
                                                color = darkAmber
                                            )
                                            Text(
                                                text = "Time: ${order.estimatedTime} min",
                                                fontSize = 12.sp,
                                                color = darkAmber
                                            )
                                            Text(
                                                text = "Fare: PKR ${order.deliveryCost}",
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = darkAmber
                                            )
                                        }
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text(
                                                text = "Payment: ${order.paymentStatus}",
                                                fontSize = 12.sp,
                                                color = if (order.paymentStatus == "PAID") Color(0xFF2E7D32) else Color.Red
                                            )
                                            Text(
                                                text = "Status: ${order.orderStatus}",
                                                fontSize = 12.sp,
                                                color = if (order.orderStatus == "DELIVERED") Color(0xFF2E7D32) else Color.Red
                                            )
                                        }
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            text = "Date: ${order.createdAt}",
                                            fontSize = 12.sp,
                                            color = darkAmber
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    )
}
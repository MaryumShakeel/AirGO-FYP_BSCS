package com.airgo.djiapp

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.airgo.djiapp.ui.theme.screens.HireDroneScreen
import com.airgo.djiapp.ui.theme.screens.HomeScreen
import com.airgo.djiapp.ui.theme.screens.SplashScreen
import com.airgo.djiapp.ui.theme.screens.SignUpScreen
import com.airgo.djiapp.ui.theme.screens.LoginScreen
import com.airgo.djiapp.ui.theme.screens.WelcomeScreen
import com.airgo.djiapp.ui.theme.screens.ProfileScreen
import com.airgo.djiapp.ui.theme.screens.OrderTrackingScreen
import com.airgo.djiapp.ui.theme.screens.HistoryScreen
import com.airgo.djiapp.ui.theme.screens.ChangePasswordScreen
import com.airgo.djiapp.ui.theme.screens.NotificationsScreen

@Composable
fun MyApp(navController: NavHostController) {

    NavHost(
        navController = navController,
        startDestination = "splash"
    ) {
        composable("splash") { SplashScreen(navController) }
        composable("welcome") { WelcomeScreen(navController) }
        composable("signup") { SignUpScreen(navController) }
        composable("login") { LoginScreen(navController) }
        composable("home") { HomeScreen(navController) }
        composable("hire_drone") { HireDroneScreen(navController) }
        composable("profile") { ProfileScreen(navController) }
        composable("changePassword") { ChangePasswordScreen(navController) }
        composable("history") { HistoryScreen(navController) }
        composable("notifications") { NotificationsScreen(navController) }


        // Updated orderTracking route with all parameters
        composable(
            "orderTracking/{pickupLat}/{pickupLng}/{dropLat}/{dropLng}/{pickupAddress}/{dropAddress}/{distanceKm}/{estimatedTime}/{deliveryCost}"
        ) { backStackEntry ->

            val args = backStackEntry.arguments

            val pickupLat = args?.getString("pickupLat")!!.toDouble()
            val pickupLng = args.getString("pickupLng")!!.toDouble()
            val dropLat = args.getString("dropLat")!!.toDouble()
            val dropLng = args.getString("dropLng")!!.toDouble()
            val pickupAddress = args.getString("pickupAddress") ?: "Pickup"
            val dropAddress = args.getString("dropAddress") ?: "Drop"
            val distanceKm = args.getString("distanceKm")!!.toDouble()
            val estimatedTime = args.getString("estimatedTime")!!.toInt()
            val deliveryCost = args.getString("deliveryCost")!!.toInt()

            OrderTrackingScreen(
                navController = navController,
                pickupLat = pickupLat,
                pickupLng = pickupLng,
                dropLat = dropLat,
                dropLng = dropLng,
                pickupAddress = pickupAddress,
                dropAddress = dropAddress,
                distanceKm = distanceKm,
                estimatedTime = estimatedTime,
                deliveryCost = deliveryCost
            )
        }
    }
}
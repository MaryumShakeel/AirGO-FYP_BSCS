package com.airgo.djiapp.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.airgo.djiapp.ui.theme.screens.SplashScreen
import com.airgo.djiapp.ui.theme.screens.HomeScreen
import com.airgo.djiapp.ui.theme.screens.HireDroneScreen


@Composable
fun NavGraph(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = "splash"
    ) {
        composable("splash") {
            SplashScreen(navController = navController)
        }
        composable("home") {
            HomeScreen(navController = navController)
        }
        composable("hireDrone") {
            HireDroneScreen(navController = navController)
        }
    }
}

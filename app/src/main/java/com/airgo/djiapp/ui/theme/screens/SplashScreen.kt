package com.airgo.djiapp.ui.theme.screens

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.airgo.djiapp.ui.theme.util.SessionManager
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(navController: NavController) {

    var startAnimation by remember { mutableStateOf(false) }

    val alphaAnim by animateFloatAsState(
        targetValue = if (startAnimation) 1f else 0f,
        animationSpec = tween(durationMillis = 1200)
    )

    val scaleAnim by animateFloatAsState(
        targetValue = if (startAnimation) 1f else 0.85f,
        animationSpec = tween(durationMillis = 1200)
    )

    LaunchedEffect(Unit) {
        startAnimation = true
        delay(2000)

        val sessionManager = SessionManager(navController.context)
        val isLoggedIn = sessionManager.isLoggedIn()

        if (isLoggedIn) {
            navController.navigate("home") {
                popUpTo("splash") { inclusive = true }
            }
        } else {
            navController.navigate("welcome") {
                popUpTo("splash") { inclusive = true }
            }
        }
    }

    val gradient = Brush.verticalGradient(
        colors = listOf(Color(0xFFFFF9E0), Color(0xFFFFF3B0))
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(gradient),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {

            // AirGO Logo without shadow
            Text(
                text = buildAnnotatedString {
                    withStyle(
                        style = SpanStyle(
                            color = Color.Black,
                            fontWeight = FontWeight.ExtraBold
                        )
                    ) { append("Air") }
                    withStyle(
                        style = SpanStyle(
                            color = Color(0xFFFFBF24),
                            fontWeight = FontWeight.ExtraBold
                        )
                    ) { append("GO") }
                },
                fontSize = 68.sp,
                modifier = Modifier
                    .alpha(alphaAnim)
                    .scale(scaleAnim)
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Tagline
            Text(
                text = "Fast. Safe. Autonomous.",
                fontSize = 17.sp,
                fontWeight = FontWeight.Medium,
                color = Color.DarkGray,
                modifier = Modifier.alpha(alphaAnim)
            )

            Spacer(modifier = Modifier.height(36.dp))

            CircularProgressIndicator(
                color = Color(0xFFFFBF24),
                strokeWidth = 3.dp,
                modifier = Modifier
                    .size(30.dp)
                    .alpha(alphaAnim)
            )
        }
    }
}
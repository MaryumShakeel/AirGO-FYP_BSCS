package com.airgo.djiapp.ui.theme.screens

import com.airgo.djiapp.ui.theme.util.SessionManager
import com.airgo.djiapp.ui.theme.repository.loginUser
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(navController: NavController) {

    val gradientBackground = Brush.verticalGradient(
        colors = listOf(Color(0xFFFFF9E0), Color(0xFFFFF3B0))
    )

    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var loginError by remember { mutableStateOf("") }

    val coroutineScope = rememberCoroutineScope()
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(gradientBackground)
            .verticalScroll(scrollState)
            .padding(28.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {

        Spacer(modifier = Modifier.height(60.dp))

        Text(
            text = buildAnnotatedString {
                withStyle(style = SpanStyle(color = Color.Black)) { append("Air") }
                withStyle(style = SpanStyle(color = Color(0xFFF59E0B), fontWeight = FontWeight.ExtraBold)) {
                    append("GO")
                }
            },
            fontSize = 40.sp,
            fontWeight = FontWeight.ExtraBold
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Login to your account",
            fontSize = 16.sp,
            color = Color.DarkGray
        )

        Spacer(modifier = Modifier.height(40.dp))

        Card(
            shape = RoundedCornerShape(18.dp),
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {

            Column(modifier = Modifier.padding(22.dp)) {

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Password") },
                    singleLine = true,
                    visualTransformation =
                        if (showPassword) VisualTransformation.None  // password visible
                        else PasswordVisualTransformation(),         // password hidden
                    trailingIcon = {
                        val icon = if (showPassword) Icons.Filled.Visibility else Icons.Filled.VisibilityOff
                        IconButton(onClick = { showPassword = !showPassword }) {
                            Icon(imageVector = icon, contentDescription = "Toggle Password", tint = Color(0xFFF59E0B))
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )

                Spacer(modifier = Modifier.height(26.dp))

                Button(
                    onClick = {
                        coroutineScope.launch {
                            isLoading = true
                            loginError = ""

                            val success = loginUser(email, password)
                            isLoading = false

                            if (success) {
                                // Save session
                                val sessionManager = SessionManager(navController.context)
                                sessionManager.saveLoginSession(email)

                                // IMPORTANT: save email for profile screen
                                com.airgo.djiapp.ui.theme.util.SessionCache.loggedInEmail = email

                                navController.navigate("home") {
                                    popUpTo("login") { inclusive = true }
                                }
                            } else {
                                loginError = "Invalid email or password"
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                        .shadow(6.dp, RoundedCornerShape(14.dp)),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFF59E0B),
                        contentColor = Color.White
                    )
                ) {
                    Text(
                        text = if (isLoading) "Logging in..." else "Login",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                }

                if (loginError.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(text = loginError, color = Color.Red, fontSize = 14.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(22.dp))

        Row {
            Text(text = "No account? ", fontSize = 14.sp, color = Color.Gray)
            Text(
                text = "Create Account",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFF59E0B),
                modifier = Modifier.clickable { navController.navigate("signup") }
            )
        }

        Spacer(modifier = Modifier.height(40.dp))
    }
}
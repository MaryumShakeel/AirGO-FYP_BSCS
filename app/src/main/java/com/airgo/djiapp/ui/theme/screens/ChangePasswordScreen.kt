package com.airgo.djiapp.ui.theme.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import kotlinx.coroutines.launch

import com.airgo.djiapp.ui.theme.network.ChangePasswordRequest
import com.airgo.djiapp.ui.theme.repository.changePassword
import com.airgo.djiapp.ui.theme.util.SessionManager

@Composable
fun ChangePasswordScreen(navController: NavController) {

    val gradientBackground = Brush.verticalGradient(
        colors = listOf(Color(0xFFFFF8E1), Color(0xFFFFE082))
    )

    val scope = rememberCoroutineScope()

    var currentPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }

    var currentVisible by remember { mutableStateOf(false) }
    var newVisible by remember { mutableStateOf(false) }
    var confirmVisible by remember { mutableStateOf(false) }

    var message by remember { mutableStateOf("") }

    val context = androidx.compose.ui.platform.LocalContext.current
    val sessionManager = SessionManager(context)
    val userEmail = sessionManager.getLoggedInEmail() ?: ""

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(gradientBackground)
            .verticalScroll(rememberScrollState())
            .padding(20.dp)
    ) {

        /* HEADER */
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = { navController.popBackStack() }) {
                Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.Black)
            }

            Text(
                text = "Change Password",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
        }

        Spacer(modifier = Modifier.height(30.dp))

        /* FORM CARD */
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier.fillMaxWidth()
        ) {

            Column(modifier = Modifier.padding(22.dp)) {

                Text(
                    text = "Update your account password",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.Black
                )

                Spacer(modifier = Modifier.height(20.dp))

                /* CURRENT PASSWORD */
                OutlinedTextField(
                    value = currentPassword,
                    onValueChange = { currentPassword = it },
                    label = { Text("Current Password") },
                    singleLine = true,
                    visualTransformation =
                        if (currentVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        IconButton(onClick = { currentVisible = !currentVisible }) {
                            Icon(
                                imageVector = if (currentVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = null
                            )
                        }
                    },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(16.dp))

                /* NEW PASSWORD */
                OutlinedTextField(
                    value = newPassword,
                    onValueChange = { newPassword = it },
                    label = { Text("New Password") },
                    singleLine = true,
                    visualTransformation =
                        if (newVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        IconButton(onClick = { newVisible = !newVisible }) {
                            Icon(
                                imageVector = if (newVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = null
                            )
                        }
                    },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(16.dp))

                /* CONFIRM PASSWORD */
                OutlinedTextField(
                    value = confirmPassword,
                    onValueChange = { confirmPassword = it },
                    label = { Text("Confirm New Password") },
                    singleLine = true,
                    visualTransformation =
                        if (confirmVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        IconButton(onClick = { confirmVisible = !confirmVisible }) {
                            Icon(
                                imageVector = if (confirmVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = null
                            )
                        }
                    },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))

                /* DISPLAY PASSWORD MISMATCH MESSAGE */
                if (newPassword.isNotEmpty() && confirmPassword.isNotEmpty() && newPassword != confirmPassword) {
                    Text(
                        text = "Passwords do not match",
                        color = Color.Red,
                        fontSize = 14.sp
                    )
                }

                Spacer(modifier = Modifier.height(17.dp))

                /* UPDATE BUTTON */
                Button(
                    onClick = {
                        if (userEmail.isEmpty()) {
                            message = "User not logged in"
                            return@Button
                        }

                        if (currentPassword.isBlank() || newPassword.isBlank() || confirmPassword.isBlank()) {
                            message = "Please fill all fields"
                            return@Button
                        }

                        if (newPassword != confirmPassword) {
                            message = "New passwords do not match"
                            return@Button
                        }

                        if (newPassword.length < 6) {
                            message = "Password must be at least 6 characters"
                            return@Button
                        }

                        scope.launch {
                            val request = ChangePasswordRequest(
                                email = userEmail,
                                currentPassword = currentPassword,
                                newPassword = newPassword
                            )

                            val response = changePassword(request)

                            message = response?.message ?: "Failed to update password"

                            if (response?.success == true) {
                                navController.popBackStack()
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(55.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFC107))
                ) {
                    Icon(imageVector = Icons.Default.Lock, contentDescription = null, tint = Color.Black)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "Update Password", color = Color.Black, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.height(12.dp))

                if (message.isNotEmpty()) {
                    Text(text = message, color = Color.Red, fontSize = 14.sp)
                }
            }
        }
    }
}
package com.airgo.djiapp.ui.theme.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.airgo.djiapp.ui.theme.network.ProfileUpdateRequest
import com.airgo.djiapp.ui.theme.network.UserProfile
import com.airgo.djiapp.ui.theme.repository.updateUserProfile
import com.airgo.djiapp.ui.theme.util.SessionManager
import com.airgo.djiapp.ui.theme.viewmodel.ProfileViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.launch

@Composable
fun ProfileScreen(
    navController: NavController,
    profileViewModel: ProfileViewModel = viewModel()
) {
    val sessionManager = SessionManager(navController.context)
    val userEmail = sessionManager.getLoggedInEmail() ?: ""

    val gradientBackground = Brush.verticalGradient(
        colors = listOf(Color(0xFFFFF8E1), Color(0xFFFFE082))
    )

    // Use default profile if null to avoid nullable errors
    val profileState by profileViewModel.profileData.collectAsState()
    val profile: UserProfile = profileState ?: UserProfile(
        username = "",
        phone = "",
        email = userEmail,
        cnic = "",
        city = "",
        dob = ""
    )

    val isLoading by profileViewModel.isLoading.collectAsState()
    val errorMessage by profileViewModel.errorMessage.collectAsState()

    // Editing state
    var isEditing by remember { mutableStateOf(false) }
    var editedUsername by remember { mutableStateOf(profile.username) }
    var editedPhone by remember { mutableStateOf(profile.phone) }
    var editedCnic by remember { mutableStateOf(profile.cnic) }
    var editedCity by remember { mutableStateOf(profile.city) }
    var editedDob by remember { mutableStateOf(profile.dob) }

    val coroutineScope = rememberCoroutineScope()
    var updateMessage by remember { mutableStateOf("") }
    var isUpdating by remember { mutableStateOf(false) }

    // Load profile safely
    LaunchedEffect(userEmail) {
        if (userEmail.isNotEmpty()) {
            try {
                profileViewModel.loadProfile(userEmail)
            } catch (_: Exception) {
                profileViewModel.setError("Unable to load profile. Showing local data.")
            }
        }
    }

    // Keep edited fields in sync with profile safely
    LaunchedEffect(profileState) {
        val p = profileState ?: return@LaunchedEffect
        editedUsername = p.username
        editedPhone = p.phone
        editedCnic = p.cnic
        editedCity = p.city
        editedDob = p.dob
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(gradientBackground)
            .verticalScroll(rememberScrollState())
            .padding(20.dp)
    ) {

        if (isLoading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Color.Black)
            }
        }

        if (errorMessage.isNotEmpty()) {
            Spacer(modifier = Modifier.height(8.dp))
            Text(errorMessage, color = Color.Red, fontWeight = FontWeight.Medium)
        }

        /* ---------------- PROFILE HEADER ---------------- */
        Card(
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier.fillMaxWidth().shadow(6.dp)
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp)
            ) {

                Surface(
                    shape = CircleShape,
                    color = Color(0xFFFFC107),
                    modifier = Modifier.size(90.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.AccountCircle,
                        contentDescription = "Profile",
                        tint = Color.Black,
                        modifier = Modifier.padding(10.dp)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                if (isEditing) {
                    OutlinedTextField(
                        value = editedUsername,
                        onValueChange = { editedUsername = it },
                        label = { Text("Username") }
                    )
                } else {
                    Text(
                        text = profile.username,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(22.dp))

        /* ---------------- ACCOUNT INFORMATION ---------------- */
        Card(
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier.fillMaxWidth().shadow(4.dp)
        ) {

            Column(modifier = Modifier.padding(20.dp)) {
                Text(
                    text = "Account Information",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )

                Spacer(modifier = Modifier.height(16.dp))

                ProfileRowEditable(
                    icon = Icons.Default.Phone,
                    label = "Phone",
                    value = editedPhone,
                    isEditing = isEditing,
                    onValueChange = { editedPhone = it }
                )
                ProfileRowEditable(
                    icon = Icons.Default.Email,
                    label = "Email",
                    value = profile.email,
                    isEditing = false
                )
                ProfileRowEditable(
                    icon = Icons.Default.CreditCard,
                    label = "CNIC",
                    value = editedCnic,
                    isEditing = isEditing,
                    onValueChange = { newValue ->
                        val digits = newValue.filter { it.isDigit() }.take(13)
                        editedCnic = buildString {
                            digits.forEachIndexed { index, c ->
                                append(c)
                                if (index == 4 || index == 11) append('-')
                            }
                        }
                    }
                )
                ProfileRowEditable(
                    icon = Icons.Default.LocationOn,
                    label = "City",
                    value = editedCity,
                    isEditing = isEditing,
                    onValueChange = { editedCity = it }
                )
                ProfileRowEditable(
                    icon = Icons.Default.Cake,
                    label = "Date of Birth",
                    value = editedDob,
                    isEditing = isEditing,
                    onValueChange = { newValue ->
                        val digits = newValue.filter { it.isDigit() }.take(8)
                        editedDob = buildString {
                            digits.forEachIndexed { index, c ->
                                append(c)
                                if (index == 3 || index == 5) append('/')
                            }
                        }
                    }
                )
            }
        }

        Spacer(modifier = Modifier.height(22.dp))

        /* ---------------- SETTINGS ---------------- */
        Text(
            text = "Account Settings",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black
        )

        Spacer(modifier = Modifier.height(12.dp))

        if (!isEditing) {
            SettingItem("Edit Profile") {
                isEditing = true
            }
            SettingItem("Change Password") {
                navController.navigate("changePassword")
            }
        } else {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                Button(
                    onClick = { isEditing = false },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFC107))
                ) {
                    Text("Cancel", color = Color.Black)
                }
                Button(
                    onClick = {
                        coroutineScope.launch {
                            updateMessage = ""

                            val cnicDigits = editedCnic.filter { it.isDigit() }
                            if (cnicDigits.length != 13) {
                                updateMessage = "CNIC must be exactly 13 digits"
                                return@launch
                            }

                            val dobRegex = Regex("""\d{4}/\d{2}/\d{2}""")
                            if (!dobRegex.matches(editedDob)) {
                                updateMessage = "DOB must be YYYY/MM/DD"
                                return@launch
                            }

                            isUpdating = true
                            val request = ProfileUpdateRequest(
                                email = profile.email,
                                username = editedUsername,
                                phone = editedPhone,
                                cnic = editedCnic,
                                city = editedCity,
                                dob = editedDob
                            )
                            val response = updateUserProfile(request)
                            isUpdating = false
                            if (response?.success == true) {
                                profileViewModel.loadProfile(userEmail)
                                isEditing = false
                            } else {
                                updateMessage = "Failed to update profile"
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFC107))
                ) {
                    Text(if (isUpdating) "Saving..." else "Save Changes", color = Color.Black)
                }
            }

            if (updateMessage.isNotEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(updateMessage, color = Color.Red)
            }
        }

        Spacer(modifier = Modifier.height(30.dp))

        Button(
            onClick = {
                sessionManager.clearSession()

                navController.navigate("welcome") {
                    popUpTo(0)
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color.Black)
        ) {
            Icon(
                imageVector = Icons.Default.Logout,
                contentDescription = null,
                tint = Color.White
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Logout",
                fontSize = 16.sp,
                color = Color.White
            )
        }
    }
}

@Composable
fun ProfileRowEditable(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String,
    isEditing: Boolean,
    onValueChange: (String) -> Unit = {}
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.padding(vertical = 10.dp)
    ) {
        Icon(imageVector = icon, contentDescription = null, tint = Color(0xFFFFA000), modifier = Modifier.size(22.dp))
        Spacer(modifier = Modifier.width(14.dp))
        Column {
            Text(text = label, fontSize = 12.sp, color = Color.Gray)
            if (isEditing) {
                OutlinedTextField(
                    value = value,
                    onValueChange = onValueChange,
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            } else {
                Text(text = value, fontSize = 15.sp, fontWeight = FontWeight.Medium, color = Color.Black)
            }
        }
    }
}

@Composable
fun SettingItem(text: String, onClick: () -> Unit = {}) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFD54F)), // soft amber
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp)
            .clickable { onClick() }
            .shadow(2.dp)
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(18.dp),
            fontSize = 15.sp,
            fontWeight = FontWeight.Medium,
            color = Color.Black
        )
    }
}
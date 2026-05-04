package com.airgo.djiapp.ui.theme.screens

import android.util.Patterns
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.*
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import java.util.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.runtime.saveable.rememberSaveable
import java.text.SimpleDateFormat
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.DatePicker
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.filled.CalendarMonth
import com.airgo.djiapp.ui.theme.network.RetrofitClient
import com.airgo.djiapp.ui.theme.network.SendOtpRequest
import com.airgo.djiapp.ui.theme.network.VerifyOtpRequest
import com.airgo.djiapp.ui.theme.network.RegisterRequest
import kotlinx.coroutines.launch
import androidx.compose.ui.platform.LocalContext
import android.widget.Toast


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SignUpScreen(navController: NavController) {

    // ---------------- Step Control ----------------
    var step by remember { mutableStateOf(1) } // 1 = Identity, 2 = Security, 3 = Personal Details
    val focusManager = LocalFocusManager.current
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    // ---------------- Step 1: Basic Identity ----------------
    var username by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var cnic by remember { mutableStateOf("") }
   // var phone by remember { mutableStateOf("") }

    val isEmailValid = Patterns.EMAIL_ADDRESS.matcher(email).matches()
    val isCnicValid = cnic.matches(Regex("\\d{5}-\\d{7}-\\d"))

    fun formatCnic(input: String): String {
        val digits = input.filter { it.isDigit() }
        val builder = StringBuilder()
        for (i in digits.indices) {
            builder.append(digits[i])
            if (i == 4 || i == 11) builder.append('-')
        }
        return builder.toString().take(15)
    }

    // ---------------- Step 2: Security ----------------
    var password by rememberSaveable { mutableStateOf("") }
    var confirmPassword by rememberSaveable { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var confirmPasswordVisible by remember { mutableStateOf(false) }

    fun passwordStrength(pass: String): String {
        return when {
            pass.length < 8 -> "Weak"
            pass.length in 8..10 -> "Medium"
            else -> "Strong"
        }
    }

    // ---------------- Step 3: Personal Details ----------------
    val pakistanCities = listOf(
        "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
        "Peshawar", "Quetta", "Multan", "Sialkot", "Gujranwala"
    )
    var cityExpanded by remember { mutableStateOf(false) }
    var city by remember { mutableStateOf("") }
    var dob by remember { mutableStateOf("") }
    val datePickerState = rememberDatePickerState()
    var showDatePicker by remember { mutableStateOf(false) }



    // ---------------- Step 4: Phone Verification ----------------
    var phone by remember { mutableStateOf("") }
    var otp by remember { mutableStateOf("") }
    var isOtpSent by remember { mutableStateOf(false) }
    var timerSeconds by remember { mutableStateOf(0) }
    var isOtpVerified by remember { mutableStateOf(false) }

    val isPhoneValid = phone.length == 11

    LaunchedEffect(timerSeconds) {
        if (timerSeconds > 0) {
            kotlinx.coroutines.delay(1000)
            timerSeconds--
        }
    }

    Scaffold { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "Create Account",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFFFA000)
            )

            Spacer(modifier = Modifier.height(24.dp))






            // --------------------------------- STEP 1: Identity ---------------------------------
            if (step == 1) {
                Text(
                    text = "Step 1 of 4: Basic Identity",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                Spacer(modifier = Modifier.height(16.dp))

                // Username
                OutlinedTextField(
                    value = username,
                    onValueChange = { if (it.all { c -> c.isLetter() || c.isWhitespace() }) username = it },
                    label = { Text("Username") },
                    singleLine = true,
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Email
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email Address") },
                    singleLine = true,
                    isError = email.isNotEmpty() && !isEmailValid,
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                )

                Spacer(modifier = Modifier.height(16.dp))

                // CNIC
                OutlinedTextField(
                    value = cnic,
                    onValueChange = { cnic = formatCnic(it) },
                    label = { Text("CNIC (xxxxx-xxxxxxx-x)") },
                    singleLine = true,
                    isError = cnic.isNotEmpty() && !isCnicValid,
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )

                Spacer(modifier = Modifier.height(16.dp))


                Spacer(modifier = Modifier.height(32.dp))

                Button(
                    onClick = {
                        if (username.isNotBlank() && isEmailValid && isCnicValid) {
                            step = 2
                        }
                    },
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(55.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFA000))
                ) {
                    Text("Next", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }

            // --------------------------------- STEP 2: Security ---------------------------------
            else if (step == 2) {
                Text(
                    text = "Step 2 of 4: Security",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                Spacer(modifier = Modifier.height(16.dp))

                // Password
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Password") },
                    singleLine = true,
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(
                                imageVector = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = "Toggle Password"
                            )
                        }
                    },
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
                )

                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Strength: ${passwordStrength(password)}",
                    color = when (passwordStrength(password)) {
                        "Weak" -> Color(0xFFFFA000) //
                        "Medium" -> Color(0xFFFF9800) //  orange
                        "Strong" -> Color(0xFF2E7D32) //green
                        else -> Color.Gray
                    },
                    fontSize = 12.sp
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Confirm Password
                OutlinedTextField(
                    value = confirmPassword,
                    onValueChange = { confirmPassword = it },
                    label = { Text("Confirm Password") },
                    singleLine = true,
                    isError = confirmPassword.isNotEmpty() && confirmPassword != password,
                    visualTransformation = if (confirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        IconButton(onClick = { confirmPasswordVisible = !confirmPasswordVisible }) {
                            Icon(
                                imageVector = if (confirmPasswordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = "Toggle Confirm Password"
                            )
                        }
                    },
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
                )

                if (confirmPassword.isNotEmpty() && confirmPassword != password) {
                    Text("Passwords do not match", color = Color.Red, fontSize = 12.sp)
                }

                Spacer(modifier = Modifier.height(32.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    OutlinedButton(
                        onClick = { step = 1 },
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.height(55.dp),
                        colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.White, contentColor = Color.Black)
                    ) { Text("Back", fontWeight = FontWeight.Bold) }

                    Button(
                        onClick = {
                            if (password.length < 8) {
                                Toast.makeText(context, "Password must be at least 8 characters", Toast.LENGTH_SHORT).show()
                                return@Button
                            }

                            if (confirmPassword != password) {
                                Toast.makeText(context, "Passwords do not match", Toast.LENGTH_SHORT).show()
                                return@Button
                            }

                            step = 3
                        },
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.height(55.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFA000))
                    ) { Text("Next", fontWeight = FontWeight.Bold) }
                }
            }



            // --------------------------------- STEP 3: Personal Details ---------------------------------
            else if (step == 3) {
                Text(
                    text = "Step 3 of 4: Personal Details",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                Spacer(modifier = Modifier.height(16.dp))

                // City dropdown
                Box(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = city,
                        onValueChange = { city = it },
                        label = { Text("City") },
                        placeholder = { Text("Select city") },
                        readOnly = true,
                        trailingIcon = { Text("▼", fontSize = 16.sp, modifier = Modifier.clickable { cityExpanded = !cityExpanded }) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp)
                    )
                    DropdownMenu(expanded = cityExpanded, onDismissRequest = { cityExpanded = false }, modifier = Modifier.fillMaxWidth()) {
                        pakistanCities.forEach { item ->
                            DropdownMenuItem(text = { Text(item) }, onClick = { city = item; cityExpanded = false })
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))



                fun formatDateInput(input: String): String {
                    val digits = input.filter { it.isDigit() }
                    val builder = StringBuilder()

                    for (i in digits.indices) {
                        builder.append(digits[i])
                        if (i == 1 || i == 3) builder.append('/')
                    }

                    return builder.toString().take(8)
                }


                // Date of Birth
                OutlinedTextField(
                    value = dob,
                    onValueChange = { dob = formatDateInput(it) },
                    label = { Text("Date of Birth (DD/MM/YY)") },
                    placeholder = { Text("xx/xx/xx") },
                    singleLine = true,
                    trailingIcon = {
                        IconButton(onClick = { showDatePicker = true }) {
                            Icon(
                                imageVector = Icons.Default.CalendarMonth, // calendar icon
                                contentDescription = "Pick Date"
                            )
                        }
                    },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp)
                )

                if (showDatePicker) {
                    DatePickerDialog(
                        onDismissRequest = { showDatePicker = false },
                        confirmButton = {
                            TextButton(onClick = {
                                datePickerState.selectedDateMillis?.let { millis ->
                                    val sdf = SimpleDateFormat("dd/MM/yy", Locale.getDefault())
                                    dob = sdf.format(Date(millis)) // ✅ writes into field
                                }
                                showDatePicker = false
                            }) {
                                Text("OK")
                            }
                        },
                        dismissButton = {
                            TextButton(onClick = { showDatePicker = false }) {
                                Text("Cancel")
                            }
                        }
                    ) {
                        DatePicker(state = datePickerState)
                    }
                }

                Spacer(modifier = Modifier.height(32.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    OutlinedButton(
                        onClick = { step = 2 },
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.height(55.dp),
                        colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.White, contentColor = Color.Black)
                    ) { Text("Back", fontWeight = FontWeight.Bold) }

                    Button(
                        onClick = { if (city.isNotBlank() && dob.isNotBlank()) step = 4 },
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.height(55.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFA000))
                    ) { Text("Next", fontWeight = FontWeight.Bold) }
                }
            }



            // --------------------------------- STEP 4: Phone Verification ---------------------------------
            else if (step == 4) {
                val context = LocalContext.current

                Text(
                    text = "Step 4 of 4: Phone Verification",
                    fontSize = 14.sp,
                    color = Color.Gray
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Phone Number
                OutlinedTextField(
                    value = phone,
                    onValueChange = {
                        if (it.length <= 11 && it.all { c -> c.isDigit() }) phone = it
                    },
                    label = { Text("Contact Number") },
                    singleLine = true,
                    isError = phone.isNotEmpty() && !isPhoneValid,
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Send OTP Button
                Button(
                    onClick = {
                        if (isPhoneValid) {
                            scope.launch {
                                try {
                                    val response = RetrofitClient.instance.sendOtp(
                                        SendOtpRequest(phone)
                                    )

                                    if (response.isSuccessful) {
                                        isOtpSent = true
                                        isOtpVerified = false  // reset verification
                                        timerSeconds = 60
                                        otp = ""  // clear previous OTP
                                    }
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                }
                            }
                        }
                    },

                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFA000))
                ) {
                    Text("Send OTP")
                }

                if (isOtpSent) {

                    Spacer(modifier = Modifier.height(16.dp))

                    OutlinedTextField(
                        value = otp,
                        onValueChange = { otp = it },
                        enabled = !isOtpVerified,
                        label = { Text("Enter OTP") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                    )

                    if (isOtpVerified) {
                        Text(
                            text = "✔ OTP Verified",
                            color = Color(0xFF2E7D32),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    } else {
                        if (timerSeconds > 0) {
                            Text(
                                text = "OTP expires in $timerSeconds seconds",
                                color = Color.Red,
                                fontSize = 12.sp
                            )
                        } else if (isOtpSent) {
                            Text(
                                text = "OTP expired. Please resend.",
                                color = Color.Red,
                                fontSize = 12.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Verify OTP Button

                    val otpButtonLabel = if (timerSeconds > 0) "Verify OTP" else "Re-send OTP"

                    Button(
                        onClick = {
                            scope.launch {
                                try {
                                    if (timerSeconds > 0) {
                                        // Verify OTP
                                        val response = RetrofitClient.instance.verifyOtp(
                                            VerifyOtpRequest(phone, otp)
                                        )
                                        if (response.isSuccessful) {
                                            isOtpVerified = true
                                            isOtpSent = false   // stop OTP UI
                                            timerSeconds = 0  // stop countdown
                                            otp = ""
                                            Toast.makeText(context, "OTP verified successfully", Toast.LENGTH_SHORT).show()
                                        } else {
                                            isOtpVerified = false
                                            val errorMsg = response.errorBody()?.string() ?: "OTP verification failed"
                                            Toast.makeText(context, errorMsg, Toast.LENGTH_LONG).show()
                                        }
                                    } else {
                                        // Resend OTP
                                        val response = RetrofitClient.instance.sendOtp(
                                            SendOtpRequest(phone)
                                        )
                                        if (response.isSuccessful) {
                                            timerSeconds = 60
                                            otp = ""
                                            isOtpVerified = false
                                            isOtpSent = true
                                            Toast.makeText(context, "OTP resent", Toast.LENGTH_SHORT).show()
                                        }
                                    }
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                    Toast.makeText(context, "Error verifying OTP", Toast.LENGTH_SHORT).show() }
                            }
                        },
                        enabled = !isOtpVerified,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFA000))
                    ) {
                        Text(otpButtonLabel)
                    }
                }

                Spacer(modifier = Modifier.height(32.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    OutlinedButton(
                        onClick = { step = 3 },
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.height(55.dp)
                    ) {
                        Text("Back")
                    }

                    Button(
                        onClick = {
                            if (isOtpVerified) {
                                scope.launch {
                                    try {
                                        val response = RetrofitClient.instance.register(
                                            RegisterRequest(
                                                username = username,
                                                email = email,
                                                cnic = cnic,
                                                password = password,
                                                city = city,
                                                dob = dob,
                                                phone = phone
                                            )
                                        )

                                        if (response.isSuccessful) {
                                            Toast.makeText(context, "Registered successfully! Please login.", Toast.LENGTH_LONG).show()
                                            // Navigate to WelcomeScreen and close SignUp
                                            navController.navigate("welcome") {
                                                popUpTo("signup") { inclusive = true }
                                            }
                                        } else {
                                            val errorMsg = response.errorBody()?.string() ?: "Registration failed"
                                            Toast.makeText(context, errorMsg, Toast.LENGTH_LONG).show()
                                        }
                                    } catch (e: Exception) {
                                        e.printStackTrace()
                                        Toast.makeText(context, "Error during registration", Toast.LENGTH_SHORT).show()
                                    }
                                }
                            }
                        },
                        enabled = isOtpVerified,
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.height(55.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFA000))
                    ) {
                        Text("Register")
                    }

                }
            }


        }
    }
}
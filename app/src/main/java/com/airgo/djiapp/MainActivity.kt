package com.airgo.djiapp

import android.Manifest
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.core.app.ActivityCompat
import androidx.navigation.compose.rememberNavController
import dji.common.error.DJIError
import dji.common.error.DJISDKError
import dji.sdk.base.BaseComponent
import dji.sdk.base.BaseProduct
import dji.sdk.sdkmanager.DJISDKInitEvent
import dji.sdk.sdkmanager.DJISDKManager
import com.airgo.djiapp.ui.theme.map.DroneMissionManager

class MainActivity : ComponentActivity() {

    private val REQUIRED_PERMISSIONS = arrayOf(
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.ACCESS_COARSE_LOCATION,
        Manifest.permission.READ_PHONE_STATE,
        Manifest.permission.WRITE_EXTERNAL_STORAGE,
        Manifest.permission.READ_EXTERNAL_STORAGE
    )

    companion object {
        private const val TAG = "AirGO-DJI"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Request permissions
        ActivityCompat.requestPermissions(this, REQUIRED_PERMISSIONS, 1)

        // Initialize DJI SDK
        registerDJISDK()

        // Compose UI
        setContent {
            val navController = rememberNavController()
            MyApp(navController)
        }
    }

    private fun registerDJISDK() {
        DJISDKManager.getInstance().registerApp(
            applicationContext,
            object : DJISDKManager.SDKManagerCallback {

                override fun onRegister(error: DJIError?) {

                    if (error == DJISDKError.REGISTRATION_SUCCESS) {
                        Log.d(TAG, "DJI SDK Registration SUCCESS")

                        runOnUiThread {
                            Toast.makeText(
                                applicationContext,
                                "DJI SDK Registered",
                                Toast.LENGTH_LONG
                            ).show()
                        }

                        // Start connecting to drone
                        DJISDKManager.getInstance().startConnectionToProduct()

                        Log.d("DJI", "PRODUCT CHECK: ${DJISDKManager.getInstance().product}")

                    } else {
                        Log.e(TAG, "DJI SDK Registration FAILED: ${error?.description}")
                        runOnUiThread {
                            Toast.makeText(
                                applicationContext,
                                "DJI SDK Registration Failed",
                                Toast.LENGTH_LONG
                            ).show()
                        }
                    }
                }

                override fun onProductDisconnect() {
                    Log.d(TAG, "Drone Disconnected")
                    DroneMissionManager.setDroneConnected(false) // --- FLAG UPDATED ---
                }

                override fun onProductConnect(product: BaseProduct?) {
                    Log.d(TAG, "Connected: ${product?.model}")

                    // connection flag
                    DroneMissionManager.setDroneConnected(true)

                    // product check (AUTH / activation check)
                    Log.d(TAG, "Product Object: $product")
                    Log.d(TAG, "Product Null Check: ${product != null}")

                    val aircraft = product as? dji.sdk.products.Aircraft
                    val fc = aircraft?.flightController

                    fc?.setStateCallback { state ->
                        Log.d("DJI", "IS FLYING: ${state.isFlying}")
                        Log.d("DJI", "GPS LEVEL: ${state.gpsSignalLevel}")
                    }
                }

                override fun onProductChanged(product: BaseProduct?) {
                    Log.d(TAG, "Product Changed: ${product?.model}")
                }

                override fun onComponentChange(
                    componentKey: BaseProduct.ComponentKey?,
                    oldComponent: BaseComponent?,
                    newComponent: BaseComponent?
                ) {
                    Log.d(TAG, "Component Changed: $componentKey")
                }

                override fun onInitProcess(event: DJISDKInitEvent?, totalProcess: Int) {
                    Log.d(TAG, "SDK Init Progress: $event")
                }

                override fun onDatabaseDownloadProgress(current: Long, total: Long) {
                    Log.d(TAG, "Database Download: $current / $total")
                }
            }
        )
    }
}
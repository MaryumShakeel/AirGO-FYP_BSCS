package com.airgo.djiapp.ui.theme.ai

import android.graphics.Bitmap
import android.os.Handler
import android.os.Looper
import androidx.core.graphics.scale
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.*
import java.io.ByteArrayOutputStream
import okhttp3.MediaType.Companion.toMediaType


object DroneFrameSender {

    private val client = OkHttpClient()
    private val handler = Handler(Looper.getMainLooper())

    var isStreaming = false

    fun startStreaming(getFrame: () -> Bitmap?) {

        isStreaming = true

        val task = object : Runnable {
            override fun run() {

                if (!isStreaming) return

                val bitmap = getFrame()

                if (bitmap != null) {
                    sendFrame(bitmap)
                }

                handler.postDelayed(this, 300) // 300ms real-time stream
            }
        }

        handler.post(task)
    }

    fun stopStreaming() {
        isStreaming = false
    }

    private fun sendFrame(bitmap: Bitmap) {

        CoroutineScope(Dispatchers.IO).launch {

            val stream = ByteArrayOutputStream()
            val resized = bitmap.scale(640, 480)
            resized.compress(Bitmap.CompressFormat.JPEG, 80, stream)

            val requestBody = MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart(
                    "image",
                    "frame.jpg",
                    RequestBody.create(
                        "image/jpeg".toMediaType(),
                        stream.toByteArray()
                    )
                )
                .build()

            val request = Request.Builder()
                .url("http://YOUR_BACKEND_IP:5000/api/frame")
                .post(requestBody)
                .build()

            client.newCall(request).execute().use { response ->
                // AI response ignored or used later if needed
            }
        }
    }
}
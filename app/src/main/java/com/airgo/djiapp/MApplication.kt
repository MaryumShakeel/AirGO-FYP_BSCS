package com.airgo.djiapp

import android.app.Application
import android.content.Context
import androidx.multidex.MultiDex
import com.secneo.sdk.Helper

class MApplication : Application() {

    override fun attachBaseContext(base: Context) {
        super.attachBaseContext(base)
        MultiDex.install(this)
    }

    override fun onCreate() {
        super.onCreate()
        Helper.install(this)
    }
}
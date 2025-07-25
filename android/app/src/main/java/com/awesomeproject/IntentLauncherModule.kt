package com.awesomeproject

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments

class IntentLauncherModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "IntentLauncher"

    @ReactMethod
   fun getInitialScreen(promise: Promise) {
    val activity = currentActivity
    if (activity != null) {
      val screen = activity.intent?.getStringExtra("screen")
      promise.resolve(screen)
    } else {
      promise.resolve(null)
    }
  }
}

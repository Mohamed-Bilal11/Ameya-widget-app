package com.awesomeproject

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.content.Intent
import android.os.Bundle
import android.content.Context

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "AwesomeProject"

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
    handleWidgetIntent(intent)
  }

  override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    handleWidgetIntent(intent)
  }

  private fun handleWidgetIntent(intent: Intent?) {
    val screen = intent?.getStringExtra("screen")
    if (!screen.isNullOrEmpty()) {
      val prefs = getSharedPreferences("MyAppStorage", Context.MODE_PRIVATE)
      prefs.edit().putString("initial_screen", screen).apply()
    }
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
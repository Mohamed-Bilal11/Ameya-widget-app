package com.awesomeproject

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.awesomeproject.SimpleWidgetProvider

class WidgetUpdaterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "WidgetUpdater"

    @ReactMethod
    fun updateWidget(data: String,type: String) {
        val context = reactApplicationContext
        val prefs = context.getSharedPreferences("MyAppStorage", Context.MODE_PRIVATE)
        
        prefs.edit().putString("widget_text", data).putString("widget_type", type).apply()
        

        val intent = Intent(context, SimpleWidgetProvider::class.java).apply {
            action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
        }

        val ids = AppWidgetManager.getInstance(context)
            .getAppWidgetIds(ComponentName(context, SimpleWidgetProvider::class.java))
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)

        context.sendBroadcast(intent)
    }
}

package com.awesomeproject

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import android.content.SharedPreferences
import com.awesomeproject.R
import android.content.ComponentName
import android.content.Intent

class SimpleWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(
        context: Context?,
        appWidgetManager: AppWidgetManager?,
        appWidgetIds: IntArray?
    ) {
        super.onUpdate(context, appWidgetManager, appWidgetIds)

        if (context == null || appWidgetManager == null || appWidgetIds == null) return

        val prefs: SharedPreferences = context.getSharedPreferences("MyAppStorage", Context.MODE_PRIVATE)
        val text = prefs.getString("widget_text", "No data")
        val type = prefs.getString("widget_type", "food")

        val views = RemoteViews(context.packageName, R.layout.simple_widget_layout)

       
        views.setTextViewText(R.id.widget_text, text)

        val iconRes = when (type) {
            "food" -> R.drawable.addfood
            "movement" -> R.drawable.movement
            "activity" -> R.drawable.activityicon
            else -> R.drawable.addfood
        }
        views.setImageViewResource(R.id.widget_icon, iconRes)
 views.setImageViewResource(R.id.widget_icon, iconRes)
        views.setImageViewResource(R.id.widget_logo, R.drawable.ameyalogo)

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("screen", type)
        }
        val pendingIntent = PendingIntent.getActivity(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widgetCard, pendingIntent)

        appWidgetIds.forEach { widgetId ->
            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }
}

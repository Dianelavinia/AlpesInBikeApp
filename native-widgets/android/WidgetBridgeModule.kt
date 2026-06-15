// Pont natif Android pour pousser les stats vers le widget Glance.
//
// A copier dans android/app/src/main/java/com/alpesinbike/widget/WidgetBridgeModule.kt
// apres prebuild Expo.
//
// Le widget AlpesInBikeWidget.kt lit ensuite via :
//   getSharedPreferences("alpes_widget", MODE_PRIVATE).getInt("km", 0)

package com.alpesinbike.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class WidgetBridgeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "WidgetBridge"

    @ReactMethod
    fun setData(data: ReadableMap, promise: Promise) {
        try {
            val ctx: Context = reactApplicationContext
            val editor = ctx.getSharedPreferences("alpes_widget", Context.MODE_PRIVATE).edit()
            val iter = data.keySetIterator()
            while (iter.hasNextKey()) {
                val key = iter.nextKey()
                when (data.getType(key)) {
                    com.facebook.react.bridge.ReadableType.Number -> editor.putInt(key, data.getInt(key))
                    com.facebook.react.bridge.ReadableType.String -> editor.putString(key, data.getString(key))
                    com.facebook.react.bridge.ReadableType.Boolean -> editor.putBoolean(key, data.getBoolean(key))
                    else -> {}
                }
            }
            editor.apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("write_error", e.message, e)
        }
    }

    @ReactMethod
    fun reloadAll(promise: Promise) {
        try {
            val ctx: Context = reactApplicationContext
            val mgr = AppWidgetManager.getInstance(ctx)
            val name = ComponentName(ctx, AlpesInBikeWidgetReceiver::class.java)
            val ids = mgr.getAppWidgetIds(name)
            // Notify Glance pour redraw
            if (ids.isNotEmpty()) {
                val intent = android.content.Intent(ctx, AlpesInBikeWidgetReceiver::class.java)
                intent.action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
                ctx.sendBroadcast(intent)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("reload_error", e.message, e)
        }
    }
}

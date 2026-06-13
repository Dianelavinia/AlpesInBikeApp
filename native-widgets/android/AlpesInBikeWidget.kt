// Widget Jetpack Glance pour Android, à intégrer via react-native-android-widget.
//
// Mise en route :
//   1. yarn add react-native-android-widget
//   2. Plugin dans app.json + prebuild
//   3. Copier ce fichier dans android/app/src/main/java/com/alpesinbike/widget/
//   4. Données partagées via SharedPreferences "alpes_widget", remplies par
//      l'app à chaque ouverture et chaque fin de ride.
//
// Documentation : https://github.com/sAleksovski/react-native-android-widget

package com.alpesinbike.widget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.*
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider

private val brandOrange = Color(0xFFE15A23)
private val brandForest = Color(0xFF0D4F3D)
private val brandCream  = Color(0xFFFAF7F2)

data class AlpesData(
    val km: Int,
    val co2: Int,
    val rank: Int,
    val rankTotal: Int,
    val monthlyKm: Int,
    val monthlyGoal: Int,
    val badges: Int,
)

private fun loadData(ctx: Context): AlpesData {
    val p = ctx.getSharedPreferences("alpes_widget", Context.MODE_PRIVATE)
    return AlpesData(
        km          = p.getInt("km", 248),
        co2         = p.getInt("co2", 312),
        rank        = p.getInt("rank", 4),
        rankTotal   = p.getInt("rankTotal", 26),
        monthlyKm   = p.getInt("monthlyKm", 248),
        monthlyGoal = p.getInt("monthlyGoal", 400),
        badges      = p.getInt("badges", 8),
    )
}

class AlpesInBikeWidget : GlanceAppWidget() {
    override val sizeMode = SizeMode.Exact

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val data = loadData(context)
        provideContent {
            WidgetContent(data)
        }
    }
}

@Composable
private fun WidgetContent(data: AlpesData) {
    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(brandForest)
            .cornerRadius(22.dp)
            .padding(14.dp),
        verticalAlignment = Alignment.Vertical.SpaceBetween,
    ) {
        Text(
            "ALPES IN BIKE",
            style = TextStyle(color = ColorProvider(Color.White.copy(alpha = 0.7f)), fontSize = 9.sp, fontWeight = FontWeight.Bold),
        )
        Column {
            Text("${data.km}", style = TextStyle(color = ColorProvider(Color.White), fontSize = 44.sp, fontWeight = FontWeight.Bold))
            Text("km cette semaine", style = TextStyle(color = ColorProvider(Color.White.copy(alpha = 0.8f)), fontSize = 11.sp))
        }
        Row(modifier = GlanceModifier.fillMaxWidth()) {
            Text(
                "#${data.rank} sur ${data.rankTotal}",
                style = TextStyle(color = ColorProvider(brandOrange), fontSize = 11.sp, fontWeight = FontWeight.Bold),
            )
        }
    }
}

class AlpesInBikeWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget = AlpesInBikeWidget()
}

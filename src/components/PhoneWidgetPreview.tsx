import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";

/**
 * Rendu des widgets téléphone (iOS WidgetKit / Android Glance) tels qu'ils
 * apparaîtront sur l'écran d'accueil. Sert à la fois de preview in-app
 * (écran de config) et de gabarit visuel pour les widgets natifs réels.
 *
 * Pour les widgets natifs production :
 *   - iOS : extension WidgetKit via `expo-apple-targets`, voir
 *           `ios-widgets/AlpesInBikeWidget.swift` (Swift SwiftUI)
 *   - Android : Jetpack Glance via `react-native-android-widget`,
 *                voir `android-widgets/AlpesInBikeWidget.kt`
 *
 * Les widgets natifs lisent les données depuis un App Group iOS / SharedPrefs
 * Android, mis à jour à chaque ouverture de l'app et fin de ride.
 */

export type WidgetData = {
  km: number;
  co2: number;
  rank: number;
  rankTotal: number;
  streakDays: number;
  monthlyKm: number;
  monthlyGoal: number;
  badges: number;
};

// ---------------------------------------------------------------------------
// Petit widget carré (iOS systemSmall, Android 2x2)
// ---------------------------------------------------------------------------

export function SmallWidget({ data }: { data: WidgetData }) {
  return (
    <View style={[styles.frame, styles.small]}>
      <LinearGradient colors={[Colors.brand.forest, Colors.brand.forestDark]} style={StyleSheet.absoluteFill} />
      <View style={styles.smallTop}>
        <Ionicons name="bicycle" size={14} color={Colors.brand.orangeLight} />
        <Text style={styles.brandLabel}>ALPES IN BIKE</Text>
      </View>
      <Text style={styles.smallBig}>{data.km}</Text>
      <Text style={styles.smallUnit}>km cette semaine</Text>
      <View style={styles.smallFoot}>
        <Ionicons name="trophy" size={11} color={Colors.brand.orange} />
        <Text style={styles.smallFootText}>#{data.rank} sur {data.rankTotal}</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Widget moyen rectangle (iOS systemMedium, Android 4x2)
// ---------------------------------------------------------------------------

export function MediumWidget({ data }: { data: WidgetData }) {
  const pct = Math.min(100, Math.round((data.monthlyKm / data.monthlyGoal) * 100));
  return (
    <View style={[styles.frame, styles.medium]}>
      <LinearGradient colors={[Colors.bg.card, "#FAF7F2"]} style={StyleSheet.absoluteFill} />
      <View style={styles.mediumRow}>
        <View style={styles.mediumIcon}>
          <Ionicons name="leaf" size={18} color={Colors.brand.forest} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.mediumLabel}>Bilan carbone</Text>
          <Text style={styles.mediumBig}>{data.co2} kg CO2</Text>
          <Text style={styles.mediumSub}>économisés cette année</Text>
        </View>
      </View>
      <View style={styles.mediumBar}>
        <View style={[styles.mediumFill, { width: `${pct}%` }]} />
      </View>
      <View style={styles.mediumFoot}>
        <Text style={styles.mediumFootLabel}>Objectif annuel</Text>
        <Text style={styles.mediumFootVal}>{pct}%</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Grand widget (iOS systemLarge, Android 4x4)
// ---------------------------------------------------------------------------

export function LargeWidget({ data }: { data: WidgetData }) {
  return (
    <View style={[styles.frame, styles.large]}>
      <LinearGradient colors={["#0A0A0A", Colors.brand.forestDark]} style={StyleSheet.absoluteFill} />
      <View style={styles.largeHead}>
        <Text style={styles.largeBrand}>ALPES IN BIKE</Text>
        <View style={styles.streak}>
          <Ionicons name="flame" size={11} color="#F59E0B" />
          <Text style={styles.streakText}>{data.streakDays} jours</Text>
        </View>
      </View>
      <View style={styles.largeGrid}>
        <LargeStat icon="speedometer" tint="#E15A23" value={data.monthlyKm.toString()} unit="km" label="Ce mois" />
        <LargeStat icon="leaf" tint="#10B981" value={data.co2.toString()} unit="kg" label="CO2 évité" />
        <LargeStat icon="trophy" tint="#FACC15" value={`#${data.rank}`} unit={`/${data.rankTotal}`} label="Classement" />
        <LargeStat icon="ribbon" tint="#7C3AED" value={data.badges.toString()} unit="" label="Badges" />
      </View>
      <View style={styles.largeFoot}>
        <Ionicons name="play-circle" size={14} color={Colors.brand.orangeLight} />
        <Text style={styles.largeFootText}>Démarrer un ride</Text>
      </View>
    </View>
  );
}

function LargeStat({ icon, tint, value, unit, label }: { icon: any; tint: string; value: string; unit: string; label: string }) {
  return (
    <View style={styles.largeStat}>
      <View style={[styles.largeStatIcon, { backgroundColor: `${tint}30` }]}>
        <Ionicons name={icon} size={13} color={tint} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 3 }}>
        <Text style={styles.largeStatVal}>{value}</Text>
        <Text style={styles.largeStatUnit}>{unit}</Text>
      </View>
      <Text style={styles.largeStatLabel}>{label}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Lock screen widget circulaire (iOS accessoryCircular)
// ---------------------------------------------------------------------------

export function LockWidget({ data }: { data: WidgetData }) {
  return (
    <View style={styles.lockBox}>
      <View style={styles.lockCircle}>
        <Ionicons name="bicycle" size={14} color={Colors.brand.orange} />
        <Text style={styles.lockNum}>{data.km}</Text>
        <Text style={styles.lockUnit}>km</Text>
      </View>
      <Text style={styles.lockLabel}>Ride du jour</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  frame: { borderRadius: 22, overflow: "hidden", padding: 14, position: "relative" },
  small: { width: 160, height: 160, justifyContent: "space-between" },
  smallTop: { flexDirection: "row", alignItems: "center", gap: 5 },
  brandLabel: { ...Type.label, color: "rgba(255,255,255,0.7)", fontSize: 9 },
  smallBig: { ...Type.display1, color: Colors.text.inverse, fontSize: 44, lineHeight: 48 },
  smallUnit: { ...Type.bodyXs, color: "rgba(255,255,255,0.8)", marginTop: -4 },
  smallFoot: { flexDirection: "row", alignItems: "center", gap: 4, paddingTop: 6, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.18)" },
  smallFootText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700", fontSize: 11 },

  medium: { width: 340, height: 160, justifyContent: "space-between", borderWidth: 1, borderColor: Colors.border.subtle },
  mediumRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  mediumIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(13,79,61,0.12)", alignItems: "center", justifyContent: "center" },
  mediumLabel: { ...Type.label, color: Colors.text.muted, fontSize: 10 },
  mediumBig: { ...Type.display3, color: Colors.text.primary, fontSize: 26, marginTop: 2 },
  mediumSub: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 2 },
  mediumBar: { height: 6, borderRadius: 3, backgroundColor: Colors.bg.elevated, overflow: "hidden" },
  mediumFill: { height: "100%", backgroundColor: Colors.brand.orange },
  mediumFoot: { flexDirection: "row", justifyContent: "space-between" },
  mediumFootLabel: { ...Type.bodyXs, color: Colors.text.muted },
  mediumFootVal: { ...Type.bodyXs, color: Colors.brand.orange, fontWeight: "700" },

  large: { width: 340, height: 360, gap: 12 },
  largeHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  largeBrand: { ...Type.label, color: "rgba(255,255,255,0.6)", fontSize: 10 },
  streak: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.pill, backgroundColor: "rgba(245,158,11,0.18)" },
  streakText: { ...Type.bodyXs, color: "#F59E0B", fontWeight: "700", fontSize: 11 },
  largeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 6 },
  largeStat: { flex: 1, minWidth: "47%", padding: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.08)", gap: 4 },
  largeStatIcon: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  largeStatVal: { ...Type.display3, color: Colors.text.inverse, fontSize: 22 },
  largeStatUnit: { ...Type.bodyXs, color: "rgba(255,255,255,0.7)", fontSize: 11 },
  largeStatLabel: { ...Type.bodyXs, color: "rgba(255,255,255,0.6)", fontSize: 10, marginTop: 2 },
  largeFoot: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: Radius.pill, backgroundColor: "rgba(225,90,35,0.18)", marginTop: 4 },
  largeFootText: { ...Type.bodyXs, color: Colors.brand.orangeLight, fontWeight: "700" },

  lockBox: { alignItems: "center", gap: 6 },
  lockCircle: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: Colors.brand.orange, backgroundColor: Colors.brand.ink, alignItems: "center", justifyContent: "center" },
  lockNum: { ...Type.display3, color: Colors.text.inverse, fontSize: 22, marginTop: 2 },
  lockUnit: { ...Type.bodyXs, color: "rgba(255,255,255,0.7)", marginTop: -2 },
  lockLabel: { ...Type.bodyXs, color: Colors.text.muted, fontWeight: "600" },
});

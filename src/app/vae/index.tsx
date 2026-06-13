import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { MOCK_VAE, MODE_META, CHARGING_STATIONS, getSuggestion, type AssistMode } from "@/lib/vae";

export default function VAEScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AssistMode>(MOCK_VAE.currentMode);
  const status = { ...MOCK_VAE, currentMode: mode };
  const remainingKm = 14;
  const suggestion = getSuggestion(status, remainingKm);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Assistant VAE</Text>
        <Pressable style={styles.headBtn}>
          <Ionicons name="information-circle-outline" size={22} color={Colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.batteryHero}>
          <LinearGradient colors={[Colors.brand.forest, Colors.brand.forestDark]} style={StyleSheet.absoluteFill} />
          <View style={styles.batteryRow}>
            <CircularProgress percent={status.batteryPercent} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.batteryLabel}>Batterie restante</Text>
              <Text style={styles.batteryPct}>{status.batteryPercent}%</Text>
              <Text style={styles.batteryWh}>{Math.round(status.batteryWh * status.batteryPercent / 100)} Wh disponibles</Text>
              <View style={styles.bikeRow}>
                <Ionicons name="bicycle" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={styles.bikeText}>Giant Trance X E+, 800 Wh</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.suggestion, suggestion.tone === "critical" ? { backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.3)" } : suggestion.tone === "warning" ? { backgroundColor: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.3)" } : { backgroundColor: "rgba(225,90,35,0.06)", borderColor: "rgba(225,90,35,0.2)" }]}>
          <View style={[styles.suggIcon, { backgroundColor: suggestion.tone === "critical" ? "#EF4444" : suggestion.tone === "warning" ? "#F59E0B" : Colors.brand.orange }]}>
            <Ionicons name="sparkles" size={16} color={Colors.text.inverse} />
          </View>
          <Text style={styles.suggText}>{suggestion.text}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Autonomie estimée</Text>
          <View style={styles.rangeCards}>
            <RangeCard icon="leaf-outline" label="Eco" value={status.estimatedRange.eco} color={Colors.brand.forest} active={mode === "eco"} />
            <RangeCard icon="speedometer-outline" label="Sport" value={status.estimatedRange.sport} color="#F59E0B" active={mode === "sport"} />
            <RangeCard icon="flash-outline" label="Turbo" value={status.estimatedRange.turbo} color={Colors.brand.orange} active={mode === "turbo"} />
          </View>
          <Text style={styles.note}>Estimations basées sur votre conso moyenne {status.averageConsumption} Wh/km + dénivelé prévu</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Mode d'assistance</Text>
          <View style={styles.modeRow}>
            {(["off", "eco", "sport", "turbo"] as AssistMode[]).map((m) => {
              const meta = MODE_META[m];
              const active = mode === m;
              return (
                <Pressable key={m} onPress={() => setMode(m)} style={[styles.modePill, active && { backgroundColor: meta.color, borderColor: meta.color }]}>
                  <Text style={[styles.modeText, active && { color: Colors.text.inverse }]}>{meta.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.modeDesc}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.text.muted} />
            <Text style={styles.modeDescText}>{MODE_META[mode].desc}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>Bornes de recharge à proximité</Text>
            <Pressable style={styles.mapBtn}>
              <Ionicons name="map-outline" size={14} color={Colors.brand.orange} />
              <Text style={styles.mapBtnText}>Carte</Text>
            </Pressable>
          </View>
          <View style={{ gap: 10 }}>
            {CHARGING_STATIONS.slice(0, 4).map((cs) => (
              <StationCard key={cs.id} station={cs} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Temps de roulage estimé</Text>
          <View style={styles.timeCard}>
            <View style={styles.timeStat}>
              <Text style={styles.timeBig}>{Math.floor(status.remainingTime / 60)}h{String(status.remainingTime % 60).padStart(2, "0")}</Text>
              <Text style={styles.timeLabel}>avant recharge</Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeStat}>
              <Text style={styles.timeBig}>{status.estimatedRange[mode === "off" ? "eco" : mode]} km</Text>
              <Text style={styles.timeLabel}>en mode {MODE_META[mode].label}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CircularProgress({ percent }: { percent: number }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - percent / 100);
  return (
    <Svg width={88} height={88} viewBox="0 0 88 88">
      <Circle cx={44} cy={44} r={r} stroke="rgba(255,255,255,0.18)" strokeWidth={8} fill="none" />
      <Circle cx={44} cy={44} r={r} stroke="#E15A23" strokeWidth={8} fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 44 44)" />
    </Svg>
  );
}

function RangeCard({ icon, label, value, color, active }: { icon: any; label: string; value: number; color: string; active: boolean }) {
  return (
    <View style={[styles.rangeCard, active && { borderColor: color, borderWidth: 2 }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.rangeValue}>{value}</Text>
      <Text style={styles.rangeLabel}>km · {label}</Text>
    </View>
  );
}

function StationCard({ station }: { station: typeof CHARGING_STATIONS[number] }) {
  const tone = station.type === "partenaire" ? Colors.brand.orange : Colors.brand.forest;
  return (
    <Pressable style={styles.station}>
      <View style={[styles.stationIcon, { backgroundColor: `${tone}15` }]}>
        <Ionicons name={station.type === "partenaire" ? "storefront" : "flash"} size={18} color={tone} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.stationHead}>
          <Text style={styles.stationName}>{station.name}</Text>
          {station.available ? (
            <View style={styles.availBadge}>
              <View style={styles.availDot} />
              <Text style={styles.availText}>Libre</Text>
            </View>
          ) : (
            <View style={styles.busyBadge}>
              <Text style={styles.busyText}>Occupée</Text>
            </View>
          )}
        </View>
        <Text style={styles.stationMeta}>{station.distanceKm} km · {station.power} kW · {station.hours}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.text.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18 },
  batteryHero: { marginHorizontal: Spacing.lg, padding: Spacing.lg, borderRadius: Radius.lg, overflow: "hidden", position: "relative" },
  batteryRow: { flexDirection: "row", alignItems: "center" },
  batteryLabel: { ...Type.label, color: "rgba(255,255,255,0.6)", fontSize: 10 },
  batteryPct: { ...Type.display1, color: Colors.text.inverse, fontSize: 42, marginTop: 2 },
  batteryWh: { ...Type.bodySm, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  bikeRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  bikeText: { ...Type.bodyXs, color: "rgba(255,255,255,0.7)" },
  suggestion: { flexDirection: "row", gap: 12, alignItems: "center", marginHorizontal: Spacing.lg, marginTop: Spacing.lg, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
  suggIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  suggText: { ...Type.bodySm, color: Colors.text.primary, flex: 1, lineHeight: 18 },
  section: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  sectionLabel: { ...Type.label, color: Colors.text.muted, marginBottom: 10 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  rangeCards: { flexDirection: "row", gap: 8 },
  rangeCard: { flex: 1, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle, alignItems: "center", gap: 4 },
  rangeValue: { ...Type.display3, color: Colors.text.primary, fontSize: 24 },
  rangeLabel: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 11 },
  note: { ...Type.bodyXs, color: Colors.text.muted, marginTop: Spacing.sm, fontStyle: "italic" },
  modeRow: { flexDirection: "row", gap: 8 },
  modePill: { flex: 1, paddingVertical: 12, borderRadius: Radius.pill, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle, alignItems: "center" },
  modeText: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 13 },
  modeDesc: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: Spacing.sm },
  modeDescText: { ...Type.bodyXs, color: Colors.text.secondary },
  mapBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: "rgba(225,90,35,0.1)" },
  mapBtnText: { ...Type.bodyXs, color: Colors.brand.orange, fontWeight: "700" },
  station: { flexDirection: "row", alignItems: "center", gap: 12, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle },
  stationIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  stationHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  stationName: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 14, flex: 1 },
  stationMeta: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 2 },
  availBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill, backgroundColor: "rgba(13,79,61,0.12)" },
  availDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.brand.forest },
  availText: { ...Type.bodyXs, color: Colors.brand.forest, fontWeight: "700", fontSize: 10 },
  busyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill, backgroundColor: "rgba(225,90,35,0.12)" },
  busyText: { ...Type.bodyXs, color: Colors.brand.orange, fontWeight: "700", fontSize: 10 },
  timeCard: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.bg.card, padding: Spacing.lg, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle },
  timeStat: { flex: 1, alignItems: "center", gap: 4 },
  timeBig: { ...Type.display2, color: Colors.text.primary, fontSize: 28 },
  timeLabel: { ...Type.bodyXs, color: Colors.text.muted },
  timeDivider: { width: 1, height: 40, backgroundColor: Colors.border.subtle, marginHorizontal: Spacing.md },
});

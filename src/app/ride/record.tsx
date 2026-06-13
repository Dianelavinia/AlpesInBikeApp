import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import RideMap from "@/components/RideMap";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";

type Status = "idle" | "recording" | "paused";

export default function RecordRide() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [elevation, setElevation] = useState(0);

  useEffect(() => {
    if (status !== "recording") return;
    const id = setInterval(() => {
      setElapsed((e) => e + 1);
      setDistance((d) => d + 0.005);
      setElevation((el) => el + Math.random() * 0.4);
    }, 1000);
    return () => clearInterval(id);
  }, [status]);

  function hhmmss(s: number) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="close" size={24} color={Colors.text.primary} />
        </Pressable>
        <View style={styles.statusPill}>
          <View style={[styles.statusDot, { backgroundColor: status === "recording" ? "#E15A23" : status === "paused" ? "#F59E0B" : Colors.text.muted }, status === "recording" && { opacity: 1 }]} />
          <Text style={styles.statusText}>
            {status === "recording" ? "ENREGISTREMENT" : status === "paused" ? "EN PAUSE" : "PRÊT"}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mapWrap}>
        <RideMap height={260} seed={42} />
        <View style={styles.locationBadge}>
          <Ionicons name="location" size={12} color="#0D4F3D" />
          <Text style={styles.locationText}>Massif des Bauges · GPS actif</Text>
        </View>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.bigStat}>
          <Text style={styles.bigStatLabel}>TEMPS</Text>
          <Text style={styles.bigStatValue}>{hhmmss(elapsed)}</Text>
        </View>

        <View style={styles.statsGrid}>
          <MetricBox label="Distance" value={distance.toFixed(2)} unit="km" />
          <MetricBox label="Vitesse" value={status === "recording" ? (8 + Math.random() * 6).toFixed(1) : "0.0"} unit="km/h" />
          <MetricBox label="Dénivelé" value={`+${Math.floor(elevation)}`} unit="m" />
          <MetricBox label="Calories" value={Math.floor(elapsed * 4.2).toString()} unit="kcal" />
        </View>
      </View>

      <View style={styles.controls}>
        {status === "idle" && (
          <Pressable onPress={() => setStatus("recording")} style={({ pressed }) => [styles.startBtn, pressed && { opacity: 0.85 }]}>
            <View style={styles.startInner}>
              <Ionicons name="play" size={32} color={Colors.text.inverse} />
            </View>
            <Text style={styles.startLabel}>Démarrer</Text>
          </Pressable>
        )}
        {status === "recording" && (
          <View style={styles.recordingControls}>
            <Pressable onPress={() => setStatus("paused")} style={({ pressed }) => [styles.pauseBtn, pressed && { opacity: 0.85 }]}>
              <Ionicons name="pause" size={28} color={Colors.text.inverse} />
            </Pressable>
          </View>
        )}
        {status === "paused" && (
          <View style={styles.pausedControls}>
            <Pressable onPress={() => setStatus("recording")} style={({ pressed }) => [styles.resumeBtn, pressed && { opacity: 0.85 }]}>
              <Ionicons name="play" size={22} color={Colors.text.inverse} />
              <Text style={styles.resumeText}>Reprendre</Text>
            </Pressable>
            <Pressable onPress={() => router.replace("/(tabs)/community")} style={({ pressed }) => [styles.finishBtn, pressed && { opacity: 0.85 }]}>
              <Ionicons name="checkmark" size={22} color={Colors.brand.orange} />
              <Text style={styles.finishText}>Terminer et partager</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function MetricBox({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricRow}>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricUnit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: Colors.bg.elevated },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { ...Type.label, fontSize: 10, color: Colors.text.secondary },
  mapWrap: { marginHorizontal: Spacing.lg, borderRadius: Radius.lg, overflow: "hidden", position: "relative" },
  locationBadge: { position: "absolute", top: 12, left: 12, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: "rgba(255,255,255,0.95)" },
  locationText: { ...Type.bodyXs, color: Colors.brand.forest, fontWeight: "600" },
  statsCard: { marginHorizontal: Spacing.lg, marginTop: Spacing.lg, backgroundColor: Colors.bg.card, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.lg, borderWidth: 1, borderColor: Colors.border.subtle },
  bigStat: { alignItems: "center" },
  bigStatLabel: { ...Type.label, color: Colors.text.muted, fontSize: 11 },
  bigStatValue: { ...Type.display1, color: Colors.text.primary, fontSize: 48, fontVariant: ["tabular-nums"] },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  metric: { flex: 1, minWidth: "45%", backgroundColor: Colors.bg.base, borderRadius: Radius.md, padding: Spacing.md, gap: 2 },
  metricLabel: { ...Type.label, color: Colors.text.muted, fontSize: 10 },
  metricRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  metricValue: { ...Type.display3, color: Colors.text.primary, fontSize: 22 },
  metricUnit: { ...Type.bodyXs, color: Colors.text.muted },
  controls: { flex: 1, justifyContent: "flex-end", padding: Spacing.lg },
  startBtn: { alignItems: "center", gap: Spacing.sm },
  startInner: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.brand.orange, alignItems: "center", justifyContent: "center", shadowColor: Colors.brand.orange, shadowOpacity: 0.4, shadowRadius: 24, shadowOffset: { width: 0, height: 10 } },
  startLabel: { ...Type.display4, color: Colors.text.primary, marginTop: 6 },
  recordingControls: { alignItems: "center" },
  pauseBtn: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#F59E0B", alignItems: "center", justifyContent: "center" },
  pausedControls: { gap: Spacing.sm },
  resumeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.brand.forest, paddingVertical: 18, borderRadius: Radius.pill },
  resumeText: { ...Type.body, color: Colors.text.inverse, fontWeight: "700", fontSize: 16 },
  finishBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "rgba(225,90,35,0.1)", paddingVertical: 18, borderRadius: Radius.pill, borderWidth: 2, borderColor: Colors.brand.orange },
  finishText: { ...Type.body, color: Colors.brand.orange, fontWeight: "700", fontSize: 16 },
});

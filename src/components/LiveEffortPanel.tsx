import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { useLiveTelemetry, ZONE_META, type HrZone } from "@/lib/telemetry";

/**
 * Bandeau effort temps réel pendant un ride.
 * S'affiche dès qu'une montre/ceinture est appairée OU en simulateur.
 */

export default function LiveEffortPanel({ active }: { active: boolean }) {
  const telemetry = useLiveTelemetry({ active });
  if (!active || !telemetry) return null;

  const zoneMeta = ZONE_META[telemetry.hrZone];

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headLeft}>
          <View style={[styles.sourceDot, { backgroundColor: telemetry.signal === "good" ? "#10B981" : "#F59E0B" }]} />
          <Text style={styles.sourceText}>
            {sourceLabel(telemetry.source)}
            {telemetry.batteryPct !== undefined && ` · ${telemetry.batteryPct}%`}
          </Text>
        </View>
        <View style={[styles.zoneBadge, { backgroundColor: `${zoneMeta.tint}18` }]}>
          <Text style={[styles.zoneText, { color: zoneMeta.tint }]}>Z{telemetry.hrZone} · {zoneMeta.label}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Metric icon="heart" tint="#E11D48" value={telemetry.hr.toString()} unit="bpm" label="Cardio" />
        <Metric icon="flash" tint="#7C3AED" value={telemetry.power.toString()} unit="W" label="Puissance" />
        <Metric icon="repeat" tint={Colors.brand.forest} value={telemetry.cadence.toString()} unit="rpm" label="Cadence" />
      </View>

      <View style={styles.zoneBar}>
        {([1, 2, 3, 4, 5] as HrZone[]).map((z) => (
          <View key={z} style={[styles.zoneSeg, { backgroundColor: ZONE_META[z].tint, opacity: telemetry.hrZone === z ? 1 : 0.18 }]} />
        ))}
      </View>

      <Text style={styles.advice}>{zoneMeta.advice}</Text>
    </View>
  );
}

function sourceLabel(s: string): string {
  switch (s) {
    case "ble-hr":      return "Ceinture cardio BLE";
    case "apple-watch": return "Apple Watch";
    case "wear-os":     return "Wear OS";
    case "garmin":      return "Garmin";
    case "polar":       return "Polar";
    case "wahoo":       return "Wahoo";
    default:            return "Simulateur démo";
  }
}

function Metric({ icon, tint, value, unit, label }: { icon: any; tint: string; value: string; unit: string; label: string }) {
  return (
    <View style={styles.metric}>
      <View style={[styles.metricIcon, { backgroundColor: `${tint}15` }]}>
        <Ionicons name={icon} size={14} color={tint} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 3, marginTop: 4 }}>
        <Text style={[styles.metricValue, { color: tint }]}>{value}</Text>
        <Text style={styles.metricUnit}>{unit}</Text>
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: Spacing.lg, marginTop: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle, gap: Spacing.sm },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  sourceDot: { width: 7, height: 7, borderRadius: 4 },
  sourceText: { ...Type.bodyXs, color: Colors.text.muted, fontWeight: "600", fontSize: 11 },
  zoneBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: Radius.pill },
  zoneText: { ...Type.bodyXs, fontWeight: "700", fontSize: 11 },
  row: { flexDirection: "row", gap: 8 },
  metric: { flex: 1, padding: 10, borderRadius: Radius.sm, backgroundColor: Colors.bg.elevated, gap: 2 },
  metricIcon: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  metricValue: { ...Type.display3, fontSize: 20, fontWeight: "700" },
  metricUnit: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 10 },
  metricLabel: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 10 },
  zoneBar: { flexDirection: "row", gap: 3, marginTop: 2 },
  zoneSeg: { flex: 1, height: 5, borderRadius: 3 },
  advice: { ...Type.bodyXs, color: Colors.text.secondary, fontStyle: "italic", marginTop: 2, lineHeight: 16 },
});

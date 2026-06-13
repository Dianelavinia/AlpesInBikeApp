import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { REPORTS, REPORT_META, type ReportType, type Report } from "@/lib/reports";

const TYPES: { id: ReportType | "all"; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "danger", label: "Danger" },
  { id: "travaux", label: "Travaux" },
  { id: "arbre_tombe", label: "Obstacles" },
  { id: "boue", label: "Conditions" },
];

export default function Reports() {
  const router = useRouter();
  const [filter, setFilter] = useState<ReportType | "all">("all");
  const reports = filter === "all" ? REPORTS : REPORTS.filter((r) => r.type === filter);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <View>
          <Text style={styles.title}>Waze du vélo</Text>
          <Text style={styles.subtitle}>{REPORTS.length} signalements actifs</Text>
        </View>
        <Pressable style={styles.headBtn}>
          <Ionicons name="map-outline" size={22} color={Colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {TYPES.map((t) => (
          <Pressable key={t.id} onPress={() => setFilter(t.id)} style={[styles.chip, filter === t.id && styles.chipActive]}>
            <Text style={[styles.chipText, filter === t.id && styles.chipTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg, gap: 10, paddingBottom: 100 }}>
        {reports.map((r) => (
          <ReportCard key={r.id} report={r} />
        ))}
      </ScrollView>

      <Pressable onPress={() => router.push("/reports/new")} style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}>
        <Ionicons name="add" size={24} color={Colors.text.inverse} />
        <Text style={styles.fabText}>Signaler</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function ReportCard({ report }: { report: Report }) {
  const meta = REPORT_META[report.type];
  return (
    <Pressable style={styles.card}>
      <View style={[styles.icon, { backgroundColor: `${meta.color}15` }]}>
        <Ionicons name={meta.icon as any} size={22} color={meta.color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.cardHead}>
          <Text style={styles.type}>{meta.label}</Text>
          <View style={styles.confirmBadge}>
            <Ionicons name="checkmark-circle" size={11} color={Colors.brand.forest} />
            <Text style={styles.confirmText}>{report.confirmations}</Text>
          </View>
        </View>
        <Text style={styles.desc}>{report.description}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={11} color={Colors.text.muted} />
          <Text style={styles.metaText}>{report.location.label}</Text>
          <View style={styles.dot} />
          <Text style={styles.metaText}>{report.reportedAt}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function NewReportButton({ onPress }: { onPress: () => void }) {
  return null;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18, textAlign: "center" },
  subtitle: { ...Type.bodyXs, color: Colors.text.muted, textAlign: "center", marginTop: 2 },
  filters: { paddingHorizontal: Spacing.lg, gap: 8, paddingBottom: Spacing.md },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.pill, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle },
  chipActive: { backgroundColor: Colors.brand.ink, borderColor: Colors.brand.ink },
  chipText: { ...Type.bodySm, color: Colors.text.secondary, fontWeight: "600", fontSize: 13 },
  chipTextActive: { color: Colors.text.inverse },
  card: { flexDirection: "row", gap: 12, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  type: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 14 },
  confirmBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.pill, backgroundColor: "rgba(13,79,61,0.1)" },
  confirmText: { ...Type.bodyXs, color: Colors.brand.forest, fontWeight: "700", fontSize: 11 },
  desc: { ...Type.bodySm, color: Colors.text.secondary, marginTop: 4, lineHeight: 18 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  metaText: { ...Type.bodyXs, color: Colors.text.muted },
  dot: { width: 2, height: 2, borderRadius: 1, backgroundColor: Colors.text.muted, marginHorizontal: 2 },
  fab: { position: "absolute", bottom: 24, right: 20, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 18, paddingVertical: 14, borderRadius: Radius.pill, backgroundColor: Colors.brand.orange, shadowColor: Colors.brand.orange, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  fabText: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "700" },
});

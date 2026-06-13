import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";

const FLEET_STATS = {
  total: 32,
  inUse: 21,
  available: 9,
  maintenance: 2,
  lowBattery: 4,
  totalKmThisMonth: 4820,
};

const FLEET_BIKES = [
  { id: "f-1", model: "Giant Trance X E+", num: "#08", status: "in_use", rider: "Marie R.", battery: 78, kmToday: 12.4 },
  { id: "f-2", model: "Giant Trance X E+", num: "#09", status: "in_use", rider: "Thomas D.", battery: 42, kmToday: 18.2 },
  { id: "f-3", model: "LIV Intrigue X", num: "#03", status: "available", battery: 95, kmToday: 0 },
  { id: "f-4", model: "Marin Rift Zone", num: "#02", status: "in_use", rider: "Lucas M.", battery: 0, kmToday: 8.5 },
  { id: "f-5", model: "Woom Up 5", num: "#01", status: "maintenance", battery: 80, kmToday: 0 },
];

export default function ProDashboard() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <View>
          <Text style={styles.title}>Espace Pro</Text>
          <Text style={styles.subtitle}>Hôtel Splendide · Aix-les-Bains</Text>
        </View>
        <Pressable style={styles.headBtn}>
          <Ionicons name="notifications-outline" size={22} color={Colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.heroCard}>
          <LinearGradient colors={[Colors.brand.forest, Colors.brand.forestDark]} style={StyleSheet.absoluteFill} />
          <Text style={styles.heroLabel}>FLOTTE EN SERVICE</Text>
          <View style={styles.heroBig}>
            <Text style={styles.heroNum}>{FLEET_STATS.inUse}</Text>
            <Text style={styles.heroSlash}>/{FLEET_STATS.total}</Text>
          </View>
          <View style={styles.heroProgressBar}>
            <View style={[styles.heroProgressFill, { width: `${(FLEET_STATS.inUse / FLEET_STATS.total) * 100}%` }]} />
          </View>
          <Text style={styles.heroFootnote}>{FLEET_STATS.totalKmThisMonth} km cumulés ce mois</Text>
        </View>

        <View style={styles.statsRow}>
          <StatBox label="Disponibles" value={FLEET_STATS.available} color={Colors.brand.forest} icon="checkmark-circle" />
          <StatBox label="En location" value={FLEET_STATS.inUse} color={Colors.brand.orange} icon="bicycle" />
          <StatBox label="Maintenance" value={FLEET_STATS.maintenance} color="#F59E0B" icon="construct" />
        </View>

        <View style={styles.section}>
          <View style={styles.alertCard}>
            <Ionicons name="battery-half" size={20} color="#F59E0B" />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>{FLEET_STATS.lowBattery} vélos avec batterie basse</Text>
              <Text style={styles.alertDesc}>Prévoir une recharge avant 18h</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.text.muted} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>Vélos en temps réel</Text>
            <Pressable style={styles.mapBtn}>
              <Ionicons name="map-outline" size={14} color={Colors.brand.orange} />
              <Text style={styles.mapBtnText}>Voir carte</Text>
            </Pressable>
          </View>
          <View style={{ gap: 8 }}>
            {FLEET_BIKES.map((b) => (
              <FleetBike key={b.id} bike={b} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Actions rapides</Text>
          <View style={styles.actionGrid}>
            <ActionCard icon="bicycle-outline" label="Nouvelle location" />
            <ActionCard icon="cash-outline" label="Caisse" />
            <ActionCard icon="bar-chart-outline" label="Statistiques" />
            <ActionCard icon="settings-outline" label="Réglages" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, color, icon }: { label: string; value: number; color: string; icon: any }) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function FleetBike({ bike }: { bike: typeof FLEET_BIKES[number] }) {
  const status = bike.status === "in_use" ? { label: "En location", color: Colors.brand.orange } : bike.status === "available" ? { label: "Disponible", color: Colors.brand.forest } : { label: "Maintenance", color: "#F59E0B" };
  return (
    <Pressable style={styles.fleet}>
      <View style={styles.fleetNum}>
        <Text style={styles.fleetNumText}>{bike.num}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.fleetHead}>
          <Text style={styles.fleetModel}>{bike.model}</Text>
          <View style={[styles.fleetStatusPill, { backgroundColor: `${status.color}15` }]}>
            <Text style={[styles.fleetStatusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <View style={styles.fleetMeta}>
          {bike.rider && (
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={11} color={Colors.text.muted} />
              <Text style={styles.metaText}>{bike.rider}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Ionicons name={bike.battery > 50 ? "battery-full-outline" : "battery-half-outline"} size={11} color={bike.battery < 20 ? "#EF4444" : Colors.text.muted} />
            <Text style={[styles.metaText, bike.battery < 20 && { color: "#EF4444" }]}>{bike.battery}%</Text>
          </View>
          {bike.kmToday > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="navigate-outline" size={11} color={Colors.text.muted} />
              <Text style={styles.metaText}>{bike.kmToday} km</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function ActionCard({ icon, label }: { icon: any; label: string }) {
  return (
    <Pressable style={styles.action}>
      <Ionicons name={icon} size={22} color={Colors.brand.orange} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18, textAlign: "center" },
  subtitle: { ...Type.bodyXs, color: Colors.text.muted, textAlign: "center", marginTop: 2 },
  heroCard: { margin: Spacing.lg, padding: Spacing.lg, borderRadius: Radius.lg, overflow: "hidden", position: "relative" },
  heroLabel: { ...Type.label, color: "rgba(255,255,255,0.65)", fontSize: 10 },
  heroBig: { flexDirection: "row", alignItems: "baseline", marginTop: 4 },
  heroNum: { ...Type.display1, color: Colors.text.inverse, fontSize: 56 },
  heroSlash: { ...Type.display2, color: "rgba(255,255,255,0.5)", fontSize: 28 },
  heroProgressBar: { height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.15)", marginTop: 10, overflow: "hidden" },
  heroProgressFill: { height: "100%", backgroundColor: Colors.brand.orange },
  heroFootnote: { ...Type.bodySm, color: "rgba(255,255,255,0.7)", marginTop: 10 },
  statsRow: { flexDirection: "row", paddingHorizontal: Spacing.lg, gap: 8 },
  stat: { flex: 1, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle, alignItems: "center", gap: 4 },
  statIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  statValue: { ...Type.display3, color: Colors.text.primary, fontSize: 22 },
  statLabel: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 11 },
  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionLabel: { ...Type.label, color: Colors.text.muted },
  mapBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: "rgba(225,90,35,0.1)" },
  mapBtnText: { ...Type.bodyXs, color: Colors.brand.orange, fontWeight: "700" },
  alertCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: "rgba(245,158,11,0.08)", borderWidth: 1, borderColor: "rgba(245,158,11,0.2)" },
  alertTitle: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 13 },
  alertDesc: { ...Type.bodyXs, color: Colors.text.secondary, marginTop: 2 },
  fleet: { flexDirection: "row", alignItems: "center", gap: 12, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle },
  fleetNum: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.bg.elevated, alignItems: "center", justifyContent: "center" },
  fleetNumText: { ...Type.bodyXs, color: Colors.brand.forest, fontWeight: "700", fontSize: 13 },
  fleetHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  fleetModel: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 13 },
  fleetStatusPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.pill },
  fleetStatusText: { ...Type.bodyXs, fontWeight: "700", fontSize: 10 },
  fleetMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 11 },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  action: { width: "48%", aspectRatio: 2.2, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle, alignItems: "center", justifyContent: "center", gap: 6 },
  actionText: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 13 },
});

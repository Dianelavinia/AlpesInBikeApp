import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { useConnectors, formatLastSync, type ConnectorStatus } from "@/lib/connectors";

const SECTION_ORDER: { title: string; subtitle?: string; ids: string[] }[] = [
  { title: "Plateformes santé",    subtitle: "Aggrégateurs natifs iOS et Android", ids: ["apple-health", "google-fit"] },
  { title: "Montres connectées",   subtitle: "Garmin, Polar, Suunto, Samsung Galaxy Watch",    ids: ["garmin", "polar", "suunto", "samsung-health", "wahoo"] },
  { title: "Bagues intelligentes", subtitle: "Au doigt 24h sur 24, suivi récupération et HRV", ids: ["oura", "ultrahuman", "ringconn"] },
  { title: "Bracelets",            subtitle: "Whoop, Fitbit, Vivosmart",                       ids: ["whoop", "fitbit"] },
  { title: "Ceintures et capteurs Bluetooth", subtitle: "Cardio thoracique, puissance pédalier", ids: ["ble-hr", "ble-power"] },
  { title: "Applis tierces",        subtitle: "Sync historique et upload",                      ids: ["strava"] },
];

export default function DevicesSettings() {
  const router = useRouter();
  const { list, loading } = useConnectors();

  const connected = list.filter((c) => c.connected);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Appareils et synchros</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <View style={styles.heroIcon}>
              <Ionicons name="pulse" size={20} color={Colors.brand.orange} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{connected.length} source{connected.length > 1 ? "s" : ""} active{connected.length > 1 ? "s" : ""}</Text>
              <Text style={styles.heroDesc}>Vos rides Alpes in Bike synchronisent en direct depuis vos montres et capteurs.</Text>
            </View>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={Colors.brand.orange} />
            <Text style={styles.loadingText}>Chargement</Text>
          </View>
        )}

        {!loading && SECTION_ORDER.map((sec) => {
          const items = sec.ids.map((id) => list.find((c) => c.id === id)).filter(Boolean) as ConnectorStatus[];
          if (items.length === 0) return null;
          return (
            <View key={sec.title} style={styles.section}>
              <Text style={styles.sectionLabel}>{sec.title}</Text>
              {sec.subtitle && <Text style={styles.sectionSub}>{sec.subtitle}</Text>}
              <View style={{ gap: 10 }}>
                {items.map((c) => (
                  <ConnectorRow key={c.id} c={c} />
                ))}
              </View>
            </View>
          );
        })}

        <View style={styles.footerNote}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.text.muted} />
          <Text style={styles.footerText}>
            Apple Santé reste sur l'iPhone, jamais envoyé à un tiers. Strava, Garmin, Polar, Suunto, Wahoo utilisent OAuth, vous gardez le contrôle des permissions.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ConnectorRow({ c }: { c: ConnectorStatus }) {
  return (
    <View style={styles.row}>
      <View style={[styles.brandIcon, { backgroundColor: `${c.brandColor}12` }]}>
        <Ionicons name={c.icon as any} size={22} color={c.brandColor} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{c.name}</Text>
          {c.connected && (
            <View style={styles.connectedBadge}>
              <View style={styles.connectedDot} />
              <Text style={styles.connectedText}>Connecté</Text>
            </View>
          )}
        </View>
        <Text style={styles.desc}>{c.description}</Text>
        <View style={styles.metaRow}>
          {c.capabilities.includes("live-hr") && <CapTag icon="heart-outline" label="Cardio live" />}
          {c.capabilities.includes("live-power") && <CapTag icon="flash-outline" label="Puissance live" />}
          {c.capabilities.includes("live-cadence") && <CapTag icon="repeat-outline" label="Cadence" />}
          {c.capabilities.includes("live-gps") && <CapTag icon="navigate-outline" label="GPS live" />}
          {c.capabilities.includes("hrv") && <CapTag icon="pulse-outline" label="HRV" />}
          {c.capabilities.includes("spo2") && <CapTag icon="water-outline" label="SpO2" />}
          {c.capabilities.includes("skin-temp") && <CapTag icon="thermometer-outline" label="Température" />}
          {c.capabilities.includes("sleep") && <CapTag icon="moon-outline" label="Sommeil" />}
          {c.capabilities.includes("recovery") && <CapTag icon="leaf-outline" label="Récupération" />}
          {c.capabilities.includes("stress") && <CapTag icon="warning-outline" label="Stress" />}
          {c.capabilities.includes("upload") && <CapTag icon="cloud-upload-outline" label="Upload auto" />}
        </View>
        {c.connected && (
          <View style={styles.statusRow}>
            {c.deviceName && (
              <Text style={styles.statusText}><Ionicons name="hardware-chip-outline" size={11} color={Colors.text.muted} /> {c.deviceName}</Text>
            )}
            {c.batteryPct !== undefined && (
              <Text style={styles.statusText}><Ionicons name="battery-half-outline" size={11} color={Colors.text.muted} /> {c.batteryPct}%</Text>
            )}
            {c.lastSync && (
              <Text style={styles.statusText}><Ionicons name="sync-outline" size={11} color={Colors.text.muted} /> {formatLastSync(c.lastSync)}</Text>
            )}
          </View>
        )}
      </View>
      <View>
        {c.connected ? (
          <Pressable style={styles.btnGhost}>
            <Text style={styles.btnGhostText}>Gérer</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryText}>Connecter</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function CapTag({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={styles.capTag}>
      <Ionicons name={icon} size={10} color={Colors.text.secondary} />
      <Text style={styles.capText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18 },
  heroCard: { marginHorizontal: Spacing.lg, marginTop: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle },
  heroLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(225,90,35,0.12)", alignItems: "center", justifyContent: "center" },
  heroTitle: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700" },
  heroDesc: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 2, lineHeight: 16 },
  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl },
  sectionLabel: { ...Type.label, color: Colors.text.muted, marginBottom: 4 },
  sectionSub: { ...Type.bodyXs, color: Colors.text.muted, marginBottom: 10, fontStyle: "italic" },
  row: { flexDirection: "row", gap: 12, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle, alignItems: "flex-start" },
  brandIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  name: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700" },
  connectedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.pill, backgroundColor: "rgba(13,79,61,0.12)" },
  connectedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.brand.forest },
  connectedText: { ...Type.bodyXs, color: Colors.brand.forest, fontWeight: "700", fontSize: 10 },
  desc: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 4, lineHeight: 16 },
  metaRow: { flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" },
  capTag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.pill, backgroundColor: Colors.bg.elevated },
  capText: { ...Type.bodyXs, color: Colors.text.secondary, fontWeight: "600", fontSize: 10 },
  statusRow: { flexDirection: "row", gap: 10, marginTop: 8, flexWrap: "wrap" },
  statusText: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 11 },
  btnPrimary: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Colors.brand.orange },
  btnPrimaryText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700", fontSize: 12 },
  btnGhost: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Colors.bg.elevated },
  btnGhostText: { ...Type.bodyXs, color: Colors.text.secondary, fontWeight: "700", fontSize: 12 },
  loadingBox: { alignItems: "center", paddingVertical: Spacing.xl, gap: 8 },
  loadingText: { ...Type.bodyXs, color: Colors.text.muted },
  footerNote: { flexDirection: "row", gap: 8, padding: Spacing.md, marginHorizontal: Spacing.lg, marginTop: Spacing.xl, backgroundColor: Colors.bg.elevated, borderRadius: Radius.sm },
  footerText: { flex: 1, ...Type.bodyXs, color: Colors.text.muted, lineHeight: 16 },
});

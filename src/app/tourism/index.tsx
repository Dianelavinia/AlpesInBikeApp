import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { POIS, POI_META, type POIType, type POI } from "@/lib/tourism";

const FILTERS: { id: POIType | "all"; label: string; icon: string }[] = [
  { id: "all", label: "Tout", icon: "apps-outline" },
  { id: "vue", label: "Vues", icon: "camera-outline" },
  { id: "restaurant", label: "Resto", icon: "restaurant-outline" },
  { id: "cafe", label: "Café", icon: "cafe-outline" },
  { id: "fontaine", label: "Eau", icon: "water-outline" },
  { id: "recharge", label: "Recharge", icon: "battery-charging-outline" },
  { id: "reparateur", label: "Répar.", icon: "construct-outline" },
  { id: "baignade", label: "Baignade", icon: "water" },
];

export default function Tourism() {
  const router = useRouter();
  const [filter, setFilter] = useState<POIType | "all">("all");
  const pois = filter === "all" ? POIS : POIS.filter((p) => p.type === filter);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <View>
          <Text style={styles.title}>Tourisme vélo</Text>
          <Text style={styles.subtitle}>{POIS.length} points d'intérêt</Text>
        </View>
        <Pressable style={styles.headBtn}>
          <Ionicons name="map-outline" size={22} color={Colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable key={f.id} onPress={() => setFilter(f.id)} style={[styles.chip, filter === f.id && styles.chipActive]}>
            <Ionicons name={f.icon as any} size={14} color={filter === f.id ? Colors.text.inverse : Colors.text.secondary} />
            <Text style={[styles.chipText, filter === f.id && styles.chipTextActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg, gap: 10 }}>
        {pois.map((p) => (
          <POICard key={p.id} poi={p} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function POICard({ poi }: { poi: POI }) {
  const meta = POI_META[poi.type];
  return (
    <Pressable style={styles.card}>
      <View style={[styles.icon, { backgroundColor: `${meta.color}15` }]}>
        <Ionicons name={meta.icon as any} size={22} color={meta.color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.head}>
          <Text style={styles.name}>{poi.name}</Text>
          {poi.veloAccueil && (
            <View style={styles.accueilBadge}>
              <Ionicons name="bicycle" size={10} color={Colors.brand.forest} />
              <Text style={styles.accueilText}>Accueil Vélo</Text>
            </View>
          )}
        </View>
        {poi.description && <Text style={styles.desc} numberOfLines={2}>{poi.description}</Text>}
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={11} color={Colors.text.muted} />
            <Text style={styles.metaText}>{poi.distanceKm} km · {poi.city}</Text>
          </View>
          {poi.rating && (
            <View style={styles.metaItem}>
              <Ionicons name="star" size={11} color="#F59E0B" />
              <Text style={styles.metaText}>{poi.rating}</Text>
            </View>
          )}
          {poi.isOpen !== undefined && (
            <View style={[styles.openPill, { backgroundColor: poi.isOpen ? "rgba(13,79,61,0.1)" : "rgba(239,68,68,0.1)" }]}>
              <Text style={[styles.openText, { color: poi.isOpen ? Colors.brand.forest : "#EF4444" }]}>
                {poi.isOpen ? "Ouvert" : "Fermé"}
              </Text>
            </View>
          )}
        </View>
      </View>
      <Pressable style={styles.navBtn}>
        <Ionicons name="navigate" size={16} color={Colors.brand.orange} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18, textAlign: "center" },
  subtitle: { ...Type.bodyXs, color: Colors.text.muted, textAlign: "center", marginTop: 2 },
  filters: { paddingHorizontal: Spacing.lg, gap: 8, paddingBottom: Spacing.md },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle },
  chipActive: { backgroundColor: Colors.brand.ink, borderColor: Colors.brand.ink },
  chipText: { ...Type.bodySm, color: Colors.text.secondary, fontWeight: "600", fontSize: 12 },
  chipTextActive: { color: Colors.text.inverse },
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  head: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  name: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 14, flexShrink: 1 },
  accueilBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.pill, backgroundColor: "rgba(13,79,61,0.1)" },
  accueilText: { ...Type.bodyXs, color: Colors.brand.forest, fontWeight: "700", fontSize: 9 },
  desc: { ...Type.bodyXs, color: Colors.text.secondary, marginTop: 3, lineHeight: 16 },
  meta: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 11 },
  openPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.pill },
  openText: { ...Type.bodyXs, fontWeight: "700", fontSize: 10 },
  navBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(225,90,35,0.1)", alignItems: "center", justifyContent: "center" },
});

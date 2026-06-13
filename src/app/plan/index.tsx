import { View, Text, Pressable, StyleSheet, ScrollView, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { filterRoutes, type BikeType, type Difficulty, type Filters, type RouteSuggestion } from "@/lib/route-planner";
import { DIFFICULTY_META, formatDuration } from "@/lib/activities";

const BIKE_TYPES: { id: BikeType | "all"; label: string; icon: any }[] = [
  { id: "all", label: "Tous", icon: "apps-outline" },
  { id: "vttae", label: "VTTAE", icon: "battery-charging-outline" },
  { id: "vtt", label: "VTT", icon: "bicycle-outline" },
  { id: "route", label: "Route", icon: "speedometer-outline" },
  { id: "gravel", label: "Gravel", icon: "earth-outline" },
  { id: "ville", label: "Ville", icon: "leaf-outline" },
];

const DIFFICULTIES: { id: Difficulty | "all"; label: string }[] = [
  { id: "all", label: "Tous niveaux" },
  { id: "facile", label: "Facile" },
  { id: "intermediaire", label: "Intermédiaire" },
  { id: "difficile", label: "Difficile" },
  { id: "expert", label: "Expert" },
];

const DISTANCE_RANGES: { label: string; range: [number, number] }[] = [
  { label: "10 à 20 km", range: [0, 20] },
  { label: "20 à 40 km", range: [20, 40] },
  { label: "40 à 80 km", range: [40, 80] },
  { label: "Plus de 80 km", range: [80, 999] },
];

export default function Planner() {
  const router = useRouter();
  const [bikeType, setBikeType] = useState<BikeType | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [distanceRange, setDistanceRange] = useState<[number, number]>([0, 999]);
  const [family, setFamily] = useState(false);
  const [loop, setLoop] = useState(false);

  const filters: Filters = { bikeType, difficulty, distanceRange, family, loop };
  const results = useMemo(() => filterRoutes(filters), [bikeType, difficulty, distanceRange, family, loop]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="close" size={24} color={Colors.text.primary} />
        </Pressable>
        <View>
          <Text style={styles.title}>Planifier</Text>
          <Text style={styles.subtitle}>L'IA vous suggère le parcours idéal</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Type de vélo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {BIKE_TYPES.map((b) => (
              <Pressable key={b.id} onPress={() => setBikeType(b.id)} style={[styles.bikeChip, bikeType === b.id && styles.bikeChipActive]}>
                <Ionicons name={b.icon} size={16} color={bikeType === b.id ? Colors.text.inverse : Colors.text.secondary} />
                <Text style={[styles.bikeChipText, bikeType === b.id && styles.bikeChipTextActive]}>{b.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Distance</Text>
          <View style={styles.chipsWrap}>
            {DISTANCE_RANGES.map((d) => (
              <Pressable
                key={d.label}
                onPress={() => setDistanceRange(d.range)}
                style={[styles.chip, distanceRange[0] === d.range[0] && styles.chipActive]}
              >
                <Text style={[styles.chipText, distanceRange[0] === d.range[0] && styles.chipTextActive]}>{d.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Niveau</Text>
          <View style={styles.chipsWrap}>
            {DIFFICULTIES.map((d) => (
              <Pressable
                key={d.id}
                onPress={() => setDifficulty(d.id)}
                style={[styles.chip, difficulty === d.id && styles.chipActive]}
              >
                <Text style={[styles.chipText, difficulty === d.id && styles.chipTextActive]}>{d.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Options</Text>
          <View style={{ gap: 8 }}>
            <Toggle label="Adapté aux familles" desc="Voie verte, sans voiture, plats" active={family} onChange={setFamily} icon="people-outline" />
            <Toggle label="Boucle uniquement" desc="Départ et arrivée au même endroit" active={loop} onChange={setLoop} icon="reload-outline" />
          </View>
        </View>

        <View style={styles.results}>
          <View style={styles.resultsHead}>
            <Text style={styles.resultsTitle}>
              {results.length} {results.length <= 1 ? "parcours trouvé" : "parcours trouvés"}
            </Text>
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={11} color={Colors.brand.orange} />
              <Text style={styles.aiText}>IA</Text>
            </View>
          </View>

          {results.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={36} color={Colors.text.muted} />
              <Text style={styles.emptyText}>Aucun parcours ne correspond. Élargissez vos critères.</Text>
            </View>
          ) : (
            <View style={{ gap: 14 }}>
              {results.map((r, i) => (
                <RouteCard key={r.id} route={r} rank={i + 1} onPress={() => router.push(`/plan/${r.id}`)} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Toggle({ label, desc, active, onChange, icon }: { label: string; desc: string; active: boolean; onChange: (v: boolean) => void; icon: any }) {
  return (
    <Pressable onPress={() => onChange(!active)} style={[styles.toggle, active && styles.toggleActive]}>
      <View style={[styles.toggleIcon, active && { backgroundColor: Colors.brand.orange }]}>
        <Ionicons name={icon} size={18} color={active ? Colors.text.inverse : Colors.brand.orange} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{desc}</Text>
      </View>
      <View style={[styles.switch, active && { backgroundColor: Colors.brand.orange }]}>
        <View style={[styles.switchDot, active && { transform: [{ translateX: 18 }] }]} />
      </View>
    </Pressable>
  );
}

function RouteCard({ route, rank, onPress }: { route: RouteSuggestion; rank: number; onPress: () => void }) {
  const diff = DIFFICULTY_META[route.difficulty];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}>
      <ImageBackground source={{ uri: route.cover }} style={styles.cardCover} imageStyle={{ borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg }}>
        <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.coverRow}>
          <View style={styles.rank}>
            <Text style={styles.rankText}>#{rank}</Text>
          </View>
          <View style={styles.matchPill}>
            <Ionicons name="checkmark-circle" size={12} color={Colors.brand.orange} />
            <Text style={styles.matchText}>{route.matchScore}% match</Text>
          </View>
        </View>
        <View style={styles.coverBottom}>
          <Text style={styles.cardTitle}>{route.title}</Text>
          <Text style={styles.cardZone}>{route.zone}</Text>
        </View>
      </ImageBackground>

      <View style={styles.cardBody}>
        <View style={styles.metaRow}>
          <Meta icon="navigate-outline" value={`${route.distanceKm} km`} />
          <Meta icon="time-outline" value={formatDuration(route.durationMin)} />
          <Meta icon="trending-up-outline" value={`+${route.elevationGain}m`} />
        </View>

        <View style={styles.badges}>
          <View style={[styles.smallBadge, { backgroundColor: diff.bg }]}>
            <Text style={[styles.smallBadgeText, { color: diff.color }]}>{diff.label}</Text>
          </View>
          <View style={styles.smallBadgeOutline}>
            <Text style={styles.smallBadgeOutlineText}>{route.surface}</Text>
          </View>
          {route.isFamily && (
            <View style={[styles.smallBadge, { backgroundColor: "rgba(13,79,61,0.12)" }]}>
              <Ionicons name="people" size={10} color={Colors.brand.forest} />
              <Text style={[styles.smallBadgeText, { color: Colors.brand.forest }]}>Famille</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function Meta({ icon, value }: { icon: any; value: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={13} color={Colors.text.muted} />
      <Text style={styles.metaText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 22, textAlign: "center" },
  subtitle: { ...Type.bodyXs, color: Colors.text.muted, textAlign: "center", marginTop: 2 },
  filterSection: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  filterLabel: { ...Type.label, color: Colors.text.muted, marginBottom: 10 },
  chipsRow: { gap: 8, paddingRight: Spacing.lg },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  bikeChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.pill, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle },
  bikeChipActive: { backgroundColor: Colors.brand.ink, borderColor: Colors.brand.ink },
  bikeChipText: { ...Type.bodySm, color: Colors.text.secondary, fontWeight: "600", fontSize: 13 },
  bikeChipTextActive: { color: Colors.text.inverse },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle },
  chipActive: { backgroundColor: Colors.brand.ink, borderColor: Colors.brand.ink },
  chipText: { ...Type.bodySm, color: Colors.text.secondary, fontWeight: "600", fontSize: 13 },
  chipTextActive: { color: Colors.text.inverse },
  toggle: { flexDirection: "row", alignItems: "center", gap: 12, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle },
  toggleActive: { borderColor: Colors.brand.orange, backgroundColor: "rgba(225,90,35,0.04)" },
  toggleIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(225,90,35,0.12)", alignItems: "center", justifyContent: "center" },
  toggleLabel: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 14 },
  toggleDesc: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 2 },
  switch: { width: 44, height: 26, borderRadius: 13, backgroundColor: Colors.border.base, padding: 3 },
  switchDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff" },
  results: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  resultsHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Spacing.md },
  resultsTitle: { ...Type.display4, color: Colors.text.primary, fontSize: 17 },
  aiBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.pill, backgroundColor: "rgba(225,90,35,0.12)" },
  aiText: { ...Type.label, fontSize: 10, color: Colors.brand.orange },
  empty: { padding: Spacing.xl, alignItems: "center", gap: 10, backgroundColor: Colors.bg.card, borderRadius: Radius.md },
  emptyText: { ...Type.bodySm, color: Colors.text.muted, textAlign: "center" },
  card: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, overflow: "hidden", borderWidth: 1, borderColor: Colors.border.subtle },
  cardCover: { height: 160, justifyContent: "space-between", padding: Spacing.md },
  coverRow: { flexDirection: "row", justifyContent: "space-between" },
  rank: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.95)", alignItems: "center", justifyContent: "center" },
  rankText: { ...Type.display4, color: Colors.brand.orange, fontSize: 13 },
  matchPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, backgroundColor: "rgba(255,255,255,0.95)" },
  matchText: { ...Type.bodyXs, fontWeight: "700", color: Colors.text.primary, fontSize: 11 },
  coverBottom: {},
  cardTitle: { ...Type.display4, color: Colors.text.inverse, fontSize: 18 },
  cardZone: { ...Type.bodyXs, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  cardBody: { padding: Spacing.md, gap: Spacing.sm },
  metaRow: { flexDirection: "row", gap: 14 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "600", fontSize: 13 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  smallBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill },
  smallBadgeText: { ...Type.bodyXs, fontWeight: "700", fontSize: 11 },
  smallBadgeOutline: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.border.base },
  smallBadgeOutlineText: { ...Type.bodyXs, color: Colors.text.secondary, fontSize: 11, fontWeight: "600" },
});

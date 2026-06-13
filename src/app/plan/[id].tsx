import { View, Text, Pressable, StyleSheet, ScrollView, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import RideMap from "@/components/RideMap";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { getRoute } from "@/lib/route-planner";
import { DIFFICULTY_META, formatDuration } from "@/lib/activities";

export default function RouteDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const route = getRoute(id);
  if (!route) return null;
  const diff = DIFFICULTY_META[route.difficulty];
  const seed = parseInt(route.id.replace(/\D/g, "")) || 1;

  return (
    <View style={styles.safe}>
      <ImageBackground source={{ uri: route.cover }} style={styles.hero}>
        <LinearGradient colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.85)"]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <View style={styles.heroBar}>
            <Pressable onPress={() => router.back()} style={styles.headBtn}>
              <Ionicons name="chevron-back" size={22} color={Colors.text.inverse} />
            </Pressable>
            <View style={styles.matchPill}>
              <Ionicons name="sparkles" size={12} color={Colors.brand.orange} />
              <Text style={styles.matchText}>Match {route.matchScore}%</Text>
            </View>
            <Pressable style={styles.headBtn}>
              <Ionicons name="bookmark-outline" size={20} color={Colors.text.inverse} />
            </Pressable>
          </View>

          <View style={styles.heroContent}>
            <View style={[styles.diffBadge, { backgroundColor: diff.bg }]}>
              <Text style={[styles.diffText, { color: diff.color }]}>{diff.label}</Text>
            </View>
            <Text style={styles.heroTitle}>{route.title}</Text>
            <Text style={styles.heroZone}>{route.zone}</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={styles.statsCard}>
          <Stat label="Distance" value={`${route.distanceKm}`} unit="km" icon="navigate-outline" />
          <Stat label="Dénivelé" value={`+${route.elevationGain}`} unit="m" icon="trending-up-outline" />
          <Stat label="Durée" value={formatDuration(route.durationMin)} icon="time-outline" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tracé prévu</Text>
          <RideMap height={220} seed={seed} />
          <View style={styles.routeMeta}>
            <View style={styles.routeMetaItem}>
              <View style={[styles.dot, { backgroundColor: Colors.brand.forest }]} />
              <Text style={styles.routeMetaText}>Départ : {route.startPoint}</Text>
            </View>
            <View style={styles.routeMetaItem}>
              <View style={[styles.dot, { backgroundColor: Colors.brand.orange }]} />
              <Text style={styles.routeMetaText}>{route.isLoop ? "Boucle, retour départ" : `Arrivée : ${route.endPoint}`}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Points forts</Text>
          <View style={{ gap: 10 }}>
            {route.highlights.map((h) => (
              <View key={h} style={styles.highlight}>
                <View style={styles.highlightIcon}>
                  <Ionicons name="star" size={12} color={Colors.brand.orange} />
                </View>
                <Text style={styles.highlightText}>{h}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adapté à</Text>
          <View style={styles.bikeTypes}>
            {route.bikeTypes.map((bt) => (
              <View key={bt} style={styles.bikeTypeBadge}>
                <Ionicons name="bicycle" size={14} color={Colors.brand.orange} />
                <Text style={styles.bikeTypeText}>{bt.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.surfaceCard}>
            <View style={styles.surfaceIcon}>
              <Ionicons name="layers-outline" size={20} color={Colors.brand.forest} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.surfaceLabel}>Surface</Text>
              <Text style={styles.surfaceValue}>{route.surface.charAt(0).toUpperCase() + route.surface.slice(1)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={({ pressed }) => [styles.gpxBtn, pressed && { opacity: 0.85 }]}>
          <Ionicons name="download-outline" size={20} color={Colors.text.primary} />
        </Pressable>
        <Pressable
          onPress={() => router.replace("/ride/record")}
          style={({ pressed }) => [styles.startBtn, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name="play" size={18} color={Colors.text.inverse} />
          <Text style={styles.startText}>Démarrer ce ride</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Stat({ label, value, unit, icon }: { label: string; value: string; unit?: string; icon: any }) {
  return (
    <View style={styles.stat}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={18} color={Colors.brand.orange} />
      </View>
      <View style={styles.statValueRow}>
        <Text style={styles.statValue}>{value}</Text>
        {unit && <Text style={styles.statUnit}>{unit}</Text>}
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  hero: { height: 280 },
  heroBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" },
  matchPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, backgroundColor: "rgba(255,255,255,0.95)" },
  matchText: { ...Type.bodyXs, fontWeight: "700", color: Colors.text.primary, fontSize: 11 },
  heroContent: { flex: 1, justifyContent: "flex-end", padding: Spacing.lg, gap: 8 },
  diffBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  diffText: { ...Type.bodyXs, fontWeight: "700", fontSize: 11, letterSpacing: 0.3 },
  heroTitle: { ...Type.display1, color: Colors.text.inverse, fontSize: 28 },
  heroZone: { ...Type.body, color: "rgba(255,255,255,0.85)" },
  statsCard: { flexDirection: "row", margin: Spacing.lg, backgroundColor: Colors.bg.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border.subtle, gap: Spacing.sm },
  stat: { flex: 1, alignItems: "center", gap: 6 },
  statIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(225,90,35,0.1)", alignItems: "center", justifyContent: "center" },
  statValueRow: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  statValue: { ...Type.display3, color: Colors.text.primary, fontSize: 20 },
  statUnit: { ...Type.bodyXs, color: Colors.text.muted },
  statLabel: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 11 },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  sectionTitle: { ...Type.display4, color: Colors.text.primary, marginBottom: Spacing.md },
  routeMeta: { marginTop: 12, gap: 6 },
  routeMetaItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  routeMetaText: { ...Type.bodySm, color: Colors.text.secondary },
  highlight: { flexDirection: "row", alignItems: "center", gap: 10 },
  highlightIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(225,90,35,0.12)", alignItems: "center", justifyContent: "center" },
  highlightText: { ...Type.body, color: Colors.text.secondary },
  bikeTypes: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  bikeTypeBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: "rgba(225,90,35,0.1)" },
  bikeTypeText: { ...Type.label, fontSize: 10, color: Colors.brand.orange },
  surfaceCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: Colors.bg.card, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle },
  surfaceIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(13,79,61,0.1)", alignItems: "center", justifyContent: "center" },
  surfaceLabel: { ...Type.label, color: Colors.text.muted, fontSize: 10 },
  surfaceValue: { ...Type.display4, color: Colors.text.primary, fontSize: 16, marginTop: 2 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: Spacing.lg, backgroundColor: Colors.bg.card, borderTopWidth: 1, borderTopColor: Colors.border.subtle, flexDirection: "row", gap: Spacing.md },
  gpxBtn: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border.base },
  startBtn: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, backgroundColor: Colors.brand.orange, paddingVertical: 14, borderRadius: Radius.pill },
  startText: { ...Type.body, color: Colors.text.inverse, fontWeight: "700", fontSize: 16 },
});

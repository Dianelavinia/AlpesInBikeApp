import { ScrollView, View, Text, Pressable, StyleSheet, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { t } from "@/lib/i18n";
import CarbonHomeWidget from "@/components/CarbonHomeWidget";
import LeaderboardTeaser from "@/components/LeaderboardTeaser";
import { useEffect } from "react";
import { useCarbonStats } from "@/lib/carbon";
import { useLeaderboard } from "@/lib/leaderboard";
import { syncWidgetSnapshot } from "@/lib/widget-sync";

export default function Home() {
  const router = useRouter();
  const { stats: carbon } = useCarbonStats();
  const { data: lb } = useLeaderboard("global", "month", "km");

  useEffect(() => {
    if (!carbon || !lb) return;
    syncWidgetSnapshot({
      km: Math.round(lb.meValue),
      kmThisWeek: Math.round(lb.meValue / 4),
      co2: carbon.co2Saved,
      rank: lb.meScopeRank ?? 0,
      rankTotal: lb.total,
      streakDays: 12,
      monthlyKm: Math.round(lb.meValue),
      monthlyGoal: 400,
      badges: 8,
    });
  }, [carbon?.co2Saved, lb?.meValue, lb?.meScopeRank]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greet}>{t("home.hello")}</Text>
            <Text style={styles.greetName}>Marie</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable onPress={() => router.push("/family")} style={styles.iconBtn}>
              <Ionicons name="people-outline" size={20} color={Colors.text.primary} />
            </Pressable>
            <Pressable onPress={() => router.push("/sos")} style={styles.sosBtn}>
              <Ionicons name="warning" size={18} color={Colors.brand.orange} />
            </Pressable>
          </View>
        </View>

        <View style={styles.hero}>
          <ImageBackground
            source={{ uri: "https://images.unsplash.com/photo-1591619759638-36921634f97e?w=1200&q=85" }}
            style={StyleSheet.absoluteFill}
            imageStyle={{ borderRadius: Radius.xl }}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.1)", "rgba(13,79,61,0.85)"]}
            style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{t("home.heroTitle")}</Text>
            <View style={styles.heroBtns}>
              <Pressable onPress={() => router.push("/plan")} style={styles.heroCta}>
                <Ionicons name="sparkles" size={14} color={Colors.text.inverse} />
                <Text style={styles.heroCtaText}>Planifier un ride</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/ride/record")} style={styles.heroCtaSecondary}>
                <Ionicons name="radio-button-on" size={14} color={Colors.text.inverse} />
                <Text style={styles.heroCtaText}>Enregistrer</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <MiniStat icon="speedometer-outline" value="248" unit="km" label="Ce mois" />
          <MiniStat icon="trending-up-outline" value="3.1k" unit="m" label="Dénivelé" />
          <MiniStat icon="trophy-outline" value="8" label="Badges" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Mode actif</Text>
          <View style={styles.featureGrid}>
            <FeatureCard icon="people" tone={Colors.brand.forest} label="Famille" desc="3 membres en route" onPress={() => router.push("/family")} />
            <FeatureCard icon="battery-charging" tone={Colors.brand.orange} label="Assistant VAE" desc="68% · 92 km" onPress={() => router.push("/vae")} />
          </View>
        </View>

        <CarbonHomeWidget />

        <LeaderboardTeaser />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tous vos outils</Text>
          <View style={styles.toolGrid}>
            <ToolCard icon="compass-outline" label="Rides" onPress={() => router.push("/(tabs)/community")} />
            <ToolCard icon="people-circle-outline" label="Copains" onPress={() => router.push("/buddies" as any)} />
            <ToolCard icon="calendar-outline" label="Événements" onPress={() => router.push("/events" as any)} />
            <ToolCard icon="bicycle-outline" label="Vélos" onPress={() => router.push("/(tabs)/bikes")} />
            <ToolCard icon="calendar-outline" label="Réservations" onPress={() => router.push("/(tabs)/bookings")} />
            <ToolCard icon="alert-circle-outline" label="Signalements" onPress={() => router.push("/reports")} />
            <ToolCard icon="shield-checkmark-outline" label="Antivol" onPress={() => router.push("/antitheft")} />
            <ToolCard icon="construct-outline" label="Entretien" onPress={() => router.push("/maintenance")} />
            <ToolCard icon="trophy-outline" label="Récompenses" onPress={() => router.push("/achievements")} />
            <ToolCard icon="location-outline" label="Tourisme" onPress={() => router.push("/tourism")} />
            <ToolCard icon="briefcase-outline" label="Espace Pro" onPress={() => router.push("/pro")} tone="#0369A1" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t("home.routesTitle")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
            <RouteCard title="Boucle du Revard" distance="38 km" elevation="+1200 m" image="https://images.unsplash.com/photo-1591028889197-3488e003481a?w=600&q=85" />
            <RouteCard title="Tour du lac" distance="44 km" elevation="+350 m" image="https://images.unsplash.com/photo-1561377718-ebad6e79bc4a?w=600&q=85" />
            <RouteCard title="Voie verte Annecy" distance="33 km" elevation="+100 m" image="https://images.unsplash.com/photo-1594056466093-52bcbc7f5e4b?w=600&q=85" />
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MiniStat({ icon, value, unit, label }: { icon: any; value: string; unit?: string; label: string }) {
  return (
    <View style={styles.miniStat}>
      <Ionicons name={icon} size={16} color={Colors.brand.orange} />
      <View style={styles.miniStatRow}>
        <Text style={styles.miniValue}>{value}</Text>
        {unit && <Text style={styles.miniUnit}>{unit}</Text>}
      </View>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  );
}

function FeatureCard({ icon, tone, label, desc, onPress }: { icon: any; tone: string; label: string; desc: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.feature, pressed && { opacity: 0.8 }]}>
      <View style={[styles.featureIcon, { backgroundColor: `${tone}15` }]}>
        <Ionicons name={icon} size={22} color={tone} />
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </Pressable>
  );
}

function ToolCard({ icon, label, onPress, tone }: { icon: any; label: string; onPress: () => void; tone?: string }) {
  const color = tone || Colors.brand.orange;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tool, pressed && { opacity: 0.7 }]}>
      <View style={[styles.toolIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.toolLabel}>{label}</Text>
    </Pressable>
  );
}

function RouteCard({ title, distance, elevation, image }: { title: string; distance: string; elevation: string; image: string }) {
  return (
    <Pressable style={styles.route}>
      <ImageBackground source={{ uri: image }} style={styles.routeImg} imageStyle={{ borderRadius: 16 }} />
      <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={[styles.routeImg, { position: "absolute", borderRadius: 16 }]} />
      <View style={styles.routeText}>
        <Text style={styles.routeTitle}>{title}</Text>
        <Text style={styles.routeMeta}>{distance} · {elevation}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  greet: { ...Type.bodySm, color: Colors.text.muted },
  greetName: { ...Type.display3, color: Colors.text.primary },
  headerRight: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bg.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border.subtle },
  sosBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bg.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border.subtle },
  hero: { marginHorizontal: Spacing.lg, height: 200, borderRadius: Radius.xl, overflow: "hidden", marginBottom: Spacing.lg },
  heroContent: { flex: 1, justifyContent: "flex-end", padding: Spacing.lg },
  heroTitle: { ...Type.display3, color: Colors.text.inverse, marginBottom: Spacing.md, fontSize: 22 },
  heroBtns: { flexDirection: "row", gap: 8 },
  heroCta: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.brand.orange, paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.pill },
  heroCtaSecondary: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(10,10,10,0.55)", paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.pill, borderWidth: 1, borderColor: "rgba(255,255,255,0.45)" },
  heroCtaText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700" },
  statsRow: { flexDirection: "row", paddingHorizontal: Spacing.lg, gap: 8, marginBottom: Spacing.lg },
  miniStat: { flex: 1, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle, gap: 4 },
  miniStatRow: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  miniValue: { ...Type.display3, color: Colors.text.primary, fontSize: 20 },
  miniUnit: { ...Type.bodyXs, color: Colors.text.muted },
  miniLabel: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 11 },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  sectionLabel: { ...Type.label, color: Colors.text.muted, marginBottom: Spacing.md },
  featureGrid: { flexDirection: "row", gap: 10 },
  feature: { flex: 1, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle, gap: 6 },
  featureIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  featureLabel: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 14, marginTop: 4 },
  featureDesc: { ...Type.bodyXs, color: Colors.text.muted },
  toolGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tool: { width: "31%", aspectRatio: 1, padding: Spacing.sm, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle, alignItems: "center", justifyContent: "center", gap: 6 },
  toolIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  toolLabel: { ...Type.bodyXs, color: Colors.text.primary, fontWeight: "600", textAlign: "center", fontSize: 11 },
  route: { width: 220, height: 130, borderRadius: 16, overflow: "hidden" },
  routeImg: { width: "100%", height: "100%" },
  routeText: { position: "absolute", bottom: 12, left: 14, right: 14 },
  routeTitle: { ...Type.display4, color: Colors.text.inverse, fontSize: 15 },
  routeMeta: { ...Type.bodyXs, color: "rgba(255,255,255,0.85)", marginTop: 2 },
});

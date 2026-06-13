import { View, Text, Pressable, StyleSheet, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import CarbonImpactBoard from "@/components/CarbonImpactBoard";
import { useCarbonStats } from "@/lib/carbon";

type Donation = {
  icon: keyof typeof Ionicons.glyphMap;
  name: string;
  partner: string;
  description: string;
  cta: string;
  amount: string;
};

type Trophy = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tint: string;
  earned: boolean;
};

const DONATIONS: Donation[] = [
  {
    icon: "leaf",
    name: "Reforestation Bauges",
    partner: "Reforest'Action",
    description: "Chaque tranche de 1000 km parcourus finance la plantation d'un arbre dans le massif des Bauges.",
    cta: "Faire un don",
    amount: "12€",
  },
  {
    icon: "bicycle",
    name: "Mobilité douce écoles",
    partner: "Bicycle Club Savoie",
    description: "Sponsoring de vélos enfants et d'ateliers d'apprentissage dans les écoles primaires de la vallée.",
    cta: "Faire un don",
    amount: "25€",
  },
  {
    icon: "earth",
    name: "Protection biodiversité",
    partner: "LPO Auvergne Rhône Alpes",
    description: "Préservation des oiseaux de montagne et restauration des habitats alpins sensibles.",
    cta: "Faire un don",
    amount: "18€",
  },
];

const TROPHIES: Trophy[] = [
  { icon: "leaf", label: "Premier arbre", tint: Colors.brand.forest, earned: true },
  { icon: "shield-checkmark", label: "100 kg CO2", tint: Colors.brand.orange, earned: true },
  { icon: "earth", label: "Ambassadeur", tint: Colors.brand.forestLight, earned: false },
];

export default function CarbonImpact() {
  const router = useRouter();
  const { stats } = useCarbonStats();
  const [autoDonate, setAutoDonate] = useState(true);
  const [shareImpact, setShareImpact] = useState(false);

  const co2Saved = stats.co2Saved;
  const yearlyGoal = stats.annualGoal;
  const progressPercent = Math.round((co2Saved / yearlyGoal) * 100);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Mon impact</Text>
        <Pressable style={styles.headBtn}>
          <Ionicons name="share-outline" size={22} color={Colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.hero}>
          <LinearGradient
            colors={[Colors.brand.forest, Colors.brand.forestDark]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroRow}>
            <CircularProgress percent={progressPercent} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <View style={styles.heroLabelRow}>
                <Ionicons name="leaf" size={11} color="rgba(255,255,255,0.7)" />
                <Text style={styles.heroLabel}>Impact 2026</Text>
              </View>
              <Text style={styles.heroValue}>{stats.co2Saved} kg</Text>
              <Text style={styles.heroSub}>de CO2 économisés cette saison</Text>
              <Text style={styles.heroNote}>équivalent {stats.carTripsAvoided} trajets voiture évités</Text>
            </View>
          </View>
          <View style={styles.heroGoal}>
            <Ionicons name="trophy-outline" size={14} color="rgba(255,255,255,0.75)" />
            <Text style={styles.heroGoalText}>
              Objectif annuel : {yearlyGoal} kg CO2, vous y êtes à {progressPercent}%
            </Text>
          </View>
        </View>

        <View style={styles.miniRow}>
          <MiniStat icon="car-outline" value={stats.carTripsAvoided.toString()} label="trajets voiture" />
          <MiniStat icon="leaf-outline" value={Math.round(stats.co2Saved / 22).toString()} label="arbres équivalents" />
          <MiniStat icon="speedometer-outline" value={stats.kmRidden.toLocaleString("fr-FR")} label="km parcourus" />
        </View>

        <View style={{ marginTop: Spacing.xl }}>
          <CarbonImpactBoard />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>Convertir mes km en dons</Text>
            <View style={styles.kmBadge}>
              <Ionicons name="bicycle" size={12} color={Colors.brand.orange} />
              <Text style={styles.kmBadgeText}>{stats.kmRidden.toLocaleString("fr-FR")} km dispo</Text>
            </View>
          </View>
          <View style={{ gap: Spacing.md }}>
            {DONATIONS.map((d) => (
              <View key={d.name} style={styles.donCard}>
                <View style={styles.donHead}>
                  <View style={styles.donIcon}>
                    <Ionicons name={d.icon} size={22} color={Colors.brand.forest} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.donName}>{d.name}</Text>
                    <Text style={styles.donPartner}>{d.partner}</Text>
                  </View>
                </View>
                <Text style={styles.donDesc}>{d.description}</Text>
                <Pressable style={styles.donCta}>
                  <Ionicons name="heart" size={14} color={Colors.text.inverse} />
                  <Text style={styles.donCtaText}>
                    {d.cta} {d.amount}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Mon engagement</Text>
          <View style={styles.toggleCard}>
            <View style={styles.toggleRow}>
              <View style={[styles.toggleIcon, { backgroundColor: "rgba(13,79,61,0.12)" }]}>
                <Ionicons name="repeat" size={18} color={Colors.brand.forest} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Don automatique à chaque ride</Text>
                <Text style={styles.toggleSub}>Arrondi solidaire reversé après chaque sortie</Text>
              </View>
              <Switch
                value={autoDonate}
                onValueChange={setAutoDonate}
                trackColor={{ false: Colors.border.base, true: Colors.brand.forest }}
                thumbColor={Colors.text.inverse}
              />
            </View>
            <View style={styles.toggleDivider} />
            <View style={styles.toggleRow}>
              <View style={[styles.toggleIcon, { backgroundColor: "rgba(225,90,35,0.12)" }]}>
                <Ionicons name="share-social" size={18} color={Colors.brand.orange} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Partager mon impact sur réseaux</Text>
                <Text style={styles.toggleSub}>Visuels personnalisés à chaque palier atteint</Text>
              </View>
              <Switch
                value={shareImpact}
                onValueChange={setShareImpact}
                trackColor={{ false: Colors.border.base, true: Colors.brand.orange }}
                thumbColor={Colors.text.inverse}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Trophées écolo</Text>
          <View style={styles.trophyRow}>
            {TROPHIES.map((t) => (
              <View key={t.label} style={[styles.trophy, !t.earned && styles.trophyLocked]}>
                <View
                  style={[
                    styles.trophyIcon,
                    { backgroundColor: t.earned ? `${t.tint}18` : Colors.bg.elevated },
                  ]}
                >
                  <Ionicons
                    name={t.earned ? t.icon : "lock-closed"}
                    size={24}
                    color={t.earned ? t.tint : Colors.text.muted}
                  />
                </View>
                <Text style={[styles.trophyLabel, !t.earned && { color: Colors.text.muted }]}>
                  {t.label}
                </Text>
                {t.earned ? (
                  <View style={styles.trophyBadge}>
                    <Text style={styles.trophyBadgeText}>Débloqué</Text>
                  </View>
                ) : (
                  <Text style={styles.trophyHint}>À débloquer</Text>
                )}
              </View>
            ))}
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
    <Svg width={92} height={92} viewBox="0 0 92 92">
      <Circle cx={46} cy={46} r={r} stroke="rgba(255,255,255,0.18)" strokeWidth={8} fill="none" />
      <Circle
        cx={46}
        cy={46}
        r={r}
        stroke={Colors.brand.orange}
        strokeWidth={8}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 46 46)"
      />
    </Svg>
  );
}

function MiniStat({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.mini}>
      <View style={styles.miniIcon}>
        <Ionicons name={icon} size={16} color={Colors.brand.forest} />
      </View>
      <Text style={styles.miniValue}>{value}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18 },
  hero: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    overflow: "hidden",
    position: "relative",
  },
  heroRow: { flexDirection: "row", alignItems: "center" },
  heroLabelRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  heroLabel: { ...Type.label, color: "rgba(255,255,255,0.7)", fontSize: 10 },
  heroValue: { ...Type.display1, color: Colors.text.inverse, fontSize: 42, marginTop: 2 },
  heroSub: { ...Type.bodySm, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  heroNote: { ...Type.bodyXs, color: "rgba(255,255,255,0.65)", marginTop: 4 },
  heroGoal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
  },
  heroGoalText: { ...Type.bodyXs, color: "rgba(255,255,255,0.8)", flex: 1 },
  miniRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  mini: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    alignItems: "center",
    gap: 6,
  },
  miniIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(13,79,61,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  miniValue: { ...Type.display3, color: Colors.text.primary, fontSize: 22 },
  miniLabel: { ...Type.bodyXs, color: Colors.text.muted, textAlign: "center", fontSize: 11 },
  section: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  sectionLabel: { ...Type.label, color: Colors.text.muted, marginBottom: 12 },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  kmBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(225,90,35,0.12)",
  },
  kmBadgeText: { ...Type.bodyXs, color: Colors.brand.orange, fontWeight: "700" },
  equivRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: Spacing.md,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  equivIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  equivTitle: { ...Type.bodyXs, color: Colors.text.muted, marginBottom: 2 },
  equivValue: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700" },
  donCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  donHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  donIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(13,79,61,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  donName: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 15 },
  donPartner: { ...Type.bodyXs, color: Colors.brand.forest, fontWeight: "600", marginTop: 2 },
  donDesc: { ...Type.bodySm, color: Colors.text.secondary, lineHeight: 19 },
  donCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: Radius.pill,
    backgroundColor: Colors.brand.forest,
    marginTop: 4,
  },
  donCtaText: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "700" },
  toggleCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    paddingHorizontal: Spacing.md,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: Spacing.md,
  },
  toggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleTitle: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700" },
  toggleSub: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 2 },
  toggleDivider: { height: 1, backgroundColor: Colors.border.subtle },
  trophyRow: { flexDirection: "row", gap: 10 },
  trophy: {
    flex: 1,
    padding: Spacing.md,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    alignItems: "center",
    gap: 8,
  },
  trophyLocked: { borderStyle: "dashed", borderColor: Colors.border.base },
  trophyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  trophyLabel: {
    ...Type.bodyXs,
    color: Colors.text.primary,
    fontWeight: "700",
    textAlign: "center",
    fontSize: 11,
  },
  trophyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(13,79,61,0.12)",
  },
  trophyBadgeText: {
    ...Type.bodyXs,
    color: Colors.brand.forest,
    fontWeight: "700",
    fontSize: 10,
  },
  trophyHint: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 10 },
});

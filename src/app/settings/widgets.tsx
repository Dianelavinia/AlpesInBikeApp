import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { SmallWidget, MediumWidget, LargeWidget, LockWidget, type WidgetData } from "@/components/PhoneWidgetPreview";
import { useCarbonStats } from "@/lib/carbon";
import { useLeaderboard } from "@/lib/leaderboard";

const STEPS = Platform.OS === "ios"
  ? [
      "Long appui sur l'écran d'accueil iOS",
      "Touchez le + en haut à gauche",
      "Cherchez Alpes in Bike, choisissez la taille",
      "Touchez Ajouter le widget",
    ]
  : [
      "Long appui sur l'écran d'accueil Android",
      "Choisissez Widgets",
      "Faites défiler jusqu'à Alpes in Bike",
      "Glissez la taille voulue sur l'écran",
    ];

export default function WidgetsSettings() {
  const router = useRouter();
  const { stats } = useCarbonStats();
  const { data } = useLeaderboard("global", "month", "km");

  const widgetData: WidgetData = {
    km: data?.meValue ? Math.round(data.meValue) : 248,
    co2: stats.co2Saved,
    rank: data?.meScopeRank ?? 4,
    rankTotal: data?.total ?? 26,
    streakDays: 12,
    monthlyKm: data?.meValue ? Math.round(data.meValue) : 248,
    monthlyGoal: 400,
    badges: 8,
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Widgets téléphone</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Pour les accros qui aiment voir leurs stats sans ouvrir l'app</Text>
          <Text style={styles.heroDesc}>
            Quatre formats à épingler sur votre écran d'accueil ou écran de verrouillage. Données mises à jour à chaque ouverture de l'app et à chaque fin de ride.
          </Text>
        </View>

        <Section title="Petit, kilomètres + classement" subtitle="iOS systemSmall · Android 2x2">
          <View style={styles.previewStage}>
            <SmallWidget data={widgetData} />
          </View>
        </Section>

        <Section title="Moyen, bilan carbone" subtitle="iOS systemMedium · Android 4x2">
          <View style={styles.previewStage}>
            <MediumWidget data={widgetData} />
          </View>
        </Section>

        <Section title="Grand, tableau de bord" subtitle="iOS systemLarge · Android 4x4">
          <View style={styles.previewStage}>
            <LargeWidget data={widgetData} />
          </View>
        </Section>

        <Section title="Écran de verrouillage" subtitle="iOS accessoryCircular · Android Lock screen">
          <View style={styles.previewStage}>
            <LockWidget data={widgetData} />
          </View>
        </Section>

        <View style={styles.howCard}>
          <View style={styles.howHead}>
            <View style={styles.howIcon}>
              <Ionicons name="information-circle" size={18} color={Colors.brand.orange} />
            </View>
            <Text style={styles.howTitle}>Comment l'ajouter ?</Text>
          </View>
          {STEPS.map((s, i) => (
            <View key={i} style={styles.howStep}>
              <View style={styles.howNum}>
                <Text style={styles.howNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.howStepText}>{s}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons name="bicycle" size={22} color={Colors.brand.forest} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Astuce des rideurs accros</Text>
            <Text style={styles.tipDesc}>
              Mettez le grand widget sur la première page d'accueil. Vous voyez votre rang, vos km du mois et vos badges en un coup d'œil, et un appui lance directement l'enregistrement du ride.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18 },
  heroCard: { marginHorizontal: Spacing.lg, marginTop: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle },
  heroLabel: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700" },
  heroDesc: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 6, lineHeight: 17 },
  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl },
  sectionTitle: { ...Type.display4, color: Colors.text.primary, fontSize: 15, marginBottom: 2 },
  sectionSubtitle: { ...Type.bodyXs, color: Colors.text.muted, marginBottom: Spacing.md },
  previewStage: { alignItems: "center", paddingVertical: Spacing.lg, paddingHorizontal: Spacing.md, borderRadius: Radius.md, backgroundColor: "#E7E5E4" },
  howCard: { marginHorizontal: Spacing.lg, marginTop: Spacing.xl, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle, gap: Spacing.sm },
  howHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  howIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(225,90,35,0.12)", alignItems: "center", justifyContent: "center" },
  howTitle: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700" },
  howStep: { flexDirection: "row", gap: 10, alignItems: "center" },
  howNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.brand.forest, alignItems: "center", justifyContent: "center" },
  howNumText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700", fontSize: 11 },
  howStepText: { flex: 1, ...Type.bodyXs, color: Colors.text.secondary, lineHeight: 17 },
  tipCard: { marginHorizontal: Spacing.lg, marginTop: Spacing.lg, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: "rgba(13,79,61,0.06)", borderWidth: 1, borderColor: "rgba(13,79,61,0.18)", flexDirection: "row", gap: 12 },
  tipIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(13,79,61,0.14)", alignItems: "center", justifyContent: "center" },
  tipTitle: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700" },
  tipDesc: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 4, lineHeight: 17 },
});

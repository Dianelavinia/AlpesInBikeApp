import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { ACTIVITIES } from "@/lib/activities";
import { ROUTE_SUGGESTIONS } from "@/lib/route-planner";

/**
 * Écran intermédiaire avant de lancer un parcours.
 * Pose la question : avez-vous votre vélo, ou en avez-vous besoin ?
 *   - Vélo perso  → /ride/record (démarre l'enregistrement direct)
 *   - Location    → /booking/new (passe par le tunnel de réservation)
 */

export default function StartChooser() {
  const router = useRouter();
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const activity = ACTIVITIES.find((a) => a.id === rideId);
  const route = ROUTE_SUGGESTIONS.find((r) => r.id === rideId);
  const ride = activity
    ? { title: activity.title, zone: activity.zone, distanceKm: activity.stats.distanceKm, elevationGain: activity.stats.elevationGain }
    : route
      ? { title: route.title, zone: route.zone, distanceKm: route.distanceKm, elevationGain: route.elevationGain }
      : null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="close" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Avant de partir</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {ride && (
          <View style={styles.rideBanner}>
            <View style={styles.rideIcon}>
              <Ionicons name="map-outline" size={18} color={Colors.brand.forest} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rideLabel}>Parcours sélectionné</Text>
              <Text style={styles.rideName} numberOfLines={1}>{ride.title}</Text>
              <Text style={styles.rideMeta}>
                {ride.distanceKm} km · +{ride.elevationGain} m · {ride.zone}
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.question}>Avez-vous votre vélo ?</Text>
        <Text style={styles.questionSub}>
          On adapte la suite selon votre situation. Vous pouvez aussi changer d'avis plus tard.
        </Text>

        <Pressable
          onPress={() => router.replace("/ride/record")}
          style={({ pressed }) => [styles.choice, pressed && { opacity: 0.92 }]}
        >
          <LinearGradient
            colors={[Colors.brand.forest, Colors.brand.forestDark]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.choiceTop}>
            <View style={styles.choiceIconLight}>
              <Ionicons name="bicycle" size={26} color={Colors.text.inverse} />
            </View>
            <View style={styles.choiceBadge}>
              <Text style={styles.choiceBadgeText}>Gratuit</Text>
            </View>
          </View>
          <Text style={styles.choiceTitleLight}>J'ai déjà mon vélo</Text>
          <Text style={styles.choiceDescLight}>
            On lance directement l'enregistrement GPS et le suivi d'effort. Aucune location, aucun paiement.
          </Text>
          <View style={styles.choiceFootLight}>
            <Ionicons name="play-circle" size={16} color={Colors.brand.orangeLight} />
            <Text style={styles.choiceFootTextLight}>Démarrer le ride</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.brand.orangeLight} />
          </View>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/booking/new")}
          style={({ pressed }) => [styles.choiceLight, pressed && { opacity: 0.92 }]}
        >
          <View style={styles.choiceTop}>
            <View style={styles.choiceIcon}>
              <Ionicons name="storefront-outline" size={26} color={Colors.brand.orange} />
            </View>
            <View style={styles.choiceBadgeOrange}>
              <Text style={styles.choiceBadgeTextOrange}>À partir de 29 €/jour</Text>
            </View>
          </View>
          <Text style={styles.choiceTitle}>J'ai besoin d'un vélo</Text>
          <Text style={styles.choiceDesc}>
            On vous propose les vélos compatibles avec ce parcours et on les livre où vous voulez. Casque et antivol inclus.
          </Text>
          <View style={styles.choiceFoot}>
            <Ionicons name="cart-outline" size={16} color={Colors.brand.orange} />
            <Text style={styles.choiceFootText}>Voir les vélos disponibles</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.brand.orange} />
          </View>
        </Pressable>

        <View style={styles.hintCard}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.text.muted} />
          <Text style={styles.hintText}>
            Le suivi GPS, les statistiques, le classement et le bilan carbone fonctionnent exactement pareil avec votre vélo perso ou un vélo loué.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18 },

  rideBanner: { marginHorizontal: Spacing.lg, marginTop: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle, flexDirection: "row", alignItems: "center", gap: 12 },
  rideIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(13,79,61,0.12)", alignItems: "center", justifyContent: "center" },
  rideLabel: { ...Type.label, color: Colors.text.muted, fontSize: 10 },
  rideName: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", marginTop: 2 },
  rideMeta: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 2 },

  question: { ...Type.display2, color: Colors.text.primary, fontSize: 24, paddingHorizontal: Spacing.lg, marginTop: Spacing.xl, marginBottom: 6 },
  questionSub: { ...Type.bodySm, color: Colors.text.muted, paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg, lineHeight: 20 },

  choice: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, padding: Spacing.lg, borderRadius: Radius.lg, overflow: "hidden", gap: Spacing.sm },
  choiceLight: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, padding: Spacing.lg, borderRadius: Radius.lg, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.base, gap: Spacing.sm },
  choiceTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  choiceIconLight: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  choiceIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(225,90,35,0.12)", alignItems: "center", justifyContent: "center" },
  choiceBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill, backgroundColor: "rgba(255,255,255,0.16)" },
  choiceBadgeText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700", fontSize: 11 },
  choiceBadgeOrange: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill, backgroundColor: "rgba(225,90,35,0.12)" },
  choiceBadgeTextOrange: { ...Type.bodyXs, color: Colors.brand.orange, fontWeight: "700", fontSize: 11 },
  choiceTitleLight: { ...Type.display3, color: Colors.text.inverse, fontSize: 22, marginTop: 4 },
  choiceTitle: { ...Type.display3, color: Colors.text.primary, fontSize: 22, marginTop: 4 },
  choiceDescLight: { ...Type.bodySm, color: "rgba(255,255,255,0.85)", lineHeight: 20 },
  choiceDesc: { ...Type.bodySm, color: Colors.text.muted, lineHeight: 20 },
  choiceFootLight: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  choiceFoot: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  choiceFootTextLight: { ...Type.bodySm, color: Colors.brand.orangeLight, fontWeight: "700", flex: 1 },
  choiceFootText: { ...Type.bodySm, color: Colors.brand.orange, fontWeight: "700", flex: 1 },

  hintCard: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginHorizontal: Spacing.lg, padding: Spacing.md, borderRadius: Radius.sm, backgroundColor: Colors.bg.elevated, marginTop: Spacing.md },
  hintText: { flex: 1, ...Type.bodyXs, color: Colors.text.muted, lineHeight: 17 },
});

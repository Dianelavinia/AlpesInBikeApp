import { View, Text, Pressable, StyleSheet, ScrollView, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import RideMap from "@/components/RideMap";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { DIFFICULTY_META, getActivity, formatDuration, formatRelativeDate } from "@/lib/activities";

export default function RideDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const ride = getActivity(id);
  if (!ride) return null;
  const diff = DIFFICULTY_META[ride.difficulty];
  const seed = parseInt(ride.id.replace(/\D/g, "")) || 1;

  return (
    <View style={styles.safe}>
      <ImageBackground source={{ uri: ride.cover }} style={styles.hero}>
        <LinearGradient colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.85)"]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <View style={styles.heroBar}>
            <Pressable onPress={() => router.back()} style={styles.headBtn}>
              <Ionicons name="chevron-back" size={22} color={Colors.text.inverse} />
            </Pressable>
            <Pressable style={styles.headBtn}>
              <Ionicons name="share-outline" size={20} color={Colors.text.inverse} />
            </Pressable>
          </View>

          <View style={styles.heroContent}>
            <View style={[styles.diffBadge, { backgroundColor: diff.bg }]}>
              <Text style={[styles.diffText, { color: diff.color }]}>{diff.label}</Text>
            </View>
            <Text style={styles.heroTitle}>{ride.title}</Text>
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{ride.userAvatar}</Text>
              </View>
              <View>
                <Text style={styles.userName}>{ride.userName}</Text>
                <Text style={styles.userMeta}>{formatRelativeDate(ride.date)} · {ride.zone}</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.statsCard}>
          <StatRow label="Distance" value={`${ride.stats.distanceKm} km`} icon="navigate-outline" />
          <StatRow label="Durée" value={formatDuration(ride.stats.durationMin)} icon="time-outline" />
          <StatRow label="Dénivelé positif" value={`+${ride.stats.elevationGain} m`} icon="trending-up-outline" />
          <StatRow label="Vitesse moyenne" value={`${ride.stats.avgSpeed.toFixed(1)} km/h`} icon="speedometer-outline" />
          <StatRow label="Vitesse max" value={`${ride.stats.maxSpeed.toFixed(1)} km/h`} icon="flash-outline" />
          {ride.stats.calories && <StatRow label="Calories" value={`${ride.stats.calories} kcal`} icon="flame-outline" last />}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tracé du parcours</Text>
          <RideMap height={220} seed={seed} />
        </View>

        {ride.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À propos de ce ride</Text>
            <Text style={styles.desc}>{ride.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vélo utilisé</Text>
          <View style={styles.bikeCard}>
            <View style={styles.bikeIcon}>
              <Ionicons name="bicycle" size={26} color={Colors.brand.orange} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bikeName}>{ride.bikeName}</Text>
              <Text style={styles.bikeMeta}>Loué chez Alpes in Bike</Text>
            </View>
            <Pressable style={styles.bikeBtn}>
              <Text style={styles.bikeBtnText}>Voir</Text>
            </Pressable>
          </View>
        </View>

        {ride.photos && ride.photos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {ride.photos.map((p, i) => (
                <ImageBackground key={i} source={{ uri: p }} style={styles.photo} imageStyle={{ borderRadius: 12 }} />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.actions}>
          <Pressable style={styles.actionBtn}>
            <Ionicons name="heart-outline" size={20} color={Colors.text.primary} />
            <Text style={styles.actionText}>{ride.likes}</Text>
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={18} color={Colors.text.primary} />
            <Text style={styles.actionText}>{ride.comments}</Text>
          </Pressable>
        </View>
        <Pressable onPress={() => router.push("/booking/new")} style={({ pressed }) => [styles.refaire, pressed && { opacity: 0.85 }]}>
          <Text style={styles.refaireText}>Refaire ce parcours</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.text.inverse} />
        </Pressable>
      </View>
    </View>
  );
}

function StatRow({ label, value, icon, last }: { label: string; value: string; icon: any; last?: boolean }) {
  return (
    <View style={[styles.statRow, !last && styles.statRowBorder]}>
      <View style={styles.statIcon}><Ionicons name={icon} size={16} color={Colors.brand.orange} /></View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  hero: { height: 320 },
  heroBar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" },
  heroContent: { flex: 1, justifyContent: "flex-end", padding: Spacing.lg, gap: Spacing.md },
  diffBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  diffText: { ...Type.bodyXs, fontWeight: "700", fontSize: 11, letterSpacing: 0.3 },
  heroTitle: { ...Type.display1, color: Colors.text.inverse, fontSize: 28 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.brand.orange, alignItems: "center", justifyContent: "center" },
  avatarText: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "700", fontSize: 13 },
  userName: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "700" },
  userMeta: { ...Type.bodyXs, color: "rgba(255,255,255,0.8)" },
  statsCard: { margin: Spacing.lg, backgroundColor: Colors.bg.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border.subtle },
  statRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12 },
  statRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border.subtle },
  statIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(225,90,35,0.1)", alignItems: "center", justifyContent: "center" },
  statLabel: { ...Type.bodySm, color: Colors.text.secondary, flex: 1, fontWeight: "500" },
  statValue: { ...Type.display4, color: Colors.text.primary, fontSize: 16 },
  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.md, marginBottom: Spacing.lg },
  sectionTitle: { ...Type.display4, color: Colors.text.primary, marginBottom: Spacing.md },
  desc: { ...Type.body, color: Colors.text.secondary, lineHeight: 24 },
  bikeCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: Colors.bg.card, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle },
  bikeIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(225,90,35,0.1)", alignItems: "center", justifyContent: "center" },
  bikeName: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700" },
  bikeMeta: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 2 },
  bikeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: Colors.brand.orange },
  bikeBtnText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700" },
  photo: { width: 160, height: 120 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: Spacing.lg, backgroundColor: Colors.bg.card, borderTopWidth: 1, borderTopColor: Colors.border.subtle, flexDirection: "row", alignItems: "center", gap: Spacing.md },
  actions: { flexDirection: "row", gap: Spacing.md },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionText: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700" },
  refaire: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, backgroundColor: Colors.brand.orange, paddingVertical: 14, borderRadius: Radius.pill },
  refaireText: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "700", fontSize: 14 },
});

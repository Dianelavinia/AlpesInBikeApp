import { ScrollView, View, Text, Pressable, StyleSheet, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { ACTIVITIES, DIFFICULTY_META, formatDuration, formatRelativeDate, type Activity, type Difficulty } from "@/lib/activities";

const FILTERS: { id: "all" | Difficulty; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "facile", label: "Facile" },
  { id: "intermediaire", label: "Intermédiaire" },
  { id: "difficile", label: "Difficile" },
  { id: "expert", label: "Expert" },
];

export default function Community() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | Difficulty>("all");

  const items = filter === "all" ? ACTIVITIES : ACTIVITIES.filter((a) => a.difficulty === filter);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Rides</Text>
          <Text style={styles.subtitle}>Vos sorties partagées</Text>
        </View>
        <Pressable
          onPress={() => router.push("/ride/record")}
          style={({ pressed }) => [styles.recordBtn, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name="radio-button-on" size={14} color={Colors.text.inverse} />
          <Text style={styles.recordText}>Enregistrer</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.push("/buddies" as any)}
        style={({ pressed }) => [styles.buddiesCta, pressed && { opacity: 0.92 }]}
      >
        <View style={styles.buddiesIcon}>
          <Ionicons name="people-circle" size={22} color={Colors.brand.forest} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.buddiesTitle}>Trouver des copains de route</Text>
          <Text style={styles.buddiesDesc}>9 rideurs compatibles · 4 sorties groupe ce weekend</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.text.muted} />
      </Pressable>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filters}
      >
        {FILTERS.map((f, i) => (
          <Pressable
            key={f.id}
            onPress={() => setFilter(f.id)}
            style={[styles.chip, i > 0 && { marginLeft: 8 }, filter === f.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === f.id && styles.chipTextActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {items.map((a) => (
          <ActivityCard key={a.id} activity={a} onPress={() => router.push(`/ride/${a.id}`)} />
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ActivityCard({ activity, onPress }: { activity: Activity; onPress: () => void }) {
  const diff = DIFFICULTY_META[activity.difficulty];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{activity.userAvatar}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{activity.userName}</Text>
          <Text style={styles.userMeta}>{formatRelativeDate(activity.date)} · {activity.zone}</Text>
        </View>
        <View style={[styles.diffBadge, { backgroundColor: diff.bg }]}>
          <Text style={[styles.diffText, { color: diff.color }]}>{diff.label}</Text>
        </View>
      </View>

      <ImageBackground source={{ uri: activity.cover }} style={styles.cover} imageStyle={{ borderRadius: 14 }}>
        <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]} style={[StyleSheet.absoluteFill, { borderRadius: 14 }]} />
        <View style={styles.coverContent}>
          <Text style={styles.rideTitle} numberOfLines={2}>{activity.title}</Text>
          <View style={styles.bikeRow}>
            <Ionicons name="bicycle" size={12} color="rgba(255,255,255,0.85)" />
            <Text style={styles.bikeName}>{activity.bikeName}</Text>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.stats}>
        <Stat icon="navigate-outline" value={`${activity.stats.distanceKm} km`} />
        <Stat icon="time-outline" value={formatDuration(activity.stats.durationMin)} />
        <Stat icon="trending-up-outline" value={`+${activity.stats.elevationGain} m`} />
        <Stat icon="speedometer-outline" value={`${activity.stats.avgSpeed.toFixed(1)} km/h`} />
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="heart-outline" size={18} color={Colors.text.secondary} />
            <Text style={styles.footerText}>{activity.likes}</Text>
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="chatbubble-outline" size={17} color={Colors.text.secondary} />
            <Text style={styles.footerText}>{activity.comments}</Text>
          </Pressable>
        </View>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="share-social-outline" size={18} color={Colors.text.secondary} />
        </Pressable>
      </View>
    </Pressable>
  );
}

function Stat({ icon, value }: { icon: any; value: string }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={13} color={Colors.text.muted} />
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md },
  title: { ...Type.display1, color: Colors.text.primary, fontSize: 34 },
  subtitle: { ...Type.bodySm, color: Colors.text.muted, marginTop: 2 },
  recordBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.brand.orange, paddingHorizontal: 14, paddingVertical: 9, borderRadius: Radius.pill },
  recordText: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "700", fontSize: 13 },
  buddiesCta: { flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: Spacing.lg, marginBottom: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: "rgba(13,79,61,0.06)", borderWidth: 1, borderColor: "rgba(13,79,61,0.2)" },
  buddiesIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bg.card, alignItems: "center", justifyContent: "center" },
  buddiesTitle: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 14 },
  buddiesDesc: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 2 },
  filtersScroll: { flexGrow: 0, maxHeight: 60, marginBottom: Spacing.sm },
  filters: { paddingHorizontal: Spacing.lg, alignItems: "center", paddingVertical: 6 },
  chip: { paddingHorizontal: 14, height: 34, justifyContent: "center", borderRadius: Radius.pill, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle },
  chipActive: { backgroundColor: Colors.brand.ink, borderColor: Colors.brand.ink },
  chipText: { ...Type.bodySm, color: Colors.text.secondary, fontWeight: "600", fontSize: 13 },
  chipTextActive: { color: Colors.text.inverse },
  list: { paddingHorizontal: Spacing.lg, paddingTop: 6, gap: 16 },
  card: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border.subtle, gap: Spacing.md },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.brand.forest, alignItems: "center", justifyContent: "center" },
  avatarText: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "700", fontSize: 13 },
  userName: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 14 },
  userMeta: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 1 },
  diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  diffText: { ...Type.bodyXs, fontWeight: "700", fontSize: 11, letterSpacing: 0.3 },
  cover: { height: 160, borderRadius: 14, overflow: "hidden", justifyContent: "flex-end" },
  coverContent: { padding: 14, gap: 6 },
  rideTitle: { ...Type.display4, color: Colors.text.inverse, fontSize: 18 },
  bikeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  bikeName: { ...Type.bodyXs, color: "rgba(255,255,255,0.85)" },
  stats: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  statValue: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 13 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border.subtle },
  footerLeft: { flexDirection: "row", gap: Spacing.md },
  iconBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  footerText: { ...Type.bodySm, color: Colors.text.secondary, fontWeight: "600", fontSize: 13 },
});

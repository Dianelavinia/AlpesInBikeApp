import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { useLeaderboard, METRIC_META } from "@/lib/leaderboard";

/**
 * Bandeau compact à afficher sur la Home pour montrer la position
 * du rideur dans le classement mensuel global et donner envie de grimper.
 */

export default function LeaderboardTeaser() {
  const router = useRouter();
  const { data, loading } = useLeaderboard("global", "month", "km");

  if (loading || !data || !data.meScopeRank) return null;

  const next = data.list.find((r) => r.rank === Math.max(1, data.meScopeRank! - 1));
  const gap = next ? next.value - data.meValue : 0;
  const meta = METRIC_META.km;

  return (
    <Pressable onPress={() => router.push("/leaderboard" as any)} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
      <View style={styles.left}>
        <View style={styles.rankBubble}>
          <Text style={styles.rankBubbleNum}>#{data.meScopeRank}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Vous êtes {data.meScopeRank}e ce mois</Text>
          <Text style={styles.sub}>sur {data.total} rideurs Alpes in Bike</Text>
          {gap > 0 && next && (
            <View style={styles.gapRow}>
              <Ionicons name="trending-up" size={11} color={Colors.brand.orange} />
              <Text style={styles.gapText}>
                {Math.round(gap)} {meta.unit} pour dépasser {next.name.split(" ")[0]}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.right}>
        <Ionicons name="trophy" size={16} color={Colors.brand.orange} />
        <Text style={styles.cta}>Voir</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle, flexDirection: "row", alignItems: "center", gap: 10 },
  left: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  rankBubble: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(225,90,35,0.12)", alignItems: "center", justifyContent: "center" },
  rankBubbleNum: { ...Type.display4, color: Colors.brand.orange, fontSize: 15 },
  title: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 14 },
  sub: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 2 },
  gapRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  gapText: { ...Type.bodyXs, color: Colors.brand.orange, fontWeight: "600", fontSize: 11 },
  right: { alignItems: "center", gap: 2 },
  cta: { ...Type.bodyXs, color: Colors.text.muted, fontWeight: "700", fontSize: 10 },
});

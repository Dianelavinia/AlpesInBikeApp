import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { USER_CARBON, getFunEquivalents } from "@/lib/carbon";

/**
 * Widget compact à afficher sur la Home pour motiver tous les jours.
 */

export default function CarbonHomeWidget() {
  const router = useRouter();
  const eqs = getFunEquivalents(USER_CARBON.co2Saved);
  const featured = eqs[0];

  return (
    <Pressable onPress={() => router.push("/carbon")} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
      <LinearGradient colors={[Colors.brand.forest, Colors.brand.forestDark]} style={StyleSheet.absoluteFill} />
      <View style={styles.row}>
        <View style={styles.leafBadge}>
          <Ionicons name="leaf" size={16} color={Colors.brand.orangeLight} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Vous avez sauvé {USER_CARBON.co2Saved} kg de CO2</Text>
          <Text style={styles.subtitle}>
            soit {featured.big} {featured.unit} {featured.desc.split(",")[0]}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
      </View>
      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${Math.min(100, (USER_CARBON.co2Saved / USER_CARBON.annualGoal) * 100)}%` }]} />
      </View>
      <View style={styles.barFooter}>
        <Text style={styles.barText}>Objectif annuel {USER_CARBON.annualGoal} kg</Text>
        <Text style={styles.barText}>{Math.round((USER_CARBON.co2Saved / USER_CARBON.annualGoal) * 100)}%</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, padding: Spacing.md, borderRadius: Radius.lg, overflow: "hidden", gap: Spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  leafBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(246,181,149,0.2)", alignItems: "center", justifyContent: "center" },
  title: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "700", fontSize: 14 },
  subtitle: { ...Type.bodyXs, color: "rgba(255,255,255,0.8)", marginTop: 2, fontSize: 11.5 },
  bar: { height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.15)", overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: Colors.brand.orange },
  barFooter: { flexDirection: "row", justifyContent: "space-between" },
  barText: { ...Type.bodyXs, color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: "600" },
});

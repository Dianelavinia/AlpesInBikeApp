import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { BIKES, type BikeModel } from "@/lib/catalog";
import { t } from "@/lib/i18n";

const FILTERS = [
  { id: "all", label: "Tous" },
  { id: "vttae", label: "VTTAE" },
  { id: "vtt", label: "VTT" },
  { id: "kid", label: "Enfant" },
  { id: "road", label: "Route" },
];

export default function Bikes() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all"
    ? BIKES
    : BIKES.filter((b) => b.category === filter || (filter === "kid" && b.audience === "child"));

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("bikes.title")}</Text>
        <Text style={styles.subtitle}>{t("bikes.subtitle")}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => setFilter(f.id)}
            style={[styles.chip, filter === f.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === f.id && styles.chipTextActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 32, gap: 14 }}>
        {filtered.map((bike) => (
          <BikeCard key={bike.slug} bike={bike} onPress={() => router.push(`/bike/${bike.slug}`)} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function BikeCard({ bike, onPress }: { bike: BikeModel; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
      <View style={[styles.cardHero, { backgroundColor: bike.color }]}>
        <Text style={styles.emoji}>{bike.emoji}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{bike.brand}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardName}>{bike.name}</Text>
          <Text style={styles.cardTag}>{bike.tagline}</Text>
          <View style={styles.cardMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="resize-outline" size={12} color={Colors.text.muted} />
              <Text style={styles.metaText}>{bike.sizes.join(", ")}</Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaItem}>
              <Ionicons name="checkmark-circle-outline" size={12} color={Colors.brand.forest} />
              <Text style={styles.metaText}>{bike.available} {t("bikes.available")}</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardPrice}>
          <Text style={styles.priceFrom}>{t("bikes.from")}</Text>
          <Text style={styles.priceValue}>{bike.pricePerDay} €</Text>
          <Text style={styles.priceUnit}>{t("bikes.perDay")}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  title: { ...Type.display1, color: Colors.text.primary, fontSize: 34 },
  subtitle: { ...Type.body, color: Colors.text.muted, marginTop: 4 },
  filters: { paddingHorizontal: Spacing.lg, gap: 8, paddingBottom: Spacing.lg },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle },
  chipActive: { backgroundColor: Colors.brand.ink, borderColor: Colors.brand.ink },
  chipText: { ...Type.bodySm, color: Colors.text.secondary, fontWeight: "600" },
  chipTextActive: { color: Colors.text.inverse },
  card: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, overflow: "hidden", borderWidth: 1, borderColor: Colors.border.subtle },
  cardHero: { height: 140, alignItems: "center", justifyContent: "center", position: "relative" },
  emoji: { fontSize: 64 },
  badge: { position: "absolute", top: 12, left: 12, backgroundColor: "rgba(255,255,255,0.95)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  badgeText: { ...Type.label, fontSize: 10, color: Colors.text.primary },
  cardBody: { padding: Spacing.md, flexDirection: "row", gap: Spacing.md, alignItems: "flex-start" },
  cardName: { ...Type.display4, color: Colors.text.primary, fontSize: 18 },
  cardTag: { ...Type.bodySm, color: Colors.text.muted, marginTop: 2, fontStyle: "italic" },
  cardMeta: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 8 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { ...Type.bodyXs, color: Colors.text.muted },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.border.base },
  cardPrice: { alignItems: "flex-end" },
  priceFrom: { ...Type.bodyXs, color: Colors.text.muted },
  priceValue: { ...Type.display3, color: Colors.brand.orange, fontSize: 24 },
  priceUnit: { ...Type.bodyXs, color: Colors.text.muted },
});

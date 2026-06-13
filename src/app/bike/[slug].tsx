import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { BIKES } from "@/lib/catalog";
import { t } from "@/lib/i18n";

export default function BikeDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const bike = BIKES.find((b) => b.slug === slug);

  if (!bike) return null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={[styles.hero, { backgroundColor: bike.color }]}>
          <Text style={styles.heroEmoji}>{bike.emoji}</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>{bike.brand}</Text>
          </View>
          <Text style={styles.name}>{bike.name}</Text>
          <Text style={styles.tag}>{bike.tagline}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceFrom}>{t("bikes.from")}</Text>
            <Text style={styles.price}>{bike.pricePerDay} €</Text>
            <Text style={styles.priceUnit}>{t("bikes.perDay")}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tailles disponibles</Text>
            <View style={styles.sizes}>
              {bike.sizes.map((s) => (
                <View key={s} style={styles.sizeChip}>
                  <Text style={styles.sizeText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inclus</Text>
            <View style={{ gap: 10 }}>
              <Feature icon="shield-checkmark-outline" text="Casque adapté à la taille" />
              <Feature icon="lock-closed-outline" text="Antivol U et chaîne" />
              <Feature icon="build-outline" text="Kit de réparation complet" />
              <Feature icon="briefcase-outline" text="Sac de transport" />
            </View>
          </View>

          <View style={styles.availability}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.brand.forest} />
            <Text style={styles.availabilityText}>
              <Text style={{ fontWeight: "700" }}>{bike.available} disponibles</Text> en saison
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={() => router.push("/booking/new")}
          style={({ pressed }) => [styles.bookBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.bookText}>Réserver ce vélo</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.text.inverse} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Feature({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={16} color={Colors.brand.orange} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  backBtn: { position: "absolute", top: 50, left: 16, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.95)", alignItems: "center", justifyContent: "center" },
  hero: { height: 300, alignItems: "center", justifyContent: "center" },
  heroEmoji: { fontSize: 140 },
  body: { padding: Spacing.lg },
  brandBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.pill, backgroundColor: Colors.bg.elevated },
  brandText: { ...Type.label, color: Colors.brand.orange, fontSize: 11 },
  name: { ...Type.display1, color: Colors.text.primary, fontSize: 32, marginTop: Spacing.md },
  tag: { ...Type.body, color: Colors.text.secondary, fontStyle: "italic", marginTop: 4 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: Spacing.lg, paddingVertical: Spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border.subtle },
  priceFrom: { ...Type.bodySm, color: Colors.text.muted },
  price: { ...Type.display1, color: Colors.brand.orange, fontSize: 36 },
  priceUnit: { ...Type.bodySm, color: Colors.text.muted },
  section: { marginTop: Spacing.xl },
  sectionTitle: { ...Type.display4, color: Colors.text.primary, marginBottom: Spacing.md },
  sizes: { flexDirection: "row", gap: 8 },
  sizeChip: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.bg.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border.base },
  sizeText: { ...Type.display4, color: Colors.text.primary, fontSize: 16 },
  feature: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(225,90,35,0.1)", alignItems: "center", justifyContent: "center" },
  featureText: { ...Type.body, color: Colors.text.secondary },
  availability: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: Spacing.xl, padding: Spacing.md, backgroundColor: "rgba(13,79,61,0.08)", borderRadius: Radius.md },
  availabilityText: { ...Type.bodySm, color: Colors.brand.forest },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: Spacing.lg, backgroundColor: Colors.bg.card, borderTopWidth: 1, borderTopColor: Colors.border.subtle },
  bookBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: Colors.brand.orange, paddingVertical: 18, borderRadius: Radius.pill },
  bookText: { ...Type.body, color: Colors.text.inverse, fontWeight: "700", fontSize: 17 },
});

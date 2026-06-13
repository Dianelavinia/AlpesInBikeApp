import { View, Text, Pressable, ImageBackground, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { t } from "@/lib/i18n";

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1674651530623-bf21d2e8fd42?w=1200&q=85" }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(13,79,61,0.4)", "rgba(13,79,61,0.95)", Colors.brand.forestDark]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Text style={styles.brand}>Alpes in Bike</Text>
        </View>

        <View style={styles.hero}>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Saison 2026</Text>
          </View>
          <Text style={styles.title}>{t("auth.welcomeTitle")}</Text>
          <Text style={styles.subtitle}>{t("auth.welcomeSubtitle")}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push("/(tabs)/home")}
            style={({ pressed }) => [styles.primary, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.primaryText}>{t("auth.signIn")}</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(tabs)/home")}
            style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.secondaryText}>{t("auth.signUp")}</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/(tabs)/home")} style={styles.guest}>
            <Text style={styles.guestText}>Continuer sans compte</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.brand.forestDark },
  safe: { flex: 1, paddingHorizontal: Spacing.lg, justifyContent: "space-between" },
  header: { paddingTop: Spacing.md },
  brand: { ...Type.display4, color: Colors.text.inverse, letterSpacing: 0.5 },
  hero: { flex: 1, justifyContent: "center" },
  badge: {
    flexDirection: "row", alignItems: "center", alignSelf: "flex-start",
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.pill, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.1)", marginBottom: Spacing.md, gap: 8,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.brand.orange },
  badgeText: { ...Type.label, color: Colors.text.inverse, fontSize: 11 },
  title: { ...Type.display1, color: Colors.text.inverse, marginBottom: Spacing.md },
  subtitle: { ...Type.body, color: "rgba(255,255,255,0.8)", fontSize: 17, lineHeight: 26 },
  actions: { gap: Spacing.sm, paddingBottom: Spacing.lg },
  primary: {
    backgroundColor: Colors.brand.orange, paddingVertical: 18, borderRadius: Radius.pill,
    alignItems: "center", shadowColor: Colors.brand.orange, shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
  },
  primaryText: { ...Type.body, color: Colors.text.inverse, fontWeight: "600", fontSize: 17 },
  secondary: {
    backgroundColor: "rgba(255,255,255,0.1)", paddingVertical: 18, borderRadius: Radius.pill,
    alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)",
  },
  secondaryText: { ...Type.body, color: Colors.text.inverse, fontWeight: "600", fontSize: 17 },
  guest: { paddingVertical: Spacing.md, alignItems: "center" },
  guestText: { ...Type.bodySm, color: "rgba(255,255,255,0.6)", textDecorationLine: "underline" },
});

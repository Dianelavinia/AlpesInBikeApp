import { View, Text, Pressable, ImageBackground, StyleSheet, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { t } from "@/lib/i18n";
import { signInWithApple, signInWithGoogle } from "@/lib/auth";

export default function Welcome() {
  const router = useRouter();
  const [busy, setBusy] = useState<"apple" | "google" | null>(null);

  async function onApple() {
    setBusy("apple");
    const r = await signInWithApple();
    setBusy(null);
    if (r.ok) router.replace("/(tabs)/home");
  }

  async function onGoogle() {
    setBusy("google");
    const r = await signInWithGoogle();
    setBusy(null);
    if (r.ok) router.replace("/(tabs)/home");
  }

  const showApple = Platform.OS === "ios" || Platform.OS === "web";

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

          <View style={styles.perks}>
            <Perk icon="bicycle-outline" text="Suivi GPS de vos rides" />
            <Perk icon="trophy-outline" text="Classement, badges, défis" />
            <Perk icon="leaf-outline" text="Bilan carbone et impact" />
          </View>
        </View>

        <View style={styles.actions}>
          <Text style={styles.actionsLabel}>Créer un compte ou se connecter</Text>

          {showApple && (
            <Pressable
              onPress={onApple}
              disabled={busy !== null}
              style={({ pressed }) => [styles.apple, pressed && { opacity: 0.85 }]}
            >
              {busy === "apple" ? (
                <ActivityIndicator size="small" color={Colors.text.inverse} />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={20} color={Colors.text.inverse} />
                  <Text style={styles.appleText}>Continuer avec Apple</Text>
                </>
              )}
            </Pressable>
          )}

          <Pressable
            onPress={onGoogle}
            disabled={busy !== null}
            style={({ pressed }) => [styles.google, pressed && { opacity: 0.9 }]}
          >
            {busy === "google" ? (
              <ActivityIndicator size="small" color={Colors.text.primary} />
            ) : (
              <>
                <GoogleG />
                <Text style={styles.googleText}>Continuer avec Google</Text>
              </>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.push("/(auth)/email" as any)}
            style={({ pressed }) => [styles.email, pressed && { opacity: 0.9 }]}
          >
            <Ionicons name="mail-outline" size={18} color={Colors.text.inverse} />
            <Text style={styles.emailText}>Continuer par email</Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable onPress={() => router.replace("/booking/new")} style={styles.guest}>
            <Ionicons name="bag-handle-outline" size={16} color="rgba(255,255,255,0.85)" />
            <Text style={styles.guestText}>Réserver sans créer de compte</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Perk({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.perk}>
      <View style={styles.perkIcon}>
        <Ionicons name={icon} size={14} color={Colors.brand.orangeLight} />
      </View>
      <Text style={styles.perkText}>{text}</Text>
    </View>
  );
}

/** Logo G Google en SVG inline pour eviter l import natif. */
function GoogleG() {
  return (
    <View style={styles.gWrap}>
      <Text style={styles.gLetter}>G</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.brand.forestDark },
  safe: { flex: 1, paddingHorizontal: Spacing.lg, justifyContent: "space-between" },
  header: { paddingTop: Spacing.md },
  brand: { ...Type.display4, color: Colors.text.inverse, letterSpacing: 0.5 },
  hero: { flex: 1, justifyContent: "center", gap: Spacing.md },
  badge: {
    flexDirection: "row", alignItems: "center", alignSelf: "flex-start",
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.pill, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.1)", gap: 8,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.brand.orange },
  badgeText: { ...Type.label, color: Colors.text.inverse, fontSize: 11 },
  title: { ...Type.display1, color: Colors.text.inverse, fontSize: 36, lineHeight: 42 },
  subtitle: { ...Type.body, color: "rgba(255,255,255,0.85)", fontSize: 17, lineHeight: 26 },

  perks: { gap: 8, marginTop: Spacing.sm },
  perk: { flexDirection: "row", alignItems: "center", gap: 8 },
  perkIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  perkText: { ...Type.bodySm, color: "rgba(255,255,255,0.85)", fontSize: 13.5 },

  actions: { gap: Spacing.sm, paddingBottom: Spacing.md },
  actionsLabel: { ...Type.label, color: "rgba(255,255,255,0.65)", textAlign: "center", marginBottom: Spacing.sm, fontSize: 11 },

  apple: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#0A0A0A", paddingVertical: 15, borderRadius: Radius.pill, minHeight: 52 },
  appleText: { ...Type.body, color: Colors.text.inverse, fontWeight: "600", fontSize: 16 },

  google: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: Colors.text.inverse, paddingVertical: 15, borderRadius: Radius.pill, minHeight: 52 },
  googleText: { ...Type.body, color: Colors.text.primary, fontWeight: "600", fontSize: 16 },

  email: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.12)", paddingVertical: 14, borderRadius: Radius.pill, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  emailText: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "600", fontSize: 14 },

  divider: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.2)" },
  dividerText: { ...Type.bodyXs, color: "rgba(255,255,255,0.6)", fontSize: 11 },

  guest: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12 },
  guestText: { ...Type.bodySm, color: "rgba(255,255,255,0.85)", textDecorationLine: "underline", fontSize: 14 },

  gWrap: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  gLetter: { fontSize: 14, fontWeight: "700", color: "#4285F4", lineHeight: 18, includeFontPadding: false, fontFamily: Platform.OS === "web" ? "Arial, sans-serif" : undefined },
});

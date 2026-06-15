import { View, Text, Pressable, StyleSheet, ScrollView, ImageBackground, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as SecureStore from "expo-secure-store";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { requestPermissions } from "@/lib/ride-tracker";

/**
 * Onboarding au premier lancement.
 * 4 etapes : intro, permissions, profil minimum, choix continuer.
 *
 * Stocke un flag onboarding_done dans SecureStore pour ne plus l afficher.
 */

const STEPS = [
  {
    title: "Bienvenue chez Alpes in Bike",
    body: "L'app qui transforme vos rides dans les Alpes en aventures partagées.",
    icon: "bicycle" as const,
    image: "https://images.unsplash.com/photo-1591619759638-36921634f97e?w=1200&q=85",
  },
  {
    title: "Vos rides, votre liberté",
    body: "Enregistrez vos parcours en GPS, suivez vos statistiques en direct, gardez tout dans l'app Santé.",
    icon: "navigate" as const,
    image: "https://images.unsplash.com/photo-1591028889197-3488e003481a?w=1200&q=85",
  },
  {
    title: "Une communauté de confiance",
    body: "Trouvez des copains de route, rejoignez des sorties groupe, restez à l'abri du vol grâce aux profils vérifiés.",
    icon: "people" as const,
    image: "https://images.unsplash.com/photo-1559348349-86f1f65817fe?w=1200&q=85",
  },
  {
    title: "Prêt à partir ?",
    body: "Activez les permissions pour que tout fonctionne. Vous pouvez les modifier à tout moment dans Réglages.",
    icon: "checkmark-circle" as const,
    image: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=1200&q=85",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [perms, setPerms] = useState<{ gps?: boolean; bluetooth?: boolean }>({});

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  async function next() {
    if (isLast) {
      try {
        if (Platform.OS !== "web") {
          await SecureStore.setItemAsync("onboarding_done", "1");
        }
      } catch {
        // ignore
      }
      router.replace("/(auth)/welcome" as any);
    } else {
      setStep((s) => s + 1);
    }
  }

  async function askGps() {
    const r = await requestPermissions();
    setPerms((p) => ({ ...p, gps: r.foreground }));
  }

  async function skip() {
    try {
      if (Platform.OS !== "web") {
        await SecureStore.setItemAsync("onboarding_done", "1");
      }
    } catch {
      // ignore
    }
    router.replace("/(auth)/welcome" as any);
  }

  return (
    <View style={styles.container}>
      <ImageBackground source={{ uri: current.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient colors={["rgba(13,79,61,0.45)", "rgba(13,79,61,0.95)", Colors.brand.forestDark]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.headerBar}>
          <View style={styles.progress}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
            ))}
          </View>
          <Pressable onPress={skip}>
            <Text style={styles.skip}>Passer</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.iconCircle}>
            <Ionicons name={current.icon} size={36} color={Colors.brand.orangeLight} />
          </View>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.body}>{current.body}</Text>

          {step === 3 && (
            <View style={styles.permsList}>
              <PermRow
                icon="location"
                label="Localisation"
                desc="Pour enregistrer le tracé GPS et trouver les copains"
                granted={perms.gps}
                onAsk={askGps}
              />
              <PermInfo
                icon="watch"
                label="Apple Santé ou Google Fit"
                desc="Activable depuis Réglages > Appareils et synchros"
              />
              <PermInfo
                icon="bluetooth"
                label="Bluetooth"
                desc="Demandé à la première connexion d'un capteur"
              />
              <PermInfo
                icon="notifications"
                label="Notifications"
                desc="Demandé après votre premier ride"
              />
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={next} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}>
            <Text style={styles.ctaText}>{isLast ? "Commencer" : "Suivant"}</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.text.inverse} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function PermRow({ icon, label, desc, granted, onAsk }: { icon: any; label: string; desc: string; granted?: boolean; onAsk: () => void }) {
  return (
    <View style={styles.permRow}>
      <View style={styles.permIcon}>
        <Ionicons name={icon} size={18} color={Colors.brand.orangeLight} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.permLabel}>{label}</Text>
        <Text style={styles.permDesc}>{desc}</Text>
      </View>
      <Pressable onPress={onAsk} disabled={granted} style={[styles.permBtn, granted && styles.permBtnDone]}>
        {granted ? (
          <Ionicons name="checkmark" size={16} color={Colors.text.inverse} />
        ) : (
          <Text style={styles.permBtnText}>Activer</Text>
        )}
      </Pressable>
    </View>
  );
}

function PermInfo({ icon, label, desc }: { icon: any; label: string; desc: string }) {
  return (
    <View style={styles.permRow}>
      <View style={styles.permIcon}>
        <Ionicons name={icon} size={18} color="rgba(255,255,255,0.6)" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.permLabel}>{label}</Text>
        <Text style={styles.permDesc}>{desc}</Text>
      </View>
      <Text style={styles.permLater}>Plus tard</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.brand.forestDark },
  safe: { flex: 1, paddingHorizontal: Spacing.lg },

  headerBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  progress: { flexDirection: "row", gap: 6 },
  dot: { width: 22, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.25)" },
  dotActive: { backgroundColor: Colors.brand.orange },
  skip: { ...Type.bodySm, color: "rgba(255,255,255,0.75)", fontWeight: "600", textDecorationLine: "underline" },

  content: { flexGrow: 1, justifyContent: "center", gap: Spacing.md, paddingVertical: Spacing.xl },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center", alignSelf: "flex-start" },
  title: { ...Type.display1, color: Colors.text.inverse, fontSize: 36, lineHeight: 42, marginTop: Spacing.md },
  body: { ...Type.body, color: "rgba(255,255,255,0.88)", fontSize: 17, lineHeight: 26 },

  permsList: { gap: 10, marginTop: Spacing.lg },
  permRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: Radius.md, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  permIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  permLabel: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "700" },
  permDesc: { ...Type.bodyXs, color: "rgba(255,255,255,0.65)", marginTop: 2, lineHeight: 16 },
  permBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.pill, backgroundColor: Colors.brand.orange },
  permBtnDone: { backgroundColor: Colors.brand.forest, paddingHorizontal: 10 },
  permBtnText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700", fontSize: 12 },
  permLater: { ...Type.bodyXs, color: "rgba(255,255,255,0.5)", fontWeight: "600" },

  footer: { paddingTop: Spacing.md, paddingBottom: Spacing.md },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 17, borderRadius: Radius.pill, backgroundColor: Colors.brand.orange },
  ctaText: { ...Type.body, color: Colors.text.inverse, fontWeight: "700", fontSize: 17 },
});

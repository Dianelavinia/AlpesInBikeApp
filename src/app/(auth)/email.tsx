import { View, Text, Pressable, StyleSheet, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { signInWithMagicLink } from "@/lib/auth";

/**
 * Connexion par lien magique : l utilisateur entre son email,
 * on lui envoie un lien Supabase qui le connecte automatiquement.
 * Pas de mot de passe a retenir.
 */

export default function EmailAuth() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function onSend() {
    if (!isValid) return;
    setBusy(true);
    setError(null);
    const r = await signInWithMagicLink(email.trim());
    setBusy(false);
    if (r.ok) {
      setSent(true);
    } else {
      setError(r.error);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
          </Pressable>
          <Text style={styles.title}>Continuer par email</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.body}>
          {sent ? (
            <View style={styles.successBox}>
              <View style={styles.successIcon}>
                <Ionicons name="mail-open-outline" size={36} color={Colors.brand.forest} />
              </View>
              <Text style={styles.successTitle}>Vérifiez vos emails</Text>
              <Text style={styles.successDesc}>
                On vous a envoyé un lien à {email}. Cliquez dessus, vous serez connecté automatiquement.
              </Text>
              <Pressable onPress={() => setSent(false)} style={styles.linkBtn}>
                <Text style={styles.linkText}>Utiliser une autre adresse</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.heading}>Votre adresse email</Text>
              <Text style={styles.desc}>
                On vous envoie un lien magique : pas de mot de passe à retenir, vous cliquez et vous êtes connecté.
              </Text>

              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={Colors.text.muted} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="vous@exemple.fr"
                  placeholderTextColor={Colors.text.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  keyboardType="email-address"
                  style={styles.input}
                />
                {isValid && (
                  <Ionicons name="checkmark-circle" size={18} color={Colors.brand.forest} />
                )}
              </View>

              {error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={14} color={Colors.status.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Pressable
                onPress={onSend}
                disabled={!isValid || busy}
                style={({ pressed }) => [
                  styles.cta,
                  (!isValid || busy) && { opacity: 0.5 },
                  pressed && { opacity: 0.85 },
                ]}
              >
                {busy ? (
                  <ActivityIndicator size="small" color={Colors.text.inverse} />
                ) : (
                  <>
                    <Text style={styles.ctaText}>Recevoir le lien magique</Text>
                    <Ionicons name="arrow-forward" size={16} color={Colors.text.inverse} />
                  </>
                )}
              </Pressable>

              <View style={styles.legalBox}>
                <Ionicons name="shield-checkmark-outline" size={14} color={Colors.text.muted} />
                <Text style={styles.legalText}>
                  En continuant vous acceptez nos conditions d utilisation et notre politique de confidentialité.
                </Text>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18 },
  body: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: Spacing.md },

  heading: { ...Type.display2, color: Colors.text.primary, fontSize: 26 },
  desc: { ...Type.body, color: Colors.text.muted, fontSize: 15, lineHeight: 22 },

  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, height: 54, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.base, marginTop: Spacing.sm },
  input: { flex: 1, ...Type.body, color: Colors.text.primary, fontSize: 16, outlineWidth: 0 as any },

  errorBox: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 6 },
  errorText: { ...Type.bodyXs, color: Colors.status.error, flex: 1 },

  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: Radius.pill, backgroundColor: Colors.brand.orange, marginTop: Spacing.sm, minHeight: 54 },
  ctaText: { ...Type.body, color: Colors.text.inverse, fontWeight: "700", fontSize: 16 },

  legalBox: { flexDirection: "row", gap: 8, padding: Spacing.md, backgroundColor: Colors.bg.elevated, borderRadius: Radius.sm, marginTop: Spacing.md },
  legalText: { flex: 1, ...Type.bodyXs, color: Colors.text.muted, lineHeight: 17 },

  successBox: { alignItems: "center", padding: Spacing.lg, gap: Spacing.md, marginTop: Spacing.xl },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(13,79,61,0.12)", alignItems: "center", justifyContent: "center" },
  successTitle: { ...Type.display3, color: Colors.text.primary, fontSize: 22, textAlign: "center" },
  successDesc: { ...Type.body, color: Colors.text.muted, textAlign: "center", lineHeight: 22, paddingHorizontal: Spacing.md },
  linkBtn: { paddingVertical: 10, paddingHorizontal: 14 },
  linkText: { ...Type.bodySm, color: Colors.brand.orange, fontWeight: "700", textDecorationLine: "underline" },
});

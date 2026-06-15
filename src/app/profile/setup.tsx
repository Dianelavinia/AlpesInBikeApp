import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Image, Platform, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { avatarColorFor } from "@/lib/buddies";
import { useAuth } from "@/lib/auth-context";

/**
 * Setup du profil au premier login : choisir un pseudo et eventuellement
 * une photo. Le pseudo doit etre unique (verifie cote serveur via RPC
 * check_pseudo_available) et respecter les regles : 3 a 20 caracteres,
 * lettres chiffres tiret bas, pas d espace.
 */

const PSEUDO_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;

const AGE_BRACKETS = [
  { id: "u25", label: "Moins de 25 ans" },
  { id: "25_34", label: "25 à 34 ans" },
  { id: "35_44", label: "35 à 44 ans" },
  { id: "45_54", label: "45 à 54 ans" },
  { id: "55p", label: "55 ans et plus" },
] as const;

const SEXES = [
  { id: "F", label: "Femme" },
  { id: "H", label: "Homme" },
  { id: "X", label: "Non précisé" },
] as const;

export default function ProfileSetup() {
  const router = useRouter();
  const { user, setPseudoLocal } = useAuth();
  const [step, setStep] = useState(0);
  const [pseudo, setPseudo] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [sex, setSex] = useState<"F" | "H" | "X" | null>(null);
  const [ageBracket, setAgeBracket] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [pseudoError, setPseudoError] = useState<string | null>(null);

  const isPseudoValid = PSEUDO_REGEX.test(pseudo);
  const avatarColor = pseudo ? avatarColorFor(pseudo) : Colors.brand.orange;
  const avatarInitial = pseudo.slice(0, 2).toUpperCase() || "??";

  async function pickPhoto() {
    if (Platform.OS === "web") {
      Alert.alert("Mode démo", "Sur device, la photothèque s'ouvre via expo-image-picker.");
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) setPhoto(result.assets[0].uri);
  }

  async function checkPseudo() {
    setChecking(true);
    setPseudoError(null);
    // En prod : await supabase.rpc("check_pseudo_available", { p_pseudo: pseudo })
    await new Promise((r) => setTimeout(r, 600));
    const taken = ["admin", "alpes", "alpesinbike", "marie"];
    if (taken.includes(pseudo.toLowerCase())) {
      setPseudoError("Ce pseudo est déjà pris. Essayez une variation.");
      setChecking(false);
      return false;
    }
    setChecking(false);
    return true;
  }

  async function nextStep() {
    if (step === 0) {
      if (!isPseudoValid) {
        setPseudoError("3 à 20 caractères, lettres, chiffres, tirets et underscores.");
        return;
      }
      const ok = await checkPseudo();
      if (!ok) return;
    }
    if (step < 3) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  }

  async function finish() {
    // En prod : await supabase.auth.updateUser({ data: { display_name: pseudo, pseudo_set: true, sex, age_bracket: ageBracket, avatar_url: photo } })
    setPseudoLocal(pseudo);
    router.replace("/(tabs)/home" as any);
  }

  const canContinue =
    step === 0 ? isPseudoValid && !checking :
    step === 1 ? true :
    step === 2 ? sex !== null :
    ageBracket !== null;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        {step > 0 ? (
          <Pressable onPress={() => setStep((s) => s - 1)} style={styles.headBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
          </Pressable>
        ) : <View style={{ width: 40 }} />}
        <View style={styles.progress}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
          ))}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.avatarBig}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.avatarPhoto} />
          ) : (
            <View style={[styles.avatarColor, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarBigText}>{avatarInitial}</Text>
            </View>
          )}
          <Pressable onPress={pickPhoto} style={styles.photoBtn}>
            <Ionicons name="camera" size={14} color={Colors.text.inverse} />
          </Pressable>
        </View>

        {step === 0 && (
          <View style={styles.section}>
            <Text style={styles.title}>Choisissez votre pseudo</Text>
            <Text style={styles.body}>
              C'est le nom que verront les autres rideurs. Pas votre vrai nom. Vous pourrez le changer une fois par mois.
            </Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputPrefix}>@</Text>
              <TextInput
                value={pseudo}
                onChangeText={(t) => { setPseudo(t.replace(/\s/g, "")); setPseudoError(null); }}
                placeholder="aurore_velo"
                placeholderTextColor={Colors.text.muted}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                maxLength={20}
              />
              {isPseudoValid && !checking && !pseudoError && (
                <Ionicons name="checkmark-circle" size={18} color={Colors.brand.forest} />
              )}
              {checking && <ActivityIndicator size="small" color={Colors.brand.orange} />}
            </View>
            {pseudoError && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={14} color={Colors.status.error} />
                <Text style={styles.errorText}>{pseudoError}</Text>
              </View>
            )}
            <View style={styles.rulesBox}>
              <Rule ok={pseudo.length >= 3 && pseudo.length <= 20} text="3 à 20 caractères" />
              <Rule ok={/^[a-zA-Z0-9_-]*$/.test(pseudo) && pseudo.length > 0} text="Lettres, chiffres, _ et - uniquement" />
              <Rule ok={!/\s/.test(pseudo)} text="Pas d'espace" />
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={styles.section}>
            <Text style={styles.title}>Une photo, c'est encore mieux</Text>
            <Text style={styles.body}>
              Optionnel. Aide les autres rideurs à vous reconnaître. Vous pouvez sauter et garder votre avatar coloré.
            </Text>
            <Pressable onPress={pickPhoto} style={styles.uploadBtn}>
              <Ionicons name="image-outline" size={20} color={Colors.brand.orange} />
              <Text style={styles.uploadText}>{photo ? "Changer ma photo" : "Choisir une photo"}</Text>
            </Pressable>
            <Pressable onPress={() => setPhoto(null)} disabled={!photo} style={[styles.uploadBtn, !photo && { opacity: 0.4 }]}>
              <Ionicons name="trash-outline" size={18} color={Colors.text.muted} />
              <Text style={[styles.uploadText, { color: Colors.text.muted }]}>Retirer ma photo</Text>
            </Pressable>
          </View>
        )}

        {step === 2 && (
          <View style={styles.section}>
            <Text style={styles.title}>Vous êtes</Text>
            <Text style={styles.body}>
              Aide à faire le matching et les statistiques anonymisees. Vous pouvez choisir « Non précisé ».
            </Text>
            <View style={styles.optionsList}>
              {SEXES.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => setSex(s.id as any)}
                  style={[styles.option, sex === s.id && styles.optionActive]}
                >
                  <View style={[styles.radio, sex === s.id && styles.radioActive]}>
                    {sex === s.id && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[styles.optionLabel, sex === s.id && styles.optionLabelActive]}>{s.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.section}>
            <Text style={styles.title}>Votre tranche d'âge</Text>
            <Text style={styles.body}>
              Aide à trouver des rideurs proches de vous. Votre âge exact n'est jamais affiché publiquement.
            </Text>
            <View style={styles.optionsList}>
              {AGE_BRACKETS.map((a) => (
                <Pressable
                  key={a.id}
                  onPress={() => setAgeBracket(a.id)}
                  style={[styles.option, ageBracket === a.id && styles.optionActive]}
                >
                  <View style={[styles.radio, ageBracket === a.id && styles.radioActive]}>
                    {ageBracket === a.id && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[styles.optionLabel, ageBracket === a.id && styles.optionLabelActive]}>{a.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={nextStep}
          disabled={!canContinue}
          style={({ pressed }) => [styles.cta, !canContinue && { opacity: 0.5 }, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.ctaText}>{step === 3 ? "Terminer" : step === 1 ? (photo ? "Suivant" : "Passer cette étape") : "Suivant"}</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.text.inverse} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Rule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <View style={styles.rule}>
      <Ionicons name={ok ? "checkmark-circle" : "ellipse-outline"} size={14} color={ok ? Colors.brand.forest : Colors.text.muted} />
      <Text style={[styles.ruleText, ok && { color: Colors.text.primary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  progress: { flexDirection: "row", gap: 6 },
  dot: { width: 22, height: 4, borderRadius: 2, backgroundColor: Colors.border.base },
  dotActive: { backgroundColor: Colors.brand.orange },

  avatarBig: { alignSelf: "center", marginTop: Spacing.lg, position: "relative" },
  avatarPhoto: { width: 110, height: 110, borderRadius: 55 },
  avatarColor: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center" },
  avatarBigText: { ...Type.display1, color: Colors.text.inverse, fontSize: 40 },
  photoBtn: { position: "absolute", bottom: 0, right: 0, width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.brand.orange, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: Colors.bg.base },

  section: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, gap: 12 },
  title: { ...Type.display2, color: Colors.text.primary, fontSize: 26 },
  body: { ...Type.body, color: Colors.text.muted, lineHeight: 22, fontSize: 15 },

  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, height: 54, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.base, marginTop: 6 },
  inputPrefix: { ...Type.body, color: Colors.text.muted, fontSize: 18, fontWeight: "700" },
  input: { flex: 1, ...Type.body, color: Colors.text.primary, fontSize: 17, outlineWidth: 0 as any },

  errorBox: { flexDirection: "row", alignItems: "center", gap: 6 },
  errorText: { ...Type.bodyXs, color: Colors.status.error, flex: 1 },

  rulesBox: { gap: 6, marginTop: 4 },
  rule: { flexDirection: "row", alignItems: "center", gap: 8 },
  ruleText: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 12 },

  uploadBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: Radius.pill, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.brand.orange, marginTop: 8 },
  uploadText: { ...Type.body, color: Colors.brand.orange, fontWeight: "700", fontSize: 15 },

  optionsList: { gap: 8, marginTop: 8 },
  option: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: Radius.md, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle },
  optionActive: { borderColor: Colors.brand.orange, backgroundColor: "rgba(225,90,35,0.06)" },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border.base, alignItems: "center", justifyContent: "center" },
  radioActive: { borderColor: Colors.brand.orange },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.brand.orange },
  optionLabel: { ...Type.body, color: Colors.text.primary, fontSize: 15 },
  optionLabelActive: { fontWeight: "700" },

  footer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, paddingTop: Spacing.sm },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: Radius.pill, backgroundColor: Colors.brand.orange },
  ctaText: { ...Type.body, color: Colors.text.inverse, fontWeight: "700", fontSize: 16 },
});

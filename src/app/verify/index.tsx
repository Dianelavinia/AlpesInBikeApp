import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { useMyTrust, TRUST_META, meetsLevel, type TrustLevel } from "@/lib/trust";

/**
 * Hub de verification d identite.
 * 4 etapes progressives, chacune debloque des actions :
 *   1. Email     - rejoindre une sortie
 *   2. Telephone - inviter en direct, envoyer messages
 *   3. Identite  - organiser une sortie groupe
 *   4. Ambassadeur (auto apres 10 sorties propres)
 */

const STEPS: { level: TrustLevel; cta: string; unlocks: string[]; time: string }[] = [
  {
    level: "email",
    cta: "Confirmer mon email",
    unlocks: ["Rejoindre des sorties groupe", "Liker et commenter", "Apparaitre dans la liste rideurs"],
    time: "30 secondes",
  },
  {
    level: "phone",
    cta: "Vérifier mon téléphone",
    unlocks: ["Inviter un copain en direct", "Recevoir des invitations privées", "Envoyer des messages"],
    time: "2 minutes",
  },
  {
    level: "identity",
    cta: "Vérifier mon identité",
    unlocks: ["Organiser des sorties groupe", "Badge identité visible", "Sécurité maximale pour les autres rideurs"],
    time: "5 minutes",
  },
];

export default function Verify() {
  const router = useRouter();
  const { trust } = useMyTrust();
  const currentMeta = TRUST_META[trust.level];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Ma vérification</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.heroCard}>
          <LinearGradient colors={[currentMeta.tint, `${currentMeta.tint}CC`]} style={StyleSheet.absoluteFill} />
          <View style={styles.heroIcon}>
            <Ionicons name={currentMeta.icon as any} size={28} color={Colors.text.inverse} />
          </View>
          <Text style={styles.heroLabel}>Votre niveau actuel</Text>
          <Text style={styles.heroLevel}>{currentMeta.label}</Text>
          <Text style={styles.heroDesc}>{currentMeta.description}</Text>
        </View>

        <View style={styles.whyCard}>
          <View style={styles.whyHead}>
            <View style={styles.whyIcon}>
              <Ionicons name="shield-checkmark" size={18} color={Colors.brand.forest} />
            </View>
            <Text style={styles.whyTitle}>Pourquoi se vérifier ?</Text>
          </View>
          <Text style={styles.whyBody}>
            On ne demande pas de vérification pour vous embêter. C'est essentiel pour la sécurité :
          </Text>
          <View style={styles.whyList}>
            <WhyItem icon="people-outline" text="Les rendez-vous de sortie groupe attirent malheureusement des voleurs qui repèrent les beaux vélos. Une identité vérifiée chez l'organisateur change tout." />
            <WhyItem icon="ban-outline" text="Les faux profils sont automatiquement bloqués s'ils essaient d'inviter sans téléphone vérifié." />
            <WhyItem icon="warning-outline" text="En cas de problème (vol, accident, no-show suspect), la police peut remonter à un profil identifié." />
            <WhyItem icon="lock-closed-outline" text="Vos données sont chiffrées et conformes RGPD. Stripe Identity gère la pièce d'identité, pas Alpes in Bike." />
          </View>
        </View>

        <Text style={styles.stepsLabel}>Étapes</Text>
        {STEPS.map((step, i) => {
          const stepMeta = TRUST_META[step.level];
          const completed = meetsLevel(trust.level, step.level);
          return (
            <View key={step.level} style={[styles.stepCard, completed && { borderColor: stepMeta.tint, backgroundColor: stepMeta.bg }]}>
              <View style={styles.stepHead}>
                <View style={[styles.stepNum, { backgroundColor: completed ? stepMeta.tint : Colors.bg.elevated }]}>
                  {completed ? (
                    <Ionicons name="checkmark" size={16} color={Colors.text.inverse} />
                  ) : (
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{stepMeta.label}</Text>
                  <Text style={styles.stepTime}>{step.time}</Text>
                </View>
                {completed && (
                  <View style={[styles.completedBadge, { backgroundColor: stepMeta.tint }]}>
                    <Text style={styles.completedText}>Fait</Text>
                  </View>
                )}
              </View>

              <View style={styles.unlocksList}>
                {step.unlocks.map((u, j) => (
                  <View key={j} style={styles.unlock}>
                    <Ionicons
                      name={completed ? "checkmark-circle" : "lock-closed-outline"}
                      size={13}
                      color={completed ? stepMeta.tint : Colors.text.muted}
                    />
                    <Text style={[styles.unlockText, completed && { color: Colors.text.primary }]}>{u}</Text>
                  </View>
                ))}
              </View>

              {!completed && (
                <Pressable
                  onPress={() => router.push(`/verify/${step.level}` as any)}
                  style={({ pressed }) => [styles.stepCta, { backgroundColor: stepMeta.tint }, pressed && { opacity: 0.85 }]}
                >
                  <Text style={styles.stepCtaText}>{step.cta}</Text>
                  <Ionicons name="arrow-forward" size={15} color={Colors.text.inverse} />
                </Pressable>
              )}
            </View>
          );
        })}

        <View style={styles.ambassadorCard}>
          <View style={styles.ambHead}>
            <View style={styles.ambIcon}>
              <Ionicons name="ribbon" size={20} color="#7C3AED" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ambTitle}>Devenir Ambassadeur</Text>
              <Text style={styles.ambDesc}>10 sorties groupe terminées sans incident et identité vérifiée. Badge premium, score de match boosté, contact prioritaire SAV.</Text>
            </View>
          </View>
          <View style={styles.ambProgressRow}>
            <View style={styles.ambBar}>
              <View style={[styles.ambFill, { width: `${Math.min(100, (trust.ridesCompleted / 10) * 100)}%` }]} />
            </View>
            <Text style={styles.ambProgressText}>{trust.ridesCompleted}/10</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function WhyItem({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.whyItem}>
      <Ionicons name={icon} size={14} color={Colors.brand.forest} />
      <Text style={styles.whyItemText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18 },

  heroCard: { marginHorizontal: Spacing.lg, padding: Spacing.lg, borderRadius: Radius.lg, overflow: "hidden", alignItems: "center", gap: 6 },
  heroIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  heroLabel: { ...Type.label, color: "rgba(255,255,255,0.85)", fontSize: 10.5, marginTop: 4 },
  heroLevel: { ...Type.display2, color: Colors.text.inverse, fontSize: 24, textAlign: "center" },
  heroDesc: { ...Type.bodySm, color: "rgba(255,255,255,0.9)", textAlign: "center", lineHeight: 19, marginTop: 2 },

  whyCard: { marginHorizontal: Spacing.lg, marginTop: Spacing.lg, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle, gap: Spacing.sm },
  whyHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  whyIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(13,79,61,0.12)", alignItems: "center", justifyContent: "center" },
  whyTitle: { ...Type.display4, color: Colors.text.primary, fontSize: 16 },
  whyBody: { ...Type.bodySm, color: Colors.text.secondary, lineHeight: 19 },
  whyList: { gap: 8, marginTop: 4 },
  whyItem: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  whyItemText: { flex: 1, ...Type.bodyXs, color: Colors.text.secondary, lineHeight: 17 },

  stepsLabel: { ...Type.label, color: Colors.text.muted, marginHorizontal: Spacing.lg, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  stepCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle, gap: Spacing.sm },
  stepHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepNum: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  stepNumText: { ...Type.bodySm, color: Colors.text.muted, fontWeight: "700" },
  stepTitle: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 15 },
  stepTime: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 1 },
  completedBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: Radius.pill },
  completedText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700", fontSize: 10 },

  unlocksList: { gap: 6, paddingLeft: 4 },
  unlock: { flexDirection: "row", alignItems: "center", gap: 7 },
  unlockText: { flex: 1, ...Type.bodyXs, color: Colors.text.muted, fontSize: 12 },

  stepCta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: Radius.pill, marginTop: 4 },
  stepCtaText: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "700", fontSize: 13.5 },

  ambassadorCard: { marginHorizontal: Spacing.lg, marginTop: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: "rgba(124,58,237,0.06)", borderWidth: 1, borderColor: "rgba(124,58,237,0.25)", gap: Spacing.sm },
  ambHead: { flexDirection: "row", gap: 12 },
  ambIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(124,58,237,0.18)", alignItems: "center", justifyContent: "center" },
  ambTitle: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700" },
  ambDesc: { ...Type.bodyXs, color: Colors.text.secondary, marginTop: 2, lineHeight: 16 },
  ambProgressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  ambBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: "rgba(124,58,237,0.18)", overflow: "hidden" },
  ambFill: { height: "100%", backgroundColor: "#7C3AED" },
  ambProgressText: { ...Type.bodyXs, color: "#7C3AED", fontWeight: "700", fontSize: 11 },
});

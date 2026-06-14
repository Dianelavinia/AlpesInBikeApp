import { View, Text, Pressable, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { ACTION_REQUIREMENTS, TRUST_META, type GatedAction, type TrustLevel } from "@/lib/trust";

/**
 * Bottom sheet qui s affiche quand l utilisateur tente une action
 * pour laquelle il n a pas le niveau de verification requis.
 * Propose 1 clic vers l ecran de verification.
 */

export default function TrustGateSheet({
  visible,
  action,
  currentLevel,
  onClose,
}: {
  visible: boolean;
  action: GatedAction;
  currentLevel: TrustLevel;
  onClose: () => void;
}) {
  const router = useRouter();
  const req = ACTION_REQUIREMENTS[action];
  const requiredMeta = TRUST_META[req.required];
  const currentMeta = TRUST_META[currentLevel];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          <View style={[styles.lockIcon, { backgroundColor: requiredMeta.bg }]}>
            <Ionicons name="lock-closed" size={28} color={requiredMeta.tint} />
          </View>

          <Text style={styles.title}>Une vérification est nécessaire</Text>
          <Text style={styles.body}>{req.reason}</Text>

          <View style={styles.compareRow}>
            <View style={styles.compareCol}>
              <Text style={styles.compareLabel}>Votre niveau</Text>
              <View style={[styles.compareBadge, { backgroundColor: currentMeta.bg }]}>
                <Ionicons name={currentMeta.icon as any} size={14} color={currentMeta.tint} />
                <Text style={[styles.compareText, { color: currentMeta.tint }]}>{currentMeta.label}</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={18} color={Colors.text.muted} />
            <View style={styles.compareCol}>
              <Text style={styles.compareLabel}>Requis</Text>
              <View style={[styles.compareBadge, { backgroundColor: requiredMeta.bg }]}>
                <Ionicons name={requiredMeta.icon as any} size={14} color={requiredMeta.tint} />
                <Text style={[styles.compareText, { color: requiredMeta.tint }]}>{requiredMeta.label}</Text>
              </View>
            </View>
          </View>

          <View style={styles.safetyBox}>
            <Ionicons name="shield-checkmark" size={16} color={Colors.brand.forest} />
            <Text style={styles.safetyText}>
              Cette vérification protège tous les rideurs Alpes in Bike contre les faux profils, le vol de vélo et les usurpations.
            </Text>
          </View>

          <Pressable
            onPress={() => { onClose(); router.push("/verify" as any); }}
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
          >
            <Ionicons name={requiredMeta.icon as any} size={16} color={Colors.text.inverse} />
            <Text style={styles.ctaText}>
              {req.required === "phone" ? "Vérifier mon téléphone (2 min)" :
               req.required === "identity" ? "Vérifier mon identité (5 min)" :
               req.required === "email" ? "Vérifier mon email" :
               "Augmenter mon niveau"}
            </Text>
          </Pressable>

          <Pressable onPress={onClose} style={styles.secondary}>
            <Text style={styles.secondaryText}>Plus tard</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { backgroundColor: Colors.bg.base, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: Spacing.lg, paddingTop: 10, paddingBottom: 32, gap: Spacing.md, alignItems: "center" },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border.base, marginBottom: 6 },
  lockIcon: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 22, textAlign: "center" },
  body: { ...Type.bodySm, color: Colors.text.secondary, textAlign: "center", lineHeight: 20, paddingHorizontal: Spacing.sm },

  compareRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: Spacing.sm, width: "100%" },
  compareCol: { flex: 1, alignItems: "center", gap: 6 },
  compareLabel: { ...Type.label, color: Colors.text.muted, fontSize: 10 },
  compareBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill },
  compareText: { ...Type.bodyXs, fontWeight: "700", fontSize: 11.5 },

  safetyBox: { flexDirection: "row", gap: 8, padding: 12, borderRadius: Radius.sm, backgroundColor: "rgba(13,79,61,0.06)", width: "100%", borderWidth: 1, borderColor: "rgba(13,79,61,0.18)" },
  safetyText: { flex: 1, ...Type.bodyXs, color: Colors.text.secondary, lineHeight: 17 },

  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: Radius.pill, backgroundColor: Colors.brand.orange, width: "100%" },
  ctaText: { ...Type.body, color: Colors.text.inverse, fontWeight: "700", fontSize: 15 },
  secondary: { paddingVertical: 10 },
  secondaryText: { ...Type.bodySm, color: Colors.text.muted, fontWeight: "600" },
});

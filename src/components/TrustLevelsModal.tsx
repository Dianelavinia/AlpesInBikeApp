import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { TRUST_META } from "@/lib/trust";

/**
 * Modal explicatif des niveaux de confiance.
 * S ouvre au tap sur un TrustBadge pour comprendre ce qu il signifie.
 */

export default function TrustLevelsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const levels = ["anonymous", "email", "phone", "identity", "ambassador"] as const;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Les niveaux de confiance</Text>
          <Text style={styles.desc}>
            Plus un rideur est vérifié, plus la communauté peut lui faire confiance pour organiser ou rejoindre des sorties.
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
            {levels.map((lvl) => {
              const m = TRUST_META[lvl];
              return (
                <View key={lvl} style={[styles.row, { borderLeftColor: m.tint }]}>
                  <View style={[styles.icon, { backgroundColor: m.bg }]}>
                    <Ionicons name={m.icon as any} size={20} color={m.tint} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.lvlTitle, { color: m.tint }]}>{m.label}</Text>
                    <Text style={styles.lvlDesc}>{m.description}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <Pressable onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>Compris</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { backgroundColor: Colors.bg.base, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: Spacing.lg, paddingTop: 10, paddingBottom: 32, gap: Spacing.md },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border.base, alignSelf: "center", marginBottom: 4 },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 22, textAlign: "center" },
  desc: { ...Type.bodySm, color: Colors.text.muted, textAlign: "center", lineHeight: 20 },

  row: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 12, paddingHorizontal: 12, borderLeftWidth: 3, marginBottom: 6, backgroundColor: Colors.bg.card, borderRadius: Radius.sm },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  lvlTitle: { ...Type.bodySm, fontWeight: "700", fontSize: 14 },
  lvlDesc: { ...Type.bodyXs, color: Colors.text.secondary, marginTop: 3, lineHeight: 17 },

  close: { paddingVertical: 14, borderRadius: Radius.pill, backgroundColor: Colors.brand.orange, alignItems: "center", marginTop: 4 },
  closeText: { ...Type.body, color: Colors.text.inverse, fontWeight: "700", fontSize: 15 },
});

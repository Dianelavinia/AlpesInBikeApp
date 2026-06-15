import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { LEGAL_DOCS, type LegalDocument } from "@/lib/legal-content";

export default function LegalReader() {
  const router = useRouter();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const document = LEGAL_DOCS.find((d) => d.id === doc) as LegalDocument | undefined;

  if (!document) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Text style={styles.title}>Document introuvable</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>{document.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.heroCard}>
          <Text style={styles.subtitle}>{document.subtitle}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Ionicons name="calendar-outline" size={11} color={Colors.text.muted} />
              <Text style={styles.metaText}>Mise à jour {document.lastUpdated}</Text>
            </View>
            <View style={styles.metaPill}>
              <Ionicons name="document-text-outline" size={11} color={Colors.text.muted} />
              <Text style={styles.metaText}>Version {document.version}</Text>
            </View>
          </View>
        </View>

        {document.sections.map((section, i) => (
          <View key={i} style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionNum}>{String(i + 1).padStart(2, "0")}</Text>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.paragraphs.map((p, j) => (
              <Text key={`p${j}`} style={styles.paragraph}>{p}</Text>
            ))}
            {section.bullets && (
              <View style={styles.bullets}>
                {section.bullets.map((b, k) => (
                  <View key={`b${k}`} style={styles.bullet}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <View style={styles.footerCard}>
          <Ionicons name="mail-outline" size={18} color={Colors.brand.forest} />
          <Text style={styles.footerText}>
            Une question ? Écrivez à {document.id === "privacy" ? "dpo@alpesinbike.fr" : "contact@alpesinbike.fr"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 16, flex: 1, textAlign: "center" },

  heroCard: { marginHorizontal: Spacing.lg, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle, gap: 10 },
  subtitle: { ...Type.bodySm, color: Colors.text.secondary, lineHeight: 20 },
  metaRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  metaPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: Radius.pill, backgroundColor: Colors.bg.elevated },
  metaText: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 10.5 },

  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  sectionNum: { ...Type.label, color: Colors.brand.orange, fontSize: 11, letterSpacing: 1.5 },
  sectionTitle: { ...Type.display4, color: Colors.text.primary, fontSize: 16, flex: 1 },
  paragraph: { ...Type.bodySm, color: Colors.text.secondary, lineHeight: 21, fontSize: 14, marginBottom: 10 },
  bullets: { gap: 8, marginTop: 4 },
  bullet: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  bulletDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.brand.orange, marginTop: 7 },
  bulletText: { flex: 1, ...Type.bodySm, color: Colors.text.secondary, lineHeight: 20, fontSize: 13.5 },

  footerCard: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: Spacing.lg, marginTop: Spacing.xl, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: "rgba(13,79,61,0.06)", borderWidth: 1, borderColor: "rgba(13,79,61,0.18)" },
  footerText: { flex: 1, ...Type.bodyXs, color: Colors.brand.forest, fontWeight: "600" },
});

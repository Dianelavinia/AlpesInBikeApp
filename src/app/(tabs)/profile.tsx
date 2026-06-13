import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { t } from "@/lib/i18n";

export default function Profile() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>MR</Text>
          </View>
          <View>
            <Text style={styles.name}>Marie Roche</Text>
            <Text style={styles.email}>marie.roche@gmail.com</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t("profile.personal")}</Text>
          <View style={styles.group}>
            <Row icon="person-outline" label={t("profile.personal")} />
            <Row icon="card-outline" label={t("profile.payment")} />
            <Row icon="location-outline" label={t("profile.addresses")} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t("profile.preferences")}</Text>
          <View style={styles.group}>
            <Row icon="language-outline" label={t("profile.language")} value="Français" />
            <Row icon="notifications-outline" label={t("profile.notifications")} />
            <Row icon="moon-outline" label={t("profile.darkMode")} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t("profile.support")}</Text>
          <View style={styles.group}>
            <Row icon="chatbubbles-outline" label={t("profile.contact")} />
            <Row icon="help-circle-outline" label={t("profile.faq")} />
            <Row icon="document-text-outline" label={t("profile.legal")} last />
          </View>
        </View>

        <View style={styles.danger}>
          <Pressable style={styles.logout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.brand.orange} />
            <Text style={styles.logoutText}>{t("profile.logOut")}</Text>
          </Pressable>
        </View>

        <Text style={styles.version}>Alpes in Bike · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, label, value, last }: { icon: any; label: string; value?: string; last?: boolean }) {
  return (
    <Pressable style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && { opacity: 0.6 }]}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={20} color={Colors.text.secondary} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={16} color={Colors.text.muted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", gap: Spacing.md, padding: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xl },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.brand.forest, alignItems: "center", justifyContent: "center" },
  avatarText: { ...Type.display3, color: Colors.text.inverse, fontSize: 22 },
  name: { ...Type.display3, color: Colors.text.primary, fontSize: 22 },
  email: { ...Type.bodySm, color: Colors.text.muted, marginTop: 2 },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  sectionLabel: { ...Type.label, color: Colors.text.muted, marginBottom: Spacing.sm, paddingHorizontal: 4 },
  group: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, overflow: "hidden", borderWidth: 1, borderColor: Colors.border.subtle },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: Spacing.md, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border.subtle },
  rowIcon: { width: 30, alignItems: "center" },
  rowLabel: { ...Type.body, color: Colors.text.primary, flex: 1, fontWeight: "500" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowValue: { ...Type.bodySm, color: Colors.text.muted },
  danger: { paddingHorizontal: Spacing.lg, marginTop: Spacing.md },
  logout: { backgroundColor: Colors.bg.card, padding: Spacing.md, borderRadius: Radius.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1, borderColor: "rgba(225,90,35,0.2)" },
  logoutText: { ...Type.body, color: Colors.brand.orange, fontWeight: "600" },
  version: { ...Type.bodyXs, color: Colors.text.muted, textAlign: "center", marginTop: Spacing.xl },
});

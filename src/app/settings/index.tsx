import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";

const SECTIONS = [
  {
    title: "Sécurité",
    items: [
      { icon: "warning-outline" as const, label: "Détection de chute", hint: "Active", color: "#EF4444", route: "/settings/fall-detection" },
      { icon: "shield-checkmark-outline" as const, label: "Mes contacts d'urgence", hint: "3 contacts", color: Colors.brand.orange },
      { icon: "alert-circle-outline" as const, label: "Bouton SOS", hint: "Accessible partout", color: Colors.brand.orange },
      { icon: "lock-closed-outline" as const, label: "Zones de confidentialité", hint: "2 zones", color: Colors.brand.forest },
    ],
  },
  {
    title: "Tracking et GPS",
    items: [
      { icon: "navigate-outline" as const, label: "Précision GPS", hint: "Haute", color: Colors.brand.orange },
      { icon: "battery-charging-outline" as const, label: "Mode économie batterie", hint: "Auto", color: Colors.brand.forest },
      { icon: "cloud-offline-outline" as const, label: "Cartes hors-ligne", hint: "3 zones téléchargées", color: Colors.brand.forest },
      { icon: "watch-outline" as const, label: "Appareils et synchros", hint: "Apple Watch · Polar", color: "#0369A1", route: "/settings/devices" },
      { icon: "apps-outline" as const, label: "Widgets téléphone", hint: "4 formats", color: Colors.brand.orange, route: "/settings/widgets" },
    ],
  },
  {
    title: "Famille et partage",
    items: [
      { icon: "people-outline" as const, label: "Famille Roche", hint: "4 membres", color: Colors.brand.forest, route: "/family" },
      { icon: "radio-outline" as const, label: "Suivi en direct (Live)", hint: "Lien partage", color: "#EF4444", route: "/live" },
      { icon: "person-add-outline" as const, label: "Contrôles parentaux", hint: "Lucas 8 ans", color: "#F59E0B" },
    ],
  },
  {
    title: "Notifications",
    items: [
      { icon: "notifications-outline" as const, label: "Notifications push", hint: "Activées", color: Colors.brand.orange },
      { icon: "trophy-outline" as const, label: "Alertes défis et badges", hint: "Hebdo", color: "#F59E0B" },
      { icon: "people-outline" as const, label: "Activité de mes abonnés", hint: "Tous", color: Colors.brand.forest },
      { icon: "mail-outline" as const, label: "Newsletter saison", hint: "Activée", color: Colors.brand.forest },
    ],
  },
  {
    title: "Compte",
    items: [
      { icon: "person-outline" as const, label: "Informations personnelles", color: Colors.text.secondary },
      { icon: "card-outline" as const, label: "Moyens de paiement", color: Colors.text.secondary },
      { icon: "language-outline" as const, label: "Langue", hint: "Français", color: Colors.text.secondary },
      { icon: "moon-outline" as const, label: "Apparence", hint: "Auto", color: Colors.text.secondary },
    ],
  },
  {
    title: "Données et confidentialité",
    items: [
      { icon: "download-outline" as const, label: "Exporter mes données", color: Colors.brand.forest },
      { icon: "trash-outline" as const, label: "Supprimer mon compte", color: "#EF4444" },
      { icon: "document-text-outline" as const, label: "Politique de confidentialité", color: Colors.text.secondary, route: "/legal/privacy" },
      { icon: "checkmark-circle-outline" as const, label: "RGPD et cookies", hint: "Conforme", color: Colors.brand.forest, route: "/legal/privacy" },
    ],
  },
  {
    title: "Mentions légales",
    items: [
      { icon: "reader-outline" as const, label: "Conditions Générales d'Utilisation", color: Colors.text.secondary, route: "/legal/terms" },
      { icon: "shield-outline" as const, label: "Charte communauté", color: Colors.brand.forest, route: "/legal/community" },
      { icon: "shield-checkmark-outline" as const, label: "Ma vérification", hint: "Email vérifié", color: Colors.brand.orange, route: "/verify" },
    ],
  },
];

export default function Settings() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Réglages</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionLabel}>{section.title}</Text>
            <View style={styles.group}>
              {section.items.map((item, i) => (
                <Pressable
                  key={item.label}
                  onPress={() => (item as any).route && router.push((item as any).route)}
                  style={[styles.row, i !== section.items.length - 1 && styles.rowBorder]}
                >
                  <View style={[styles.icon, { backgroundColor: `${item.color}15` }]}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <Text style={styles.label}>{item.label}</Text>
                  {item.hint && <Text style={styles.hint}>{item.hint}</Text>}
                  <Ionicons name="chevron-forward" size={14} color={Colors.text.muted} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.version}>Alpine Bike v1.0.0</Text>
          <Text style={styles.build}>Build 2026.06.001</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18 },
  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
  sectionLabel: { ...Type.label, color: Colors.text.muted, marginBottom: 8 },
  group: { backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: Spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border.subtle },
  icon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  label: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "500", flex: 1, fontSize: 14 },
  hint: { ...Type.bodyXs, color: Colors.text.muted },
  footer: { padding: Spacing.xl, alignItems: "center", gap: 4 },
  version: { ...Type.bodyXs, color: Colors.text.muted, fontWeight: "600" },
  build: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 10 },
});

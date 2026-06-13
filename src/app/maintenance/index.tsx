import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { MAINTENANCE_HISTORY, MAINTENANCE_REMINDERS, MAINTENANCE_META, type MaintenanceEntry, type MaintenanceReminder } from "@/lib/maintenance";

export default function Maintenance() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Carnet d'entretien</Text>
        <Pressable style={styles.headBtn}>
          <Ionicons name="add" size={24} color={Colors.brand.orange} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.bikeCard}>
          <View style={styles.bikeIcon}>
            <Ionicons name="bicycle" size={28} color={Colors.brand.orange} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bikeName}>Giant Trance X E+ 2</Text>
            <Text style={styles.bikeMeta}>1 450 km au compteur</Text>
          </View>
          <Pressable style={styles.bikeBtn}>
            <Text style={styles.bikeBtnText}>Changer</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Rappels à venir</Text>
          <View style={{ gap: 10 }}>
            {MAINTENANCE_REMINDERS.map((r) => (
              <ReminderCard key={r.id} reminder={r} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>Historique</Text>
            <Pressable style={styles.exportBtn}>
              <Ionicons name="download-outline" size={14} color={Colors.brand.orange} />
              <Text style={styles.exportText}>Exporter PDF</Text>
            </Pressable>
          </View>
          <View style={{ gap: 10 }}>
            {MAINTENANCE_HISTORY.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.shopCta}>
            <Ionicons name="storefront" size={22} color={Colors.brand.forest} />
            <View style={{ flex: 1 }}>
              <Text style={styles.shopTitle}>Prendre RDV avec un vélociste</Text>
              <Text style={styles.shopDesc}>Pignon sur Routes, Tom Loc, Aillon Sport</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.muted} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ReminderCard({ reminder }: { reminder: MaintenanceReminder }) {
  const meta = MAINTENANCE_META[reminder.type];
  const tone = reminder.severity === "critical" ? "#EF4444" : reminder.severity === "warning" ? "#F59E0B" : Colors.brand.forest;
  return (
    <View style={[styles.reminder, { borderColor: `${tone}40` }]}>
      <View style={[styles.reminderIcon, { backgroundColor: `${tone}15` }]}>
        <Ionicons name={meta.icon as any} size={20} color={tone} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.reminderName}>{meta.label}</Text>
        <Text style={styles.reminderDue}>{reminder.dueIn}</Text>
      </View>
      <Pressable style={styles.bookBtn}>
        <Text style={styles.bookText}>RDV</Text>
      </Pressable>
    </View>
  );
}

function EntryCard({ entry }: { entry: MaintenanceEntry }) {
  const meta = MAINTENANCE_META[entry.type];
  return (
    <Pressable style={styles.entry}>
      <View style={[styles.entryIcon, { backgroundColor: `${meta.color}15` }]}>
        <Ionicons name={meta.icon as any} size={18} color={meta.color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.entryHead}>
          <Text style={styles.entryType}>{meta.label}</Text>
          {entry.cost && <Text style={styles.entryCost}>{entry.cost} €</Text>}
        </View>
        <View style={styles.entryMeta}>
          <Text style={styles.entryDate}>{new Date(entry.date).toLocaleDateString("fr-FR")}</Text>
          <Text style={styles.entrySep}>·</Text>
          <Text style={styles.entryKm}>{entry.kmAtDate} km</Text>
          {entry.shop && (
            <>
              <Text style={styles.entrySep}>·</Text>
              <Text style={styles.entryShop}>{entry.shop}</Text>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18 },
  bikeCard: { flexDirection: "row", alignItems: "center", gap: 12, margin: Spacing.lg, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle },
  bikeIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: "rgba(225,90,35,0.1)", alignItems: "center", justifyContent: "center" },
  bikeName: { ...Type.display4, color: Colors.text.primary, fontSize: 16 },
  bikeMeta: { ...Type.bodySm, color: Colors.text.muted, marginTop: 2 },
  bikeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: Colors.bg.elevated },
  bikeBtnText: { ...Type.bodyXs, color: Colors.text.primary, fontWeight: "700" },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionLabel: { ...Type.label, color: Colors.text.muted, marginBottom: 10 },
  exportBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: "rgba(225,90,35,0.1)" },
  exportText: { ...Type.bodyXs, color: Colors.brand.orange, fontWeight: "700" },
  reminder: { flexDirection: "row", alignItems: "center", gap: 12, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1 },
  reminderIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  reminderName: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 14 },
  reminderDue: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 2 },
  bookBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Colors.brand.orange },
  bookText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700" },
  entry: { flexDirection: "row", gap: 12, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle, alignItems: "center" },
  entryIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  entryHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  entryType: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 14 },
  entryCost: { ...Type.display4, color: Colors.brand.orange, fontSize: 14 },
  entryMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3, flexWrap: "wrap" },
  entryDate: { ...Type.bodyXs, color: Colors.text.muted },
  entrySep: { ...Type.bodyXs, color: Colors.text.muted },
  entryKm: { ...Type.bodyXs, color: Colors.text.muted },
  entryShop: { ...Type.bodyXs, color: Colors.text.muted, fontStyle: "italic" },
  shopCta: { flexDirection: "row", alignItems: "center", gap: 12, padding: Spacing.md, backgroundColor: "rgba(13,79,61,0.06)", borderRadius: Radius.md, borderWidth: 1, borderColor: "rgba(13,79,61,0.2)" },
  shopTitle: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700" },
  shopDesc: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 2 },
});

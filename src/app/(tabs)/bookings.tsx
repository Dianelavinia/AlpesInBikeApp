import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { t } from "@/lib/i18n";

export default function Bookings() {
  const router = useRouter();
  const [tab, setTab] = useState<"current" | "upcoming" | "past">("current");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("booking.title")}</Text>
      </View>

      <View style={styles.tabs}>
        {(["current", "upcoming", "past"] as const).map((k) => (
          <Pressable key={k} onPress={() => setTab(k)} style={styles.tabBtn}>
            <Text style={[styles.tabText, tab === k && styles.tabTextActive]}>{t(`booking.${k}`)}</Text>
            {tab === k && <View style={styles.tabUnderline} />}
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg, gap: 14 }}>
        {tab === "current" && <EmptyState onCta={() => router.push("/booking/new")} />}
        {tab === "upcoming" && (
          <BookingCard
            status="upcoming"
            dates="Sa 14 juin · 9h-18h"
            bikes="2 VTTAE Giant + 2 VTT Woom"
            location="Hôtel Splendide, Aix-les-Bains"
            total={279}
          />
        )}
        {tab === "past" && (
          <>
            <BookingCard
              status="past"
              dates="Sa 4 mai · 9h-13h"
              bikes="2 VTTAE Giant"
              location="Chambéry centre"
              total={138}
            />
            <BookingCard
              status="past"
              dates="Lun 8 avr · 14h-18h"
              bikes="1 VTT Marin"
              location="Le Bourget-du-Lac"
              total={45}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyState({ onCta }: { onCta: () => void }) {
  return (
    <View style={styles.empty}>
      <Ionicons name="calendar-outline" size={48} color={Colors.text.muted} />
      <Text style={styles.emptyText}>{t("booking.empty")}</Text>
      <Pressable onPress={onCta} style={({ pressed }) => [styles.emptyCta, pressed && { opacity: 0.85 }]}>
        <Text style={styles.emptyCtaText}>{t("booking.emptyCta")}</Text>
        <Ionicons name="arrow-forward" size={14} color={Colors.text.inverse} />
      </Pressable>
    </View>
  );
}

function BookingCard({ status, dates, bikes, location, total }: { status: "current" | "upcoming" | "past"; dates: string; bikes: string; location: string; total: number }) {
  const tone = status === "current" ? Colors.brand.orange : status === "upcoming" ? Colors.brand.forest : Colors.text.muted;
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
      <View style={[styles.statusBar, { backgroundColor: tone }]} />
      <View style={{ flex: 1, padding: Spacing.md }}>
        <Text style={styles.cardDate}>{dates}</Text>
        <Text style={styles.cardBikes}>{bikes}</Text>
        <View style={styles.cardLoc}>
          <Ionicons name="location-outline" size={14} color={Colors.text.muted} />
          <Text style={styles.cardLocText}>{location}</Text>
        </View>
        <View style={styles.cardFooter}>
          <View style={[styles.statusChip, { backgroundColor: `${tone}15` }]}>
            <Text style={[styles.statusText, { color: tone }]}>
              {status === "current" ? "En cours" : status === "upcoming" ? "À venir" : "Terminée"}
            </Text>
          </View>
          <Text style={styles.cardTotal}>{total} €</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md },
  title: { ...Type.display1, color: Colors.text.primary, fontSize: 34 },
  tabs: { flexDirection: "row", paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle, marginBottom: Spacing.md },
  tabBtn: { paddingVertical: 14, marginRight: 24, alignItems: "center" },
  tabText: { ...Type.bodySm, color: Colors.text.muted, fontWeight: "600" },
  tabTextActive: { color: Colors.text.primary },
  tabUnderline: { position: "absolute", bottom: -1, left: 0, right: 0, height: 2, backgroundColor: Colors.brand.orange, borderRadius: 1 },
  empty: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, padding: Spacing.xxl, alignItems: "center", gap: Spacing.md, borderWidth: 1, borderColor: Colors.border.subtle },
  emptyText: { ...Type.body, color: Colors.text.secondary, textAlign: "center" },
  emptyCta: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: Colors.brand.orange, paddingHorizontal: 22, paddingVertical: 12, borderRadius: Radius.pill, marginTop: 4 },
  emptyCtaText: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "600" },
  card: { flexDirection: "row", backgroundColor: Colors.bg.card, borderRadius: Radius.lg, overflow: "hidden", borderWidth: 1, borderColor: Colors.border.subtle },
  statusBar: { width: 4 },
  cardDate: { ...Type.bodyXs, color: Colors.text.muted, textTransform: "uppercase", letterSpacing: 1 },
  cardBikes: { ...Type.display4, color: Colors.text.primary, fontSize: 17, marginTop: 4 },
  cardLoc: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  cardLocText: { ...Type.bodySm, color: Colors.text.secondary },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: Spacing.md },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  statusText: { ...Type.bodyXs, fontWeight: "600", letterSpacing: 0.5 },
  cardTotal: { ...Type.display3, color: Colors.text.primary, fontSize: 22 },
});

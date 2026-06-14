import { View, Text, Pressable, StyleSheet, ScrollView, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import {
  useEvents,
  countByKind,
  REGIONS,
  KIND_META,
  DISCIPLINE_META,
  type EventKind,
  type EventDiscipline,
  type Region,
  type CyclingEvent,
} from "@/lib/events";

const KINDS_ORDER: EventKind[] = ["course", "sportive", "rando", "festival", "bourse", "demo"];

export default function Events() {
  const router = useRouter();
  const [region, setRegion] = useState<Region>("Savoie");
  const [kind, setKind] = useState<EventKind | "all">("all");
  const [discipline, setDiscipline] = useState<EventDiscipline | "all">("all");

  const { list } = useEvents({ region, kind, discipline });
  const counts = useMemo(() => countByKind(region), [region]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Événements vélo</Text>
        <Pressable style={styles.headBtn}>
          <Ionicons name="bookmark-outline" size={20} color={Colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.regionBlock}>
          <View style={styles.regionHead}>
            <Ionicons name="location" size={14} color={Colors.brand.orange} />
            <Text style={styles.regionLabel}>Région</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsRow}>
            {REGIONS.map((r) => (
              <Pressable
                key={r}
                onPress={() => setRegion(r)}
                style={[styles.regionChip, region === r && styles.regionChipActive]}
              >
                <Text style={[styles.regionChipText, region === r && styles.regionChipTextActive]}>{r}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.sectionLabel}>Catégories</Text>
        <View style={styles.kindGrid}>
          <KindTile
            label="Tous"
            icon="apps-outline"
            tint={Colors.brand.ink}
            count={Object.values(counts).reduce((a, b) => a + b, 0)}
            active={kind === "all"}
            onPress={() => setKind("all")}
          />
          {KINDS_ORDER.map((k) => (
            <KindTile
              key={k}
              label={KIND_META[k].label}
              icon={KIND_META[k].icon}
              tint={KIND_META[k].tint}
              count={counts[k]}
              active={kind === k}
              onPress={() => setKind(k)}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Discipline</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsRow}>
          <Pressable
            onPress={() => setDiscipline("all")}
            style={[styles.chip, discipline === "all" && styles.chipActive]}
          >
            <Text style={[styles.chipText, discipline === "all" && styles.chipTextActive]}>Toutes</Text>
          </Pressable>
          {(["route", "vtt", "gravel", "vttae", "cyclo", "mixte"] as EventDiscipline[]).map((d) => {
            const dm = DISCIPLINE_META[d];
            return (
              <Pressable
                key={d}
                onPress={() => setDiscipline(d)}
                style={[styles.chip, discipline === d && styles.chipActive]}
              >
                <Ionicons name={dm.icon as any} size={11} color={discipline === d ? Colors.text.inverse : Colors.text.secondary} />
                <Text style={[styles.chipText, discipline === d && styles.chipTextActive]}>{dm.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.countRow}>
          <Text style={styles.countText}>{list.length} événement{list.length > 1 ? "s" : ""}</Text>
          {region !== "Tous" && (
            <Text style={styles.countSub}>en {region}</Text>
          )}
        </View>

        {list.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={32} color={Colors.text.muted} />
            <Text style={styles.emptyTitle}>Aucun événement</Text>
            <Text style={styles.emptyDesc}>Élargissez la région ou changez de catégorie.</Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: Spacing.lg, gap: 14 }}>
            {list.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function KindTile({ label, icon, tint, count, active, onPress }: { label: string; icon: string; tint: string; count: number; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.kindTile, active && { borderColor: tint, backgroundColor: `${tint}10` }]}
    >
      <View style={[styles.kindIcon, { backgroundColor: `${tint}18` }]}>
        <Ionicons name={icon as any} size={16} color={tint} />
      </View>
      <Text style={styles.kindLabel}>{label}</Text>
      <Text style={[styles.kindCount, { color: tint }]}>{count}</Text>
    </Pressable>
  );
}

function EventCard({ event }: { event: CyclingEvent }) {
  const km = KIND_META[event.kind];
  return (
    <View style={styles.card}>
      <ImageBackground source={{ uri: event.cover }} style={styles.cover} imageStyle={{ borderRadius: 16 }}>
        <LinearGradient colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0.78)"]} style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />
        <View style={styles.coverTop}>
          <View style={[styles.kindBadge, { backgroundColor: km.tint }]}>
            <Ionicons name={km.icon as any} size={11} color={Colors.text.inverse} />
            <Text style={styles.kindBadgeText}>{km.label.replace(/s$/, "")}</Text>
          </View>
          {event.isFamily && (
            <View style={styles.familyBadge}>
              <Ionicons name="people-outline" size={11} color={Colors.text.inverse} />
              <Text style={styles.familyBadgeText}>Famille</Text>
            </View>
          )}
        </View>
        <View style={styles.coverBottom}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar" size={12} color={Colors.brand.orangeLight} />
            <Text style={styles.dateText}>{event.dateLabel}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>{event.title}</Text>
          <View style={styles.locRow}>
            <Ionicons name="location" size={12} color="rgba(255,255,255,0.85)" />
            <Text style={styles.locText}>{event.city} · {event.region}</Text>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.body}>
        <Text style={styles.desc} numberOfLines={3}>{event.description}</Text>

        {(event.distancesKm || event.elevationGainsM) && (
          <View style={styles.statsRow}>
            {event.distancesKm && (
              <Stat icon="navigate-outline" value={event.distancesKm.length === 1 ? `${event.distancesKm[0]} km` : `${event.distancesKm[0]} à ${event.distancesKm[event.distancesKm.length - 1]} km`} />
            )}
            {event.elevationGainsM && (
              <Stat icon="trending-up-outline" value={`+${event.elevationGainsM[event.elevationGainsM.length - 1]} m`} />
            )}
            {event.participants && (
              <Stat icon="people-outline" value={`${event.participants.toLocaleString("fr-FR")} inscrits`} />
            )}
          </View>
        )}

        <View style={styles.foot}>
          <View>
            <Text style={styles.orgLabel}>Organisé par</Text>
            <Text style={styles.orgName} numberOfLines={1}>{event.organizer}</Text>
          </View>
          {event.pricesFromEuros !== undefined ? (
            <View style={styles.priceBox}>
              <Text style={styles.priceFrom}>À partir de</Text>
              <Text style={styles.priceVal}>{event.pricesFromEuros} €</Text>
            </View>
          ) : (
            <View style={styles.freeBox}>
              <Text style={styles.freeText}>Entrée libre</Text>
            </View>
          )}
        </View>

        <Pressable style={styles.cta}>
          <Ionicons name={event.kind === "bourse" || event.kind === "demo" || event.kind === "festival" ? "calendar-outline" : "log-in-outline"} size={15} color={Colors.text.inverse} />
          <Text style={styles.ctaText}>
            {event.kind === "bourse" || event.kind === "festival" ? "Ajouter à mon agenda" : event.kind === "demo" ? "Réserver un créneau" : "S'inscrire"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Stat({ icon, value }: { icon: any; value: string }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={13} color={Colors.brand.orange} />
      <Text style={styles.statText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18 },

  regionBlock: { paddingTop: Spacing.sm, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle, marginBottom: Spacing.md, backgroundColor: Colors.bg.card },
  regionHead: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: Spacing.lg, marginBottom: 8 },
  regionLabel: { ...Type.label, color: Colors.text.muted, fontSize: 10.5 },
  chipsScroll: { flexGrow: 0, maxHeight: 52 },
  chipsRow: { paddingHorizontal: Spacing.lg, alignItems: "center", paddingVertical: 4 },

  regionChip: { paddingHorizontal: 14, height: 34, justifyContent: "center", marginRight: 6, borderRadius: Radius.pill, backgroundColor: Colors.bg.elevated, borderWidth: 1, borderColor: Colors.border.subtle },
  regionChipActive: { backgroundColor: Colors.brand.orange, borderColor: Colors.brand.orange },
  regionChipText: { ...Type.bodyXs, color: Colors.text.secondary, fontWeight: "700", fontSize: 12.5 },
  regionChipTextActive: { color: Colors.text.inverse },

  sectionLabel: { ...Type.label, color: Colors.text.muted, marginHorizontal: Spacing.lg, marginBottom: 8, marginTop: Spacing.sm },
  kindGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: Spacing.lg, gap: 8, marginBottom: Spacing.md },
  kindTile: { width: "31%", padding: Spacing.sm, borderRadius: Radius.md, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle, alignItems: "flex-start", gap: 4 },
  kindIcon: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  kindLabel: { ...Type.bodyXs, color: Colors.text.primary, fontWeight: "700", fontSize: 11.5 },
  kindCount: { ...Type.display4, fontSize: 18, fontWeight: "700" },

  chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, height: 32, marginRight: 6, borderRadius: Radius.pill, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle },
  chipActive: { backgroundColor: Colors.brand.ink, borderColor: Colors.brand.ink },
  chipText: { ...Type.bodyXs, color: Colors.text.secondary, fontWeight: "700", fontSize: 12 },
  chipTextActive: { color: Colors.text.inverse },

  countRow: { flexDirection: "row", alignItems: "baseline", gap: 6, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  countText: { ...Type.label, color: Colors.text.muted, fontSize: 10.5 },
  countSub: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 11 },

  card: { backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle, overflow: "hidden" },
  cover: { height: 180, justifyContent: "space-between", padding: 12, margin: Spacing.sm, borderRadius: 16 },
  coverTop: { flexDirection: "row", justifyContent: "space-between" },
  kindBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill },
  kindBadgeText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700", fontSize: 11 },
  familyBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: Radius.pill, backgroundColor: "rgba(13,79,61,0.85)" },
  familyBadgeText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700", fontSize: 10.5 },
  coverBottom: { gap: 5 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  dateText: { ...Type.bodyXs, color: Colors.brand.orangeLight, fontWeight: "700", fontSize: 12 },
  cardTitle: { ...Type.display3, color: Colors.text.inverse, fontSize: 20, lineHeight: 24 },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locText: { ...Type.bodyXs, color: "rgba(255,255,255,0.88)", fontSize: 11.5 },

  body: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: Spacing.sm },
  desc: { ...Type.bodySm, color: Colors.text.secondary, lineHeight: 19, fontSize: 13 },
  statsRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  stat: { flexDirection: "row", alignItems: "center", gap: 5 },
  statText: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 12.5 },

  foot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 4, borderTopWidth: 1, borderTopColor: Colors.border.subtle, gap: 8 },
  orgLabel: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 10 },
  orgName: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 13, maxWidth: 200 },
  priceBox: { alignItems: "flex-end" },
  priceFrom: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 10 },
  priceVal: { ...Type.display3, color: Colors.brand.orange, fontSize: 18 },
  freeBox: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, backgroundColor: "rgba(13,79,61,0.1)" },
  freeText: { ...Type.bodyXs, color: Colors.brand.forest, fontWeight: "700" },

  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: Radius.pill, backgroundColor: Colors.brand.orange },
  ctaText: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "700", fontSize: 14 },

  emptyBox: { alignItems: "center", paddingVertical: Spacing.xl, paddingHorizontal: Spacing.lg, gap: 6 },
  emptyTitle: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", marginTop: 4 },
  emptyDesc: { ...Type.bodyXs, color: Colors.text.muted, textAlign: "center" },
});

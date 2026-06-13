import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import {
  getLeaderboard,
  getMotivation,
  METRIC_META,
  PERIOD_LABEL,
  SCOPE_META,
  AGE_LABEL,
  SEX_LABEL,
  ME,
  type Metric,
  type Period,
  type Scope,
  type RankedRider,
} from "@/lib/leaderboard";

const SCOPES: Scope[] = ["global", "myAge", "mySex", "myRegion", "friends", "club"];
const PERIODS: Period[] = ["week", "month", "year", "all"];
const METRICS: Metric[] = ["km", "elevation", "co2", "rides", "points"];

export default function Leaderboard() {
  const router = useRouter();
  const [scope, setScope] = useState<Scope>("global");
  const [period, setPeriod] = useState<Period>("month");
  const [metric, setMetric] = useState<Metric>("km");

  const data = useMemo(() => getLeaderboard(scope, period, metric), [scope, period, metric]);
  const motivation = getMotivation(data.meScopeRank, data.meScopeTotal, metric, data.topValue, data.meValue);
  const meta = METRIC_META[metric];

  const top3 = data.list.slice(0, 3);
  const rest = data.list.slice(3);
  const scopeHint = useScopeHint(scope);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Classement</Text>
        <Pressable style={styles.headBtn}>
          <Ionicons name="share-outline" size={22} color={Colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.heroCard}>
          <LinearGradient colors={[Colors.brand.forest, Colors.brand.forestDark]} style={StyleSheet.absoluteFill} />
          <Text style={styles.heroEmoji}>{motivation.emoji}</Text>
          <Text style={styles.heroTitle}>{motivation.title}</Text>
          <Text style={styles.heroBody}>{motivation.body}</Text>
          <View style={styles.heroDivider} />
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>#{data.meScopeRank ?? "..."}</Text>
              <Text style={styles.heroStatLabel}>Votre rang</Text>
            </View>
            <View style={styles.heroDividerV} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{formatValue(data.meValue, metric)}</Text>
              <Text style={styles.heroStatLabel}>{meta.label}</Text>
            </View>
            <View style={styles.heroDividerV} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{data.total}</Text>
              <Text style={styles.heroStatLabel}>Rideurs</Text>
            </View>
          </View>
        </View>

        <Text style={styles.filterLabel}>Comparer avec</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {SCOPES.map((s) => (
            <Chip key={s} active={scope === s} label={SCOPE_META[s].label} icon={SCOPE_META[s].icon as any} onPress={() => setScope(s)} />
          ))}
        </ScrollView>
        {scopeHint && (
          <Text style={styles.hint}>{scopeHint}</Text>
        )}

        <Text style={styles.filterLabel}>Période</Text>
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <Pressable key={p} onPress={() => setPeriod(p)} style={[styles.periodBtn, period === p && styles.periodBtnActive]}>
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{PERIOD_LABEL[p]}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.filterLabel}>Critère</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {METRICS.map((m) => {
            const mm = METRIC_META[m];
            const active = metric === m;
            return (
              <Pressable key={m} onPress={() => setMetric(m)} style={[styles.metricChip, active && { backgroundColor: mm.tint, borderColor: mm.tint }]}>
                <Ionicons name={mm.icon as any} size={14} color={active ? Colors.text.inverse : mm.tint} />
                <Text style={[styles.metricText, { color: active ? Colors.text.inverse : Colors.text.primary }]}>{mm.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {top3.length === 3 && (
          <View style={styles.podium}>
            <PodiumColumn entry={top3[1]} height={92} place={2} metric={metric} />
            <PodiumColumn entry={top3[0]} height={120} place={1} metric={metric} />
            <PodiumColumn entry={top3[2]} height={72} place={3} metric={metric} />
          </View>
        )}

        <View style={styles.listHead}>
          <Text style={styles.listTitle}>Classement complet</Text>
          <View style={styles.metricBadge}>
            <Ionicons name={meta.icon as any} size={12} color={meta.tint} />
            <Text style={[styles.metricBadgeText, { color: meta.tint }]}>{PERIOD_LABEL[period]} · {meta.label}</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: Spacing.lg, gap: 8 }}>
          {rest.map((r) => (
            <Row key={r.id} entry={r} metric={metric} />
          ))}
        </View>

        <View style={styles.footerCard}>
          <Text style={styles.footerEmoji}>📣</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.footerTitle}>Invitez vos amis à ride</Text>
            <Text style={styles.footerDesc}>Plus on est nombreux, plus la motivation grimpe.</Text>
          </View>
          <Pressable style={styles.footerBtn}>
            <Ionicons name="person-add" size={14} color={Colors.text.inverse} />
            <Text style={styles.footerBtnText}>Inviter</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function useScopeHint(scope: Scope): string | null {
  switch (scope) {
    case "myAge":
      return `Filtré sur ${AGE_LABEL[ME.ageBracket].toLowerCase()}`;
    case "mySex":
      return `Filtré sur ${SEX_LABEL[ME.sex].toLowerCase()}`;
    case "myRegion":
      return `Filtré sur ${ME.region}`;
    case "club":
      return `Filtré sur le club ${ME.club}`;
    case "friends":
      return "Vous et les rideurs que vous suivez";
    default:
      return null;
  }
}

function Chip({ active, label, icon, onPress }: { active: boolean; label: string; icon: any; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Ionicons name={icon} size={13} color={active ? Colors.text.inverse : Colors.text.secondary} />
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function PodiumColumn({ entry, height, place, metric }: { entry: RankedRider; height: number; place: number; metric: Metric }) {
  const medalColor = place === 1 ? "#FACC15" : place === 2 ? "#94A3B8" : "#CD7F32";
  const isYou = entry.isYou;
  return (
    <View style={styles.podiumCol}>
      <View style={[styles.podiumAvatar, isYou && { backgroundColor: Colors.brand.orange, borderWidth: 3, borderColor: Colors.brand.orangeLight }]}>
        <Text style={styles.podiumAvatarText}>{entry.avatar}</Text>
      </View>
      <Text style={styles.podiumName} numberOfLines={1}>{entry.name.split(" ")[0]}{isYou ? " (vous)" : ""}</Text>
      <Text style={styles.podiumVal}>{formatValue(entry.value, metric)}</Text>
      <View style={[styles.podiumBar, { height, backgroundColor: medalColor }]}>
        <Ionicons name="medal" size={20} color={Colors.text.inverse} style={{ marginTop: 8 }} />
        <Text style={styles.podiumPlace}>{place}</Text>
      </View>
    </View>
  );
}

function Row({ entry, metric }: { entry: RankedRider; metric: Metric }) {
  const isYou = entry.isYou;
  const meta = METRIC_META[metric];
  return (
    <View style={[styles.row, isYou && styles.rowYou]}>
      <View style={styles.rankPill}>
        <Text style={styles.rankText}>{entry.rank}</Text>
      </View>
      <View style={[styles.avatar, isYou && { backgroundColor: Colors.brand.orange }]}>
        <Text style={styles.avatarText}>{entry.avatar}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{entry.name}{isYou && " (vous)"}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={11} color={Colors.text.muted} />
          <Text style={styles.metaText}>{entry.city}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Ionicons name="ribbon-outline" size={11} color={Colors.text.muted} />
          <Text style={styles.metaText}>{entry.badges} badges</Text>
        </View>
      </View>
      <View style={styles.rowVal}>
        <Text style={[styles.rowValNum, { color: meta.tint }]}>{formatValue(entry.value, metric)}</Text>
        <Text style={styles.rowValUnit}>{meta.unit}</Text>
      </View>
    </View>
  );
}

function formatValue(v: number, metric: Metric): string {
  if (metric === "km" || metric === "elevation") {
    return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString();
  }
  return v.toString();
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18 },

  heroCard: { marginHorizontal: Spacing.lg, padding: Spacing.lg, borderRadius: Radius.lg, overflow: "hidden", alignItems: "center" },
  heroEmoji: { fontSize: 32 },
  heroTitle: { ...Type.display3, color: Colors.text.inverse, fontSize: 20, marginTop: 4, textAlign: "center" },
  heroBody: { ...Type.bodySm, color: "rgba(255,255,255,0.88)", textAlign: "center", marginTop: 6, paddingHorizontal: 12, lineHeight: 19 },
  heroDivider: { width: "100%", height: 1, backgroundColor: "rgba(255,255,255,0.15)", marginVertical: Spacing.md },
  heroStats: { flexDirection: "row", width: "100%" },
  heroStat: { flex: 1, alignItems: "center", gap: 2 },
  heroStatVal: { ...Type.display3, color: Colors.text.inverse, fontSize: 22 },
  heroStatLabel: { ...Type.bodyXs, color: "rgba(255,255,255,0.7)", fontSize: 10.5 },
  heroDividerV: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.15)" },

  filterLabel: { ...Type.label, color: Colors.text.muted, marginHorizontal: Spacing.lg, marginTop: Spacing.lg, marginBottom: 8 },
  chipsRow: { paddingHorizontal: Spacing.lg, gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle },
  chipActive: { backgroundColor: Colors.brand.ink, borderColor: Colors.brand.ink },
  chipText: { ...Type.bodyXs, color: Colors.text.secondary, fontWeight: "700", fontSize: 12 },
  chipTextActive: { color: Colors.text.inverse },
  hint: { ...Type.bodyXs, color: Colors.text.muted, paddingHorizontal: Spacing.lg, marginTop: 8, fontStyle: "italic" },

  periodRow: { flexDirection: "row", paddingHorizontal: Spacing.lg, gap: 6 },
  periodBtn: { flex: 1, paddingVertical: 9, borderRadius: Radius.pill, alignItems: "center", backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle },
  periodBtnActive: { backgroundColor: Colors.brand.orange, borderColor: Colors.brand.orange },
  periodText: { ...Type.bodyXs, color: Colors.text.secondary, fontWeight: "700", fontSize: 12 },
  periodTextActive: { color: Colors.text.inverse },

  metricChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.base },
  metricText: { ...Type.bodyXs, fontWeight: "700", fontSize: 12 },

  podium: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 10, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xl, paddingTop: Spacing.lg },
  podiumCol: { flex: 1, alignItems: "center", gap: 4 },
  podiumAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.brand.forest, alignItems: "center", justifyContent: "center" },
  podiumAvatarText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700", fontSize: 13 },
  podiumName: { ...Type.bodyXs, color: Colors.text.primary, fontWeight: "700", fontSize: 11, maxWidth: 80 },
  podiumVal: { ...Type.bodyXs, color: Colors.text.muted, fontWeight: "600", fontSize: 11, marginBottom: 4 },
  podiumBar: { width: "100%", maxWidth: 90, borderRadius: 12, alignItems: "center", paddingTop: 4 },
  podiumPlace: { ...Type.display3, color: Colors.text.inverse, fontSize: 24, fontWeight: "700" },

  listHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.lg, marginBottom: Spacing.md, marginTop: 4 },
  listTitle: { ...Type.label, color: Colors.text.muted },
  metricBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: Radius.pill, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle },
  metricBadgeText: { ...Type.bodyXs, fontWeight: "700", fontSize: 10.5 },

  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle },
  rowYou: { borderColor: Colors.brand.orange, backgroundColor: "rgba(225,90,35,0.05)" },
  rankPill: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.bg.elevated, alignItems: "center", justifyContent: "center" },
  rankText: { ...Type.bodyXs, color: Colors.text.muted, fontWeight: "700", fontSize: 13 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.brand.forest, alignItems: "center", justifyContent: "center" },
  avatarText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700", fontSize: 12 },
  name: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 14 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  metaText: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 11 },
  metaDot: { ...Type.bodyXs, color: Colors.text.muted, marginHorizontal: 2 },
  rowVal: { alignItems: "flex-end" },
  rowValNum: { ...Type.display4, fontSize: 18 },
  rowValUnit: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 10 },

  footerCard: { marginHorizontal: Spacing.lg, marginTop: Spacing.xl, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: "rgba(13,79,61,0.06)", borderWidth: 1, borderColor: "rgba(13,79,61,0.18)", flexDirection: "row", alignItems: "center", gap: 12 },
  footerEmoji: { fontSize: 28 },
  footerTitle: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700" },
  footerDesc: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 2 },
  footerBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Colors.brand.forest },
  footerBtnText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700" },
});

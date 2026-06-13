import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { BADGES, CHALLENGES, LEADERBOARD, type Badge, type Challenge, type LeaderboardEntry } from "@/lib/achievements";

export default function Achievements() {
  const router = useRouter();
  const [tab, setTab] = useState<"badges" | "challenges" | "leaderboard">("badges");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Récompenses</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabs}>
        {(["badges", "challenges", "leaderboard"] as const).map((k) => (
          <Pressable key={k} onPress={() => setTab(k)} style={styles.tabBtn}>
            <Text style={[styles.tabText, tab === k && styles.tabTextActive]}>
              {k === "badges" ? "Badges" : k === "challenges" ? "Défis" : "Classement"}
            </Text>
            {tab === k && <View style={styles.tabUnderline} />}
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 60 }}>
        {tab === "badges" && <BadgesView />}
        {tab === "challenges" && <ChallengesView />}
        {tab === "leaderboard" && <LeaderboardView />}
      </ScrollView>
    </SafeAreaView>
  );
}

function BadgesView() {
  const unlocked = BADGES.filter((b) => b.unlocked);
  const locked = BADGES.filter((b) => !b.unlocked);
  return (
    <View>
      <View style={styles.progressCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.progressLabel}>Badges débloqués</Text>
          <Text style={styles.progressBig}>{unlocked.length}<Text style={styles.progressTotal}>/{BADGES.length}</Text></Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(unlocked.length / BADGES.length) * 100}%` }]} />
          </View>
        </View>
        <View style={styles.trophyCircle}>
          <Ionicons name="trophy" size={28} color={Colors.brand.orange} />
        </View>
      </View>

      <Text style={styles.sectionLabel}>Débloqués</Text>
      <View style={styles.grid}>
        {unlocked.map((b) => (
          <BadgeCard key={b.id} badge={b} />
        ))}
      </View>

      <Text style={[styles.sectionLabel, { marginTop: 24 }]}>À débloquer</Text>
      <View style={{ gap: 10 }}>
        {locked.map((b) => (
          <LockedBadge key={b.id} badge={b} />
        ))}
      </View>
    </View>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <View style={[styles.badge, { borderColor: `${badge.color}40` }]}>
      <View style={[styles.badgeIcon, { backgroundColor: `${badge.color}15` }]}>
        <Ionicons name={badge.icon as any} size={28} color={badge.color} />
      </View>
      <Text style={styles.badgeName}>{badge.name}</Text>
      <Text style={styles.badgeDate}>{badge.unlockedAt}</Text>
    </View>
  );
}

function LockedBadge({ badge }: { badge: Badge }) {
  return (
    <View style={styles.locked}>
      <View style={styles.lockedIcon}>
        <Ionicons name="lock-closed" size={18} color={Colors.text.muted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.lockedName}>{badge.name}</Text>
        <Text style={styles.lockedDesc}>{badge.description}</Text>
        {badge.progress !== undefined && badge.goal && (
          <View style={styles.progressContainer}>
            <View style={styles.lockedProgress}>
              <View style={[styles.lockedFill, { width: `${(badge.progress / badge.goal) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{badge.progress} / {badge.goal}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function ChallengesView() {
  return (
    <View style={{ gap: 14 }}>
      {CHALLENGES.map((c) => (
        <View key={c.id} style={styles.challenge}>
          <View style={styles.challengeHead}>
            <View style={styles.challengeIcon}>
              <Ionicons name={c.icon as any} size={22} color={Colors.brand.orange} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.challengeName}>{c.name}</Text>
              <Text style={styles.challengeDesc}>{c.description}</Text>
            </View>
            <View style={styles.endsBadge}>
              <Text style={styles.endsText}>Fin {c.endsAt}</Text>
            </View>
          </View>
          <View style={styles.challengeBar}>
            <View style={[styles.challengeFill, { width: `${Math.min(100, (c.progress / c.goal) * 100)}%` }]} />
          </View>
          <View style={styles.challengeMetaRow}>
            <Text style={styles.challengeProgressText}>{c.progress} / {c.goal} {c.unit}</Text>
            <View style={styles.partsRow}>
              <Ionicons name="people-outline" size={12} color={Colors.text.muted} />
              <Text style={styles.partsText}>{c.participants}</Text>
            </View>
          </View>
          <View style={styles.rewardRow}>
            <Ionicons name="gift-outline" size={14} color={Colors.brand.orange} />
            <Text style={styles.rewardText}>{c.reward}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function LeaderboardView() {
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.leaderHead}>
        <Pressable style={styles.periodPill}><Text style={styles.periodText}>Ce mois</Text></Pressable>
        <Pressable style={styles.periodPillInactive}><Text style={styles.periodTextInactive}>Année</Text></Pressable>
        <Pressable style={styles.periodPillInactive}><Text style={styles.periodTextInactive}>Toujours</Text></Pressable>
      </View>
      {LEADERBOARD.map((e) => (
        <LeaderboardRow key={e.rank} entry={e} />
      ))}
    </View>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const isPodium = entry.rank <= 3;
  const rankColor = entry.rank === 1 ? "#FACC15" : entry.rank === 2 ? "#94A3B8" : entry.rank === 3 ? "#CD7F32" : Colors.text.muted;
  return (
    <View style={[styles.leaderRow, entry.isYou && styles.leaderYou]}>
      <View style={[styles.rankBox, isPodium && { backgroundColor: `${rankColor}20` }]}>
        {isPodium ? (
          <Ionicons name="medal" size={20} color={rankColor} />
        ) : (
          <Text style={styles.rankNum}>#{entry.rank}</Text>
        )}
      </View>
      <View style={[styles.leaderAvatar, entry.isYou && { backgroundColor: Colors.brand.orange }]}>
        <Text style={styles.leaderAvatarText}>{entry.avatar}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.leaderName}>{entry.userName}{entry.isYou && " (vous)"}</Text>
        <View style={styles.leaderStats}>
          <Text style={styles.leaderStatText}>{entry.kmThisMonth} km</Text>
          <Text style={styles.leaderStatText}>· +{entry.elevationThisMonth} m</Text>
          <Text style={styles.leaderStatText}>· {entry.badges} badges</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18 },
  tabs: { flexDirection: "row", paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle, marginBottom: Spacing.md },
  tabBtn: { paddingVertical: 14, marginRight: 24, alignItems: "center" },
  tabText: { ...Type.bodySm, color: Colors.text.muted, fontWeight: "600" },
  tabTextActive: { color: Colors.text.primary },
  tabUnderline: { position: "absolute", bottom: -1, left: 0, right: 0, height: 2, backgroundColor: Colors.brand.orange, borderRadius: 1 },
  progressCard: { flexDirection: "row", alignItems: "center", gap: 16, padding: Spacing.lg, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle, marginBottom: 20 },
  progressLabel: { ...Type.label, color: Colors.text.muted },
  progressBig: { ...Type.display1, color: Colors.text.primary, fontSize: 40, marginTop: 4 },
  progressTotal: { ...Type.bodySm, color: Colors.text.muted, fontSize: 18 },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: Colors.bg.elevated, marginTop: 6, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: Colors.brand.orange },
  trophyCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(225,90,35,0.12)", alignItems: "center", justifyContent: "center" },
  sectionLabel: { ...Type.label, color: Colors.text.muted, marginBottom: Spacing.md },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badge: { width: "31%", padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, alignItems: "center", gap: 6 },
  badgeIcon: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  badgeName: { ...Type.bodyXs, color: Colors.text.primary, fontWeight: "700", textAlign: "center", fontSize: 11 },
  badgeDate: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 10 },
  locked: { flexDirection: "row", alignItems: "center", gap: 12, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle, opacity: 0.7 },
  lockedIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bg.elevated, alignItems: "center", justifyContent: "center" },
  lockedName: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700" },
  lockedDesc: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 2 },
  progressContainer: { marginTop: 6 },
  lockedProgress: { height: 4, borderRadius: 2, backgroundColor: Colors.bg.elevated, overflow: "hidden" },
  lockedFill: { height: "100%", backgroundColor: Colors.brand.orange },
  progressText: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 4, fontSize: 10 },
  challenge: { padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle, gap: 10 },
  challengeHead: { flexDirection: "row", gap: 10 },
  challengeIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(225,90,35,0.12)", alignItems: "center", justifyContent: "center" },
  challengeName: { ...Type.display4, color: Colors.text.primary, fontSize: 15 },
  challengeDesc: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 2 },
  endsBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill, backgroundColor: Colors.bg.elevated, alignSelf: "flex-start" },
  endsText: { ...Type.bodyXs, color: Colors.text.secondary, fontWeight: "700", fontSize: 10 },
  challengeBar: { height: 8, borderRadius: 4, backgroundColor: Colors.bg.elevated, overflow: "hidden" },
  challengeFill: { height: "100%", backgroundColor: Colors.brand.orange },
  challengeMetaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  challengeProgressText: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 13 },
  partsRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  partsText: { ...Type.bodyXs, color: Colors.text.muted },
  rewardRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border.subtle },
  rewardText: { ...Type.bodyXs, color: Colors.brand.orange, flex: 1, fontWeight: "600" },
  leaderHead: { flexDirection: "row", gap: 6, marginBottom: 6 },
  periodPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: Colors.brand.ink },
  periodText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700" },
  periodPillInactive: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle },
  periodTextInactive: { ...Type.bodyXs, color: Colors.text.secondary, fontWeight: "600" },
  leaderRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle },
  leaderYou: { borderColor: Colors.brand.orange, backgroundColor: "rgba(225,90,35,0.04)" },
  rankBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bg.elevated, alignItems: "center", justifyContent: "center" },
  rankNum: { ...Type.bodySm, color: Colors.text.muted, fontWeight: "700" },
  leaderAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.brand.forest, alignItems: "center", justifyContent: "center" },
  leaderAvatarText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700", fontSize: 11 },
  leaderName: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 14 },
  leaderStats: { flexDirection: "row", marginTop: 2 },
  leaderStatText: { ...Type.bodyXs, color: Colors.text.muted, marginRight: 4 },
});

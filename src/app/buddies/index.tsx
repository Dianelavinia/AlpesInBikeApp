import { View, Text, Pressable, StyleSheet, ScrollView, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import {
  useBuddies,
  GROUP_RIDES,
  BUDDY_REQUESTS,
  LEVEL_META,
  PACE_META,
  VIBE_META,
  BIKE_META,
  type Buddy,
  type GroupRide,
  type BuddyRequest,
  type BikeKind,
  type Level,
  type Vibe,
} from "@/lib/buddies";
import { useMyTrust, canDo, getBuddyTrust, type GatedAction } from "@/lib/trust";
import TrustBadge from "@/components/TrustBadge";
import TrustGateSheet from "@/components/TrustGateSheet";

const TABS = [
  { id: "nearby",   label: "Près de moi",   icon: "people-outline" as const },
  { id: "groups",   label: "Sorties groupe", icon: "calendar-outline" as const },
  { id: "requests", label: "Invitations",   icon: "mail-outline" as const },
];

export default function Buddies() {
  const router = useRouter();
  const [tab, setTab] = useState<"nearby" | "groups" | "requests">("nearby");
  const [bikeKind, setBikeKind] = useState<BikeKind | "all">("all");
  const [level, setLevel] = useState<Level | "all">("all");
  const [vibe, setVibe] = useState<Vibe | "all">("all");
  const [radius, setRadius] = useState<number>(50);
  const [gate, setGate] = useState<GatedAction | null>(null);

  const { list } = useBuddies({ bikeKind, level, vibe, maxDistanceKm: radius });
  const { trust } = useMyTrust();
  const pending = BUDDY_REQUESTS.filter((r) => r.status === "pending").length;

  function tryAction(action: GatedAction) {
    if (canDo(action, trust.level)) return true;
    setGate(action);
    return false;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Copains de route</Text>
        <Pressable style={styles.headBtn}>
          <Ionicons name="add" size={24} color={Colors.brand.orange} />
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {TABS.map((tt) => (
          <Pressable
            key={tt.id}
            onPress={() => setTab(tt.id as any)}
            style={[styles.tab, tab === tt.id && styles.tabActive]}
          >
            <Ionicons name={tt.icon} size={14} color={tab === tt.id ? Colors.brand.orange : Colors.text.muted} />
            <Text style={[styles.tabText, tab === tt.id && styles.tabTextActive]}>
              {tt.label}{tt.id === "requests" && pending > 0 ? ` (${pending})` : ""}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.trustBanner}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.brand.forest} />
          <Text style={styles.trustBannerText} numberOfLines={2}>
            Sécurité : seuls les profils avec identité vérifiée peuvent organiser des sorties.
          </Text>
          <Pressable onPress={() => router.push("/verify" as any)}>
            <Text style={styles.trustBannerLink}>Voir</Text>
          </Pressable>
        </View>

        {tab === "nearby" && (
          <NearbyView
            list={list}
            bikeKind={bikeKind} setBikeKind={setBikeKind}
            level={level} setLevel={setLevel}
            vibe={vibe} setVibe={setVibe}
            radius={radius} setRadius={setRadius}
            tryAction={tryAction}
          />
        )}
        {tab === "groups" && <GroupsView list={GROUP_RIDES} tryAction={tryAction} />}
        {tab === "requests" && <RequestsView list={BUDDY_REQUESTS} />}
      </ScrollView>

      <TrustGateSheet
        visible={gate !== null}
        action={gate ?? "joinGroup"}
        currentLevel={trust.level}
        onClose={() => setGate(null)}
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// NEARBY : copains compatibles
// ---------------------------------------------------------------------------

function NearbyView({
  list,
  bikeKind, setBikeKind,
  level, setLevel,
  vibe, setVibe,
  radius, setRadius,
  tryAction,
}: any) {
  const radii = [10, 25, 50, 100];
  return (
    <View>
      <Text style={styles.filterLabel}>Type de vélo</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsRow}>
        <Chip label="Tous" active={bikeKind === "all"} onPress={() => setBikeKind("all")} />
        {(["vttae","vtt","route","gravel","ville"] as BikeKind[]).map((b) => (
          <Chip key={b} label={BIKE_META[b].label} icon={BIKE_META[b].icon} active={bikeKind === b} onPress={() => setBikeKind(b)} />
        ))}
      </ScrollView>

      <Text style={styles.filterLabel}>Niveau</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsRow}>
        <Chip label="Tous" active={level === "all"} onPress={() => setLevel("all")} />
        {(["decouverte","intermediaire","confirme","expert"] as Level[]).map((l) => (
          <Chip key={l} label={LEVEL_META[l].label} active={level === l} onPress={() => setLevel(l)} />
        ))}
      </ScrollView>

      <Text style={styles.filterLabel}>Ambiance</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsRow}>
        <Chip label="Toutes" active={vibe === "all"} onPress={() => setVibe("all")} />
        {(["famille","decouverte","perf","social"] as Vibe[]).map((v) => (
          <Chip key={v} label={VIBE_META[v].label} icon={VIBE_META[v].icon} active={vibe === v} onPress={() => setVibe(v)} />
        ))}
      </ScrollView>

      <Text style={styles.filterLabel}>Distance max</Text>
      <View style={styles.radiusRow}>
        {radii.map((r) => (
          <Pressable
            key={r}
            onPress={() => setRadius(r)}
            style={[styles.radiusBtn, radius === r && styles.radiusBtnActive]}
          >
            <Text style={[styles.radiusText, radius === r && styles.radiusTextActive]}>{r} km</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.countRow}>
        <Text style={styles.countText}>{list.length} rideur{list.length > 1 ? "s" : ""} compatible{list.length > 1 ? "s" : ""}</Text>
      </View>

      {list.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="search-outline" size={32} color={Colors.text.muted} />
          <Text style={styles.emptyTitle}>Aucun rideur trouvé</Text>
          <Text style={styles.emptyDesc}>Élargissez le rayon ou changez de filtres.</Text>
        </View>
      ) : (
        <View style={{ paddingHorizontal: Spacing.lg, gap: 10 }}>
          {list.map((b: Buddy) => <BuddyCard key={b.id} buddy={b} tryAction={tryAction} />)}
        </View>
      )}
    </View>
  );
}

function BuddyCard({ buddy, tryAction }: { buddy: Buddy; tryAction: (a: GatedAction) => boolean }) {
  const lvl = LEVEL_META[buddy.level];
  const pc = PACE_META[buddy.pace];
  const buddyTrust = getBuddyTrust(buddy.id);
  return (
    <View style={styles.buddyCard}>
      <View style={styles.buddyHead}>
        <View style={[styles.avatar, { backgroundColor: buddy.avatarColor }]}>
          <Text style={styles.avatarText}>{buddy.avatarInitial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.buddyName}>{buddy.displayName}</Text>
            <TrustBadge level={buddyTrust} size="sm" />
            {buddy.isFriend && (
              <View style={styles.friendBadge}>
                <Ionicons name="checkmark" size={10} color={Colors.brand.forest} />
                <Text style={styles.friendText}>Amis</Text>
              </View>
            )}
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={11} color={Colors.text.muted} />
            <Text style={styles.metaText}>{buddy.zone} · {buddy.distanceRange}</Text>
          </View>
        </View>
        <View style={styles.matchPill}>
          <Text style={styles.matchText}>{buddy.matchScore}%</Text>
        </View>
      </View>

      <Text style={styles.bio} numberOfLines={2}>{buddy.bio}</Text>

      <View style={styles.tagsRow}>
        <Tag tint={lvl.tint}>{lvl.label}</Tag>
        <Tag tint={Colors.brand.forest}>{pc.label}</Tag>
        {buddy.bikes.slice(0, 2).map((b) => (
          <Tag key={b} tint={Colors.text.secondary}>{BIKE_META[b].label}</Tag>
        ))}
        {buddy.vibes.slice(0, 1).map((v) => (
          <Tag key={v} tint={VIBE_META[v].tint}>{VIBE_META[v].label}</Tag>
        ))}
      </View>

      <View style={styles.buddyFoot}>
        <View style={styles.footStats}>
          <FootStat icon="bicycle-outline" text={`${buddy.ridesCount} rides`} />
          <FootStat icon="ribbon-outline" text={`${buddy.badges} badges`} />
          <FootStat icon="language-outline" text={buddy.languages.join(" ")} />
        </View>
        <Pressable
          onPress={() => tryAction("inviteBuddy")}
          style={[styles.inviteBtn, buddy.alreadyInvited && { backgroundColor: Colors.bg.elevated }]}
          disabled={buddy.alreadyInvited}
        >
          <Ionicons
            name={buddy.alreadyInvited ? "checkmark" : "person-add-outline"}
            size={14}
            color={buddy.alreadyInvited ? Colors.text.muted : Colors.text.inverse}
          />
          <Text style={[styles.inviteText, buddy.alreadyInvited && { color: Colors.text.muted }]}>
            {buddy.alreadyInvited ? "Invité" : "Inviter"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// GROUPS : sorties à rejoindre
// ---------------------------------------------------------------------------

function GroupsView({ list, tryAction }: { list: GroupRide[]; tryAction: (a: GatedAction) => boolean }) {
  return (
    <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: 14 }}>
      <Pressable
        onPress={() => tryAction("organizeGroup")}
        style={({ pressed }) => [styles.createCard, pressed && { opacity: 0.92 }]}
      >
        <View style={styles.createIcon}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.brand.orange} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.createTitle}>Organiser ma sortie</Text>
          <Text style={styles.createDesc}>Vérification d'identité requise. Une fois fait, vous pouvez proposer des sorties illimitées.</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.text.muted} />
      </Pressable>

      {list.map((g) => (
        <GroupCard key={g.id} g={g} tryAction={tryAction} />
      ))}
    </View>
  );
}

function GroupCard({ g, tryAction }: { g: GroupRide; tryAction: (a: GatedAction) => boolean }) {
  const lvl = LEVEL_META[g.difficulty];
  const vb = VIBE_META[g.vibe];
  const remaining = g.maxParticipants - g.participants.length - 1;
  const organizerTrust = getBuddyTrust(g.organizer.id);
  return (
    <View style={styles.groupCard}>
      <ImageBackground source={{ uri: g.cover }} style={styles.groupCover} imageStyle={{ borderRadius: 16 }}>
        <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.75)"]} style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />
        <View style={styles.groupCoverTop}>
          <View style={[styles.dateBadge]}>
            <Ionicons name="calendar" size={11} color={Colors.text.inverse} />
            <Text style={styles.dateBadgeText}>{g.dateLabel} · {g.startTime}</Text>
          </View>
          <View style={[styles.vibeBadge, { backgroundColor: `${vb.tint}DD` }]}>
            <Ionicons name={vb.icon as any} size={11} color={Colors.text.inverse} />
            <Text style={styles.vibeBadgeText}>{vb.label}</Text>
          </View>
        </View>
        <View style={styles.groupCoverBottom}>
          <Text style={styles.groupTitle} numberOfLines={2}>{g.title}</Text>
          <View style={styles.groupMeta}>
            <Ionicons name="location" size={11} color="rgba(255,255,255,0.85)" />
            <Text style={styles.groupMetaText}>{g.zone}</Text>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.groupStats}>
        <GroupStat icon="navigate-outline" value={`${g.distanceKm} km`} />
        <GroupStat icon="trending-up-outline" value={`+${g.elevationGain} m`} />
        <GroupStat icon="speedometer-outline" value={PACE_META[g.pace].label} />
        <GroupStat icon="flame-outline" value={lvl.label} />
      </View>

      <View style={styles.groupBottom}>
        <View style={styles.organizerRow}>
          <View style={[styles.smAvatar, { backgroundColor: g.organizer.avatarColor }]}>
            <Text style={styles.smAvatarText}>{g.organizer.avatarInitial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.organizerLabel}>Organisé par</Text>
            <View style={styles.organizerNameRow}>
              <Text style={styles.organizerName}>{g.organizer.displayName}</Text>
              <TrustBadge level={organizerTrust} size="sm" />
            </View>
          </View>
          <View style={styles.spotsBadge}>
            <Ionicons name="people-outline" size={12} color={Colors.brand.forest} />
            <Text style={styles.spotsText}>{remaining} place{remaining > 1 ? "s" : ""}</Text>
          </View>
        </View>

        <Pressable onPress={() => tryAction("joinGroup")} style={styles.joinBtn}>
          <Ionicons name="add-circle-outline" size={16} color={Colors.text.inverse} />
          <Text style={styles.joinText}>Rejoindre la sortie</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// REQUESTS : invitations
// ---------------------------------------------------------------------------

function RequestsView({ list }: { list: BuddyRequest[] }) {
  const received = list.filter((r) => r.direction === "received");
  const sent = list.filter((r) => r.direction === "sent");
  return (
    <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: 14 }}>
      {received.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Reçues</Text>
          {received.map((r) => <RequestCard key={r.id} r={r} />)}
        </>
      )}
      {sent.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Envoyées</Text>
          {sent.map((r) => <RequestCard key={r.id} r={r} />)}
        </>
      )}
      {list.length === 0 && (
        <View style={styles.emptyBox}>
          <Ionicons name="mail-outline" size={32} color={Colors.text.muted} />
          <Text style={styles.emptyTitle}>Aucune invitation</Text>
          <Text style={styles.emptyDesc}>Invitez un copain ou rejoignez une sortie pour démarrer.</Text>
        </View>
      )}
    </View>
  );
}

function RequestCard({ r }: { r: BuddyRequest }) {
  return (
    <View style={styles.reqCard}>
      <View style={styles.buddyHead}>
        <View style={[styles.avatar, { backgroundColor: r.buddy.avatarColor }]}>
          <Text style={styles.avatarText}>{r.buddy.avatarInitial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.buddyName}>{r.buddy.displayName}</Text>
          <Text style={styles.metaText}>{r.sentAt}</Text>
        </View>
        <View style={[styles.dirBadge, { backgroundColor: r.direction === "received" ? "rgba(225,90,35,0.12)" : Colors.bg.elevated }]}>
          <Text style={[styles.dirText, { color: r.direction === "received" ? Colors.brand.orange : Colors.text.muted }]}>
            {r.direction === "received" ? "Reçue" : "Envoyée"}
          </Text>
        </View>
      </View>
      <Text style={styles.reqMsg}>« {r.message} »</Text>
      {r.direction === "received" ? (
        <View style={styles.reqActions}>
          <Pressable style={[styles.actionBtn, styles.actionDecline]}>
            <Ionicons name="close" size={16} color={Colors.text.secondary} />
            <Text style={styles.declineText}>Décliner</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, styles.actionAccept]}>
            <Ionicons name="checkmark" size={16} color={Colors.text.inverse} />
            <Text style={styles.acceptText}>Accepter</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.pendingBox}>
          <Ionicons name="time-outline" size={13} color={Colors.text.muted} />
          <Text style={styles.pendingText}>En attente de réponse</Text>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Petits composants partagés
// ---------------------------------------------------------------------------

function Chip({ label, icon, active, onPress }: { label: string; icon?: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      {icon && <Ionicons name={icon as any} size={12} color={active ? Colors.text.inverse : Colors.text.secondary} />}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Tag({ tint, children }: { tint: string; children: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: `${tint}15`, borderColor: `${tint}30` }]}>
      <Text style={[styles.tagText, { color: tint }]}>{children}</Text>
    </View>
  );
}

function FootStat({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.footStat}>
      <Ionicons name={icon} size={11} color={Colors.text.muted} />
      <Text style={styles.footStatText}>{text}</Text>
    </View>
  );
}

function GroupStat({ icon, value }: { icon: any; value: string }) {
  return (
    <View style={styles.groupStat}>
      <Ionicons name={icon} size={13} color={Colors.brand.orange} />
      <Text style={styles.groupStatText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18 },

  trustBanner: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: Spacing.lg, padding: 10, borderRadius: Radius.sm, backgroundColor: "rgba(13,79,61,0.06)", borderWidth: 1, borderColor: "rgba(13,79,61,0.2)", marginBottom: Spacing.sm },
  trustBannerText: { flex: 1, ...Type.bodyXs, color: Colors.brand.forest, fontSize: 11.5, lineHeight: 15 },
  trustBannerLink: { ...Type.bodyXs, color: Colors.brand.orange, fontWeight: "700", fontSize: 11.5 },
  tabs: { flexDirection: "row", paddingHorizontal: Spacing.lg, gap: 0, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle, marginBottom: Spacing.md },
  tab: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 5, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: Colors.brand.orange },
  tabText: { ...Type.bodyXs, color: Colors.text.muted, fontWeight: "700", fontSize: 11.5 },
  tabTextActive: { color: Colors.brand.orange },

  filterLabel: { ...Type.label, color: Colors.text.muted, marginHorizontal: Spacing.lg, marginTop: Spacing.md, marginBottom: 6, fontSize: 10.5 },
  chipsScroll: { flexGrow: 0, maxHeight: 50 },
  chipsRow: { paddingHorizontal: Spacing.lg, alignItems: "center", paddingVertical: 4 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, height: 32, marginRight: 6, borderRadius: Radius.pill, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle },
  chipActive: { backgroundColor: Colors.brand.ink, borderColor: Colors.brand.ink },
  chipText: { ...Type.bodyXs, color: Colors.text.secondary, fontWeight: "700", fontSize: 12 },
  chipTextActive: { color: Colors.text.inverse },

  radiusRow: { flexDirection: "row", gap: 6, paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  radiusBtn: { flex: 1, height: 36, alignItems: "center", justifyContent: "center", borderRadius: Radius.pill, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle },
  radiusBtnActive: { backgroundColor: Colors.brand.orange, borderColor: Colors.brand.orange },
  radiusText: { ...Type.bodyXs, color: Colors.text.secondary, fontWeight: "700", fontSize: 12 },
  radiusTextActive: { color: Colors.text.inverse },

  countRow: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  countText: { ...Type.label, color: Colors.text.muted, fontSize: 10 },

  buddyCard: { padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle, gap: Spacing.sm },
  buddyHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.brand.forest, alignItems: "center", justifyContent: "center" },
  avatarText: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "700", fontSize: 13 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  buddyName: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 15 },
  friendBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.pill, backgroundColor: "rgba(13,79,61,0.12)" },
  friendText: { ...Type.bodyXs, color: Colors.brand.forest, fontWeight: "700", fontSize: 10 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  metaText: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 11 },
  matchPill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: Radius.pill, backgroundColor: "rgba(13,79,61,0.12)" },
  matchText: { ...Type.bodyXs, color: Colors.brand.forest, fontWeight: "700", fontSize: 12 },
  bio: { ...Type.bodyXs, color: Colors.text.secondary, lineHeight: 17, fontSize: 12.5 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill, borderWidth: 1 },
  tagText: { ...Type.bodyXs, fontWeight: "700", fontSize: 10.5 },
  buddyFoot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 4, borderTopWidth: 1, borderTopColor: Colors.border.subtle, gap: 8 },
  footStats: { flex: 1, flexDirection: "row", gap: 10, flexWrap: "wrap" },
  footStat: { flexDirection: "row", alignItems: "center", gap: 3 },
  footStatText: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 10.5 },
  inviteBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.pill, backgroundColor: Colors.brand.orange },
  inviteText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700", fontSize: 12 },

  createCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.brand.orange },
  createIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(225,90,35,0.12)", alignItems: "center", justifyContent: "center" },
  createTitle: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700" },
  createDesc: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 2, lineHeight: 16 },

  groupCard: { backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle, overflow: "hidden" },
  groupCover: { height: 170, justifyContent: "space-between", padding: 12, margin: Spacing.sm, borderRadius: 16 },
  groupCoverTop: { flexDirection: "row", justifyContent: "space-between" },
  dateBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: Radius.pill, backgroundColor: "rgba(0,0,0,0.45)" },
  dateBadgeText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700", fontSize: 11 },
  vibeBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.pill },
  vibeBadgeText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700", fontSize: 10.5 },
  groupCoverBottom: { gap: 4 },
  groupTitle: { ...Type.display3, color: Colors.text.inverse, fontSize: 18, lineHeight: 22 },
  groupMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  groupMetaText: { ...Type.bodyXs, color: "rgba(255,255,255,0.85)", fontSize: 11.5 },

  groupStats: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, gap: 6 },
  groupStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  groupStatText: { ...Type.bodyXs, color: Colors.text.primary, fontWeight: "700", fontSize: 12 },

  groupBottom: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border.subtle, paddingTop: Spacing.sm },
  organizerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  smAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.brand.forest, alignItems: "center", justifyContent: "center" },
  smAvatarText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700", fontSize: 11 },
  organizerLabel: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 10 },
  organizerNameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  organizerName: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 13 },
  spotsBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: Radius.pill, backgroundColor: "rgba(13,79,61,0.1)" },
  spotsText: { ...Type.bodyXs, color: Colors.brand.forest, fontWeight: "700", fontSize: 11 },
  joinBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 11, borderRadius: Radius.pill, backgroundColor: Colors.brand.forest },
  joinText: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "700", fontSize: 13 },

  sectionLabel: { ...Type.label, color: Colors.text.muted, marginBottom: 6 },
  reqCard: { padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle, gap: Spacing.sm },
  dirBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill },
  dirText: { ...Type.bodyXs, fontWeight: "700", fontSize: 10 },
  reqMsg: { ...Type.bodySm, color: Colors.text.secondary, fontStyle: "italic", lineHeight: 19, fontSize: 13 },
  reqActions: { flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: Radius.pill },
  actionDecline: { backgroundColor: Colors.bg.elevated },
  actionAccept: { backgroundColor: Colors.brand.forest },
  declineText: { ...Type.bodySm, color: Colors.text.secondary, fontWeight: "700", fontSize: 13 },
  acceptText: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "700", fontSize: 13 },
  pendingBox: { flexDirection: "row", alignItems: "center", gap: 5, paddingTop: 4 },
  pendingText: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 12 },

  emptyBox: { alignItems: "center", paddingVertical: Spacing.xl, paddingHorizontal: Spacing.lg, gap: 6 },
  emptyTitle: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", marginTop: 4 },
  emptyDesc: { ...Type.bodyXs, color: Colors.text.muted, textAlign: "center" },
});

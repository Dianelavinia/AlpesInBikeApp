import { View, Text, Pressable, StyleSheet, ScrollView, Alert, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { BUDDIES, BIKE_META, LEVEL_META, PACE_META, VIBE_META } from "@/lib/buddies";
import { getBuddyTrust } from "@/lib/trust";
import TrustBadge from "@/components/TrustBadge";
import TrustLevelsModal from "@/components/TrustLevelsModal";
import { REPORT_REASONS, type ReportReason, blockUser, reportUser } from "@/lib/safety";

export default function BuddyDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const buddy = BUDDIES.find((b) => b.id === id);
  const [trustModalOpen, setTrustModalOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason | null>(null);
  const [reportMessage, setReportMessage] = useState("");

  if (!buddy) return null;

  const trust = getBuddyTrust(buddy.id);
  const lvl = LEVEL_META[buddy.level];
  const pc = PACE_META[buddy.pace];

  function onBlock() {
    Alert.alert(
      `Bloquer ${buddy!.displayName} ?`,
      "Vous ne verrez plus son profil et il ne pourra plus vous inviter ni vous contacter. Vous pouvez débloquer plus tard dans Réglages.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Bloquer",
          style: "destructive",
          onPress: async () => {
            await blockUser(buddy!.id);
            router.back();
          },
        },
      ],
    );
  }

  async function submitReport() {
    if (!reportReason) return;
    await reportUser({
      reportedId: buddy!.id,
      reason: reportReason,
      message: reportMessage,
      context: "buddy_profile",
    });
    setReportOpen(false);
    setReportReason(null);
    setReportMessage("");
    Alert.alert(
      "Signalement enregistré",
      "Merci. Notre équipe modération examine sous 48 h. Pas de nouvelle = signalement classé sans suite. En cas d'action, vous serez prévenu.",
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Profil rideur</Text>
        <Pressable onPress={onBlock} style={styles.headBtn}>
          <Ionicons name="ellipsis-horizontal" size={22} color={Colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.heroCard}>
          <View style={[styles.avatarBig, { backgroundColor: buddy.avatarColor }]}>
            <Text style={styles.avatarBigText}>{buddy.avatarInitial}</Text>
          </View>
          <Text style={styles.pseudo}>{buddy.displayName}</Text>
          <Pressable onPress={() => setTrustModalOpen(true)}>
            <TrustBadge level={trust} size="md" />
          </Pressable>
          <View style={styles.zoneRow}>
            <Ionicons name="location-outline" size={13} color={Colors.text.muted} />
            <Text style={styles.zone}>{buddy.zone} · {buddy.distanceRange}</Text>
          </View>
          <View style={styles.matchPill}>
            <Ionicons name="sparkles" size={12} color={Colors.brand.orange} />
            <Text style={styles.matchText}>Compatibilité {buddy.matchScore}%</Text>
          </View>
        </View>

        <View style={styles.bioCard}>
          <Text style={styles.bioText}>{buddy.bio}</Text>
        </View>

        <View style={styles.statsRow}>
          <Stat icon="bicycle-outline" value={buddy.ridesCount.toString()} label="Rides" />
          <Stat icon="ribbon-outline" value={buddy.badges.toString()} label="Badges" />
          <Stat icon="language-outline" value={buddy.languages.join(" ")} label="Langues" />
        </View>

        <Section title="Profil rideur">
          <DetailRow icon="speedometer-outline" label="Niveau" value={lvl.label} tint={lvl.tint} />
          <DetailRow icon="trending-up-outline" label="Allure" value={`${pc.label} · ${pc.speed}`} tint={Colors.brand.forest} />
          <DetailRow icon="bicycle-outline" label="Vélos" value={buddy.bikes.map((b) => BIKE_META[b].label).join(", ")} tint={Colors.text.secondary} />
          <DetailRow icon="people-outline" label="Ambiance" value={buddy.vibes.map((v) => VIBE_META[v].label).join(", ")} tint={Colors.brand.forest} />
        </Section>

        <View style={styles.safetyNote}>
          <Ionicons name="shield-outline" size={14} color={Colors.text.muted} />
          <Text style={styles.safetyText}>
            Le vrai nom, la ville exacte et le contact direct ne sont révélés qu'après acceptation mutuelle d'une invitation.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={() => router.push(`/messages/new?to=${buddy.id}` as any)} style={[styles.actionBtn, styles.primaryBtn]}>
            <Ionicons name="person-add-outline" size={16} color={Colors.text.inverse} />
            <Text style={styles.primaryText}>Inviter à rider ensemble</Text>
          </Pressable>
          <Pressable onPress={() => router.push(`/messages/new?to=${buddy.id}` as any)} style={[styles.actionBtn, styles.secondaryBtn]}>
            <Ionicons name="chatbubble-outline" size={16} color={Colors.brand.forest} />
            <Text style={styles.secondaryText}>Envoyer un message</Text>
          </Pressable>
        </View>

        <View style={styles.dangerZone}>
          <Pressable onPress={() => setReportOpen(true)} style={styles.dangerBtn}>
            <Ionicons name="flag-outline" size={14} color={Colors.status.error} />
            <Text style={styles.dangerText}>Signaler ce profil</Text>
          </Pressable>
          <Pressable onPress={onBlock} style={styles.dangerBtn}>
            <Ionicons name="ban-outline" size={14} color={Colors.status.error} />
            <Text style={styles.dangerText}>Bloquer</Text>
          </Pressable>
        </View>
      </ScrollView>

      <TrustLevelsModal visible={trustModalOpen} onClose={() => setTrustModalOpen(false)} />

      <Modal visible={reportOpen} transparent animationType="slide" onRequestClose={() => setReportOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setReportOpen(false)}>
          <Pressable style={styles.reportSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={styles.reportTitle}>Signaler ce profil</Text>
            <Text style={styles.reportDesc}>Notre équipe modération examine chaque signalement sous 48 h.</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {REPORT_REASONS.map((r) => (
                <Pressable
                  key={r.id}
                  onPress={() => setReportReason(r.id)}
                  style={[styles.reasonRow, reportReason === r.id && styles.reasonRowActive]}
                >
                  <View style={[styles.radio, reportReason === r.id && styles.radioActive]}>
                    {reportReason === r.id && <View style={styles.radioDot} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reasonLabel}>{r.label}</Text>
                    <Text style={styles.reasonDesc}>{r.description}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
            <TextInput
              value={reportMessage}
              onChangeText={setReportMessage}
              placeholder="Détails optionnels (max 500 caractères)"
              placeholderTextColor={Colors.text.muted}
              multiline
              maxLength={500}
              style={styles.reportInput}
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable onPress={() => setReportOpen(false)} style={[styles.actionBtn, styles.secondaryBtn, { flex: 1 }]}>
                <Text style={styles.secondaryText}>Annuler</Text>
              </Pressable>
              <Pressable
                onPress={submitReport}
                disabled={!reportReason}
                style={[styles.actionBtn, styles.primaryBtn, { flex: 1, backgroundColor: Colors.status.error }, !reportReason && { opacity: 0.5 }]}
              >
                <Text style={styles.primaryText}>Envoyer</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function DetailRow({ icon, label, value, tint }: { icon: any; label: string; value: string; tint: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={[styles.detailIcon, { backgroundColor: `${tint}18` }]}>
        <Ionicons name={icon} size={16} color={tint} />
      </View>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function Stat({ icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={16} color={Colors.brand.orange} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 17 },

  heroCard: { alignItems: "center", paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, gap: 8 },
  avatarBig: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" },
  avatarBigText: { ...Type.display1, color: Colors.text.inverse, fontSize: 36 },
  pseudo: { ...Type.display2, color: Colors.text.primary, fontSize: 26, marginTop: 8 },
  zoneRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  zone: { ...Type.bodySm, color: Colors.text.muted },
  matchPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 11, paddingVertical: 5, borderRadius: Radius.pill, backgroundColor: "rgba(225,90,35,0.12)", marginTop: 6 },
  matchText: { ...Type.bodyXs, color: Colors.brand.orange, fontWeight: "700" },

  bioCard: { marginHorizontal: Spacing.lg, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle },
  bioText: { ...Type.body, color: Colors.text.primary, lineHeight: 22, fontSize: 15, fontStyle: "italic" },

  statsRow: { flexDirection: "row", gap: 8, paddingHorizontal: Spacing.lg, marginTop: Spacing.md },
  stat: { flex: 1, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle, alignItems: "center", gap: 4 },
  statValue: { ...Type.display3, color: Colors.text.primary, fontSize: 18 },
  statLabel: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 11 },

  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
  sectionLabel: { ...Type.label, color: Colors.text.muted, marginBottom: 8 },
  sectionCard: { backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle, overflow: "hidden" },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle },
  detailIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  detailLabel: { ...Type.bodySm, color: Colors.text.muted, flex: 1 },
  detailValue: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", maxWidth: 200, textAlign: "right" },

  safetyNote: { flexDirection: "row", gap: 8, padding: 12, marginHorizontal: Spacing.lg, marginTop: Spacing.md, borderRadius: Radius.sm, backgroundColor: Colors.bg.elevated },
  safetyText: { flex: 1, ...Type.bodyXs, color: Colors.text.muted, lineHeight: 17 },

  actions: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg, gap: 8 },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: Radius.pill },
  primaryBtn: { backgroundColor: Colors.brand.orange },
  primaryText: { ...Type.body, color: Colors.text.inverse, fontWeight: "700", fontSize: 15 },
  secondaryBtn: { backgroundColor: "rgba(13,79,61,0.08)", borderWidth: 1, borderColor: "rgba(13,79,61,0.25)" },
  secondaryText: { ...Type.body, color: Colors.brand.forest, fontWeight: "700", fontSize: 15 },

  dangerZone: { flexDirection: "row", justifyContent: "center", gap: 18, marginTop: Spacing.lg, paddingHorizontal: Spacing.lg },
  dangerBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 8 },
  dangerText: { ...Type.bodyXs, color: Colors.status.error, fontWeight: "600", textDecorationLine: "underline" },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  reportSheet: { backgroundColor: Colors.bg.base, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: Spacing.lg, paddingTop: 10, paddingBottom: 24, gap: Spacing.sm },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border.base, alignSelf: "center", marginBottom: 4 },
  reportTitle: { ...Type.display3, color: Colors.text.primary, fontSize: 20, textAlign: "center" },
  reportDesc: { ...Type.bodySm, color: Colors.text.muted, textAlign: "center", marginBottom: 4 },
  reasonRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle, backgroundColor: Colors.bg.card, marginBottom: 6 },
  reasonRowActive: { borderColor: Colors.status.error, backgroundColor: "rgba(184,67,26,0.06)" },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: Colors.border.base, alignItems: "center", justifyContent: "center", marginTop: 2 },
  radioActive: { borderColor: Colors.status.error },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.status.error },
  reasonLabel: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700" },
  reasonDesc: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 2, lineHeight: 16 },
  reportInput: { borderWidth: 1, borderColor: Colors.border.base, borderRadius: Radius.md, padding: 12, minHeight: 60, ...Type.bodySm, color: Colors.text.primary, textAlignVertical: "top" as any, marginTop: 4 },
});

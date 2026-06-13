import { View, Text, Pressable, StyleSheet, ScrollView, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import RideMap from "@/components/RideMap";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";

export default function LiveSharing() {
  const router = useRouter();
  const [isLive, setIsLive] = useState(true);
  const publicUrl = "alpinebike.app/live/marie-r-2026";

  async function shareLink() {
    try {
      await Share.share({
        message: `Suis mon ride en direct sur https://${publicUrl}`,
      });
    } catch (e) {}
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Suivi en direct</Text>
        <Pressable style={styles.headBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.statusCard}>
          <LinearGradient colors={isLive ? ["#EF4444", "#B91C1C"] : [Colors.bg.elevated, Colors.bg.card]} style={StyleSheet.absoluteFill} />
          <View style={styles.statusHead}>
            <View style={styles.liveBadge}>
              <View style={styles.livePulse} />
              <Text style={styles.liveText}>{isLive ? "EN DIRECT" : "ARRÊTÉ"}</Text>
            </View>
            <View style={styles.viewers}>
              <Ionicons name="eye-outline" size={14} color={Colors.text.inverse} />
              <Text style={styles.viewersText}>3 personnes suivent</Text>
            </View>
          </View>
          <Text style={styles.statusTitle}>Boucle du Revard</Text>
          <Text style={styles.statusSubtitle}>Démarré il y a 1h 24min</Text>
          <View style={styles.statusStats}>
            <View style={styles.statusStat}>
              <Text style={styles.statusStatValue}>14,2</Text>
              <Text style={styles.statusStatUnit}>km</Text>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusStat}>
              <Text style={styles.statusStatValue}>520</Text>
              <Text style={styles.statusStatUnit}>m D+</Text>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusStat}>
              <Text style={styles.statusStatValue}>18,4</Text>
              <Text style={styles.statusStatUnit}>km/h moy</Text>
            </View>
          </View>
        </View>

        <View style={styles.mapSection}>
          <RideMap height={200} seed={42} />
          <View style={styles.mapBadgeLive}>
            <View style={styles.livePulseSmall} />
            <Text style={styles.mapBadgeLiveText}>LIVE</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Lien public à partager</Text>
          <View style={styles.linkCard}>
            <View style={styles.linkIcon}>
              <Ionicons name="link" size={20} color={Colors.brand.orange} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.linkUrl}>{publicUrl}</Text>
              <Text style={styles.linkHint}>Pas besoin de compte pour suivre</Text>
            </View>
            <Pressable style={styles.copyBtn}>
              <Ionicons name="copy-outline" size={18} color={Colors.brand.orange} />
            </Pressable>
          </View>
          <Pressable onPress={shareLink} style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.85 }]}>
            <Ionicons name="share-social" size={18} color={Colors.text.inverse} />
            <Text style={styles.shareText}>Partager le lien</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Personnes qui suivent</Text>
          <View style={{ gap: 8 }}>
            <Follower name="Maman" avatar="MM" status="Suit depuis 1h 24min" color={Colors.brand.forest} />
            <Follower name="Pierre (conjoint)" avatar="PR" status="Suit depuis 1h 20min" color={Colors.brand.orange} />
            <Follower name="Sophie (amie)" avatar="SO" status="A rejoint il y a 15 min" color="#7C3AED" />
          </View>
          <Pressable style={styles.inviteBtn}>
            <Ionicons name="person-add-outline" size={16} color={Colors.brand.orange} />
            <Text style={styles.inviteText}>Inviter quelqu'un d'autre</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notifications automatiques</Text>
          <View style={{ gap: 8 }}>
            <NotifRow label="Au départ" desc="SMS envoyé à 14h05" sent />
            <NotifRow label="Pause détectée" desc="Plus de 10 minutes d'arrêt" />
            <NotifRow label="À mi-parcours" desc="50% du trajet effectué" sent />
            <NotifRow label="À l'arrivée" desc="Quand vous terminez le ride" />
            <NotifRow label="Si chute détectée" desc="Position et alerte immédiate" alert />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Confidentialité</Text>
          <View style={{ gap: 8 }}>
            <SettingRow icon="lock-closed-outline" label="Lien expire après le ride" hint="Actif" />
            <SettingRow icon="eye-off-outline" label="Masquer mon adresse exacte au départ" hint="Zone privée 200m" />
            <SettingRow icon="time-outline" label="Position rafraîchie toutes les" hint="10 secondes" />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={() => setIsLive(!isLive)} style={({ pressed }) => [isLive ? styles.stopBtn : styles.startBtn, pressed && { opacity: 0.85 }]}>
          <Ionicons name={isLive ? "stop" : "play"} size={18} color={Colors.text.inverse} />
          <Text style={styles.stopText}>{isLive ? "Arrêter le suivi" : "Démarrer le suivi"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Follower({ name, avatar, status, color }: { name: string; avatar: string; status: string; color: string }) {
  return (
    <View style={styles.follower}>
      <View style={[styles.followerAvatar, { backgroundColor: color }]}>
        <Text style={styles.followerAvatarText}>{avatar}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.followerName}>{name}</Text>
        <Text style={styles.followerStatus}>{status}</Text>
      </View>
      <Pressable style={styles.kickBtn}>
        <Ionicons name="close" size={16} color={Colors.text.muted} />
      </Pressable>
    </View>
  );
}

function NotifRow({ label, desc, sent, alert }: { label: string; desc: string; sent?: boolean; alert?: boolean }) {
  return (
    <View style={[styles.notif, alert && { borderColor: "rgba(239,68,68,0.3)", backgroundColor: "rgba(239,68,68,0.04)" }]}>
      <View style={[styles.notifIcon, sent && { backgroundColor: "rgba(13,79,61,0.12)" }, alert && { backgroundColor: "rgba(239,68,68,0.12)" }]}>
        <Ionicons name={sent ? "checkmark" : alert ? "warning" : "ellipse-outline"} size={14} color={sent ? Colors.brand.forest : alert ? "#EF4444" : Colors.text.muted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.notifLabel}>{label}</Text>
        <Text style={styles.notifDesc}>{desc}</Text>
      </View>
    </View>
  );
}

function SettingRow({ icon, label, hint }: { icon: any; label: string; hint: string }) {
  return (
    <Pressable style={styles.setting}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={16} color={Colors.brand.forest} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingHint}>{hint}</Text>
      <Ionicons name="chevron-forward" size={14} color={Colors.text.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18 },
  statusCard: { margin: Spacing.lg, padding: Spacing.lg, borderRadius: Radius.lg, overflow: "hidden", gap: 4 },
  statusHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, backgroundColor: "rgba(255,255,255,0.2)" },
  livePulse: { width: 7, height: 7, borderRadius: 4, backgroundColor: "white" },
  liveText: { ...Type.label, color: Colors.text.inverse, fontSize: 10 },
  viewers: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewersText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "600" },
  statusTitle: { ...Type.display2, color: Colors.text.inverse, marginTop: 10, fontSize: 24 },
  statusSubtitle: { ...Type.bodySm, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  statusStats: { flexDirection: "row", alignItems: "center", marginTop: Spacing.lg, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.15)" },
  statusStat: { flex: 1, alignItems: "center" },
  statusStatValue: { ...Type.display2, color: Colors.text.inverse, fontSize: 22 },
  statusStatUnit: { ...Type.bodyXs, color: "rgba(255,255,255,0.7)" },
  statusDivider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.15)" },
  mapSection: { marginHorizontal: Spacing.lg, position: "relative" },
  mapBadgeLive: { position: "absolute", top: 12, left: 12, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.pill, backgroundColor: "#EF4444" },
  livePulseSmall: { width: 5, height: 5, borderRadius: 3, backgroundColor: "white" },
  mapBadgeLiveText: { color: "white", fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
  sectionLabel: { ...Type.label, color: Colors.text.muted, marginBottom: Spacing.sm },
  linkCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.brand.orange + "30" },
  linkIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(225,90,35,0.1)", alignItems: "center", justifyContent: "center" },
  linkUrl: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 13 },
  linkHint: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 2 },
  copyBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(225,90,35,0.1)", alignItems: "center", justifyContent: "center" },
  shareBtn: { marginTop: 8, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, backgroundColor: Colors.brand.orange, paddingVertical: 12, borderRadius: Radius.pill },
  shareText: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "700" },
  follower: { flexDirection: "row", alignItems: "center", gap: 12, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle },
  followerAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  followerAvatarText: { color: "white", fontWeight: "700", fontSize: 13 },
  followerName: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 14 },
  followerStatus: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 2 },
  kickBtn: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  inviteBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, padding: Spacing.md, marginTop: 8, borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.brand.orange, borderStyle: "dashed" },
  inviteText: { ...Type.bodySm, color: Colors.brand.orange, fontWeight: "700" },
  notif: { flexDirection: "row", alignItems: "center", gap: 10, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle },
  notifIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.bg.elevated, alignItems: "center", justifyContent: "center" },
  notifLabel: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "600", fontSize: 13 },
  notifDesc: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 2 },
  setting: { flexDirection: "row", alignItems: "center", gap: 10, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle },
  settingIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(13,79,61,0.1)", alignItems: "center", justifyContent: "center" },
  settingLabel: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "500", flex: 1, fontSize: 13 },
  settingHint: { ...Type.bodyXs, color: Colors.text.muted },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: Spacing.lg, backgroundColor: Colors.bg.card, borderTopWidth: 1, borderTopColor: Colors.border.subtle },
  stopBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, backgroundColor: "#EF4444", paddingVertical: 16, borderRadius: Radius.pill },
  startBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, backgroundColor: Colors.brand.forest, paddingVertical: 16, borderRadius: Radius.pill },
  stopText: { ...Type.body, color: Colors.text.inverse, fontWeight: "700", fontSize: 15 },
});

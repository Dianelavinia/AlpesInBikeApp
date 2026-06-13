import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import FamilyMap from "@/components/FamilyMap";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { FAMILY_MEMBERS, FAMILY_ALERTS, STATUS_META, ROLE_META, type FamilyMember, type FamilyAlert } from "@/lib/family";

export default function FamilyHome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <View>
          <Text style={styles.title}>Famille Roche</Text>
          <Text style={styles.subtitle}>4 membres · 3 en route</Text>
        </View>
        <Pressable style={styles.headBtn}>
          <Ionicons name="settings-outline" size={22} color={Colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.mapWrap}>
          <FamilyMap members={FAMILY_MEMBERS} />
          <View style={styles.mapBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.mapBadgeText}>EN DIRECT</Text>
          </View>
          <View style={styles.zoomControls}>
            <Pressable style={styles.zoomBtn}><Ionicons name="add" size={20} color={Colors.text.primary} /></Pressable>
            <Pressable style={styles.zoomBtn}><Ionicons name="remove" size={20} color={Colors.text.primary} /></Pressable>
            <Pressable style={styles.zoomBtn}><Ionicons name="locate-outline" size={18} color={Colors.text.primary} /></Pressable>
          </View>
        </View>

        {FAMILY_ALERTS.length > 0 && (
          <View style={styles.alerts}>
            {FAMILY_ALERTS.map((a) => (
              <AlertCard key={a.id} alert={a} />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Membres en route</Text>
            <Pressable style={styles.addBtn}>
              <Ionicons name="add" size={16} color={Colors.brand.orange} />
              <Text style={styles.addText}>Inviter</Text>
            </Pressable>
          </View>
          <View style={{ gap: 10 }}>
            {FAMILY_MEMBERS.map((m) => (
              <MemberCard key={m.id} member={m} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertes configurables</Text>
          <View style={{ gap: 8 }}>
            <SettingRow icon="resize-outline" label="Distance max d'un membre" value="300 m" />
            <SettingRow icon="time-outline" label="Alerte arrêt prolongé" value="5 min" />
            <SettingRow icon="navigate-outline" label="Sortie d'itinéraire" value="50 m" />
            <SettingRow icon="battery-half-outline" label="Batterie VAE basse" value="20%" />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={({ pressed }) => [styles.callBtn, pressed && { opacity: 0.85 }]}>
          <Ionicons name="call" size={20} color={Colors.text.primary} />
        </Pressable>
        <Pressable style={({ pressed }) => [styles.regroupBtn, pressed && { opacity: 0.85 }]}>
          <Ionicons name="people" size={18} color={Colors.text.inverse} />
          <Text style={styles.regroupText}>Regrouper la famille</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function AlertCard({ alert }: { alert: FamilyAlert }) {
  const icon = alert.type === "battery_low" ? "battery-half" : alert.type === "stopped" ? "pause-circle" : alert.type === "fall" ? "warning" : "navigate";
  const tone = alert.severity === "critical" ? Colors.brand.orange : alert.severity === "warning" ? "#F59E0B" : Colors.brand.forest;
  return (
    <Pressable style={styles.alertCard}>
      <View style={[styles.alertIcon, { backgroundColor: `${tone}15` }]}>
        <Ionicons name={icon} size={18} color={tone} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.alertName}>{alert.memberName}</Text>
        <Text style={styles.alertMessage}>{alert.message}</Text>
      </View>
      <Text style={styles.alertTime}>{alert.time}</Text>
    </Pressable>
  );
}

function MemberCard({ member }: { member: FamilyMember }) {
  const status = STATUS_META[member.status];
  const role = ROLE_META[member.role];

  return (
    <Pressable style={({ pressed }) => [styles.member, pressed && { opacity: 0.85 }]}>
      <View style={[styles.memberAvatar, { backgroundColor: member.role === "parent" ? Colors.brand.forest : Colors.brand.orange }]}>
        <Text style={styles.memberAvatarText}>{member.avatar}</Text>
        <View style={[styles.statusDot, { backgroundColor: status.color }]} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.memberHead}>
          <Text style={styles.memberName}>{member.name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: role.bg }]}>
            <Text style={[styles.roleText, { color: role.color }]}>{role.label}{member.age ? ` · ${member.age}a` : ""}</Text>
          </View>
        </View>
        <View style={styles.memberStats}>
          <Stat icon="navigate-outline" value={`${member.totalKm} km`} />
          {member.status === "riding" && <Stat icon="speedometer-outline" value={`${member.pace.toFixed(1)} km/h`} />}
          {member.battery !== undefined && (
            <Stat
              icon={member.battery < 30 ? "battery-half-outline" : "battery-full-outline"}
              value={`${member.battery}%`}
              tone={member.battery < 30 ? "warning" : undefined}
            />
          )}
          <View style={styles.distancePill}>
            <Ionicons name="location-outline" size={11} color={Colors.text.muted} />
            <Text style={styles.distanceText}>{member.distanceFromYou === 0 ? "Vous" : `à ${(member.distanceFromYou * 1000).toFixed(0)} m`}</Text>
          </View>
        </View>
      </View>
      <Pressable style={styles.iconBtn}>
        <Ionicons name="navigate" size={18} color={Colors.brand.orange} />
      </Pressable>
    </Pressable>
  );
}

function Stat({ icon, value, tone }: { icon: any; value: string; tone?: "warning" }) {
  return (
    <View style={styles.memberStat}>
      <Ionicons name={icon} size={11} color={tone === "warning" ? "#F59E0B" : Colors.text.muted} />
      <Text style={[styles.memberStatText, tone === "warning" && { color: "#F59E0B" }]}>{value}</Text>
    </View>
  );
}

function SettingRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Pressable style={styles.setting}>
      <View style={styles.settingIcon}><Ionicons name={icon} size={18} color={Colors.brand.forest} /></View>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.text.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18, textAlign: "center" },
  subtitle: { ...Type.bodyXs, color: Colors.text.muted, textAlign: "center", marginTop: 2 },
  mapWrap: { marginHorizontal: Spacing.lg, marginTop: Spacing.sm, borderRadius: Radius.lg, overflow: "hidden", position: "relative" },
  mapBadge: { position: "absolute", top: 12, left: 12, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, backgroundColor: "rgba(255,255,255,0.95)" },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#EF4444" },
  mapBadgeText: { ...Type.label, fontSize: 10, color: Colors.brand.orange },
  zoomControls: { position: "absolute", right: 12, top: 12, gap: 6 },
  zoomBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.95)", alignItems: "center", justifyContent: "center" },
  alerts: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: 8 },
  alertCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle },
  alertIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  alertName: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 14 },
  alertMessage: { ...Type.bodyXs, color: Colors.text.secondary, marginTop: 2 },
  alertTime: { ...Type.bodyXs, color: Colors.text.muted },
  section: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.md },
  sectionTitle: { ...Type.display4, color: Colors.text.primary, fontSize: 17 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: "rgba(225,90,35,0.1)" },
  addText: { ...Type.bodySm, color: Colors.brand.orange, fontWeight: "700", fontSize: 12 },
  member: { flexDirection: "row", alignItems: "center", gap: 12, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle },
  memberAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", position: "relative" },
  memberAvatarText: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "700", fontSize: 14 },
  statusDot: { position: "absolute", bottom: -2, right: -2, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: Colors.bg.card },
  memberHead: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  memberName: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 14 },
  roleBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.pill },
  roleText: { ...Type.bodyXs, fontWeight: "700", fontSize: 10 },
  memberStats: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" },
  memberStat: { flexDirection: "row", alignItems: "center", gap: 3 },
  memberStatText: { ...Type.bodyXs, color: Colors.text.secondary, fontWeight: "600", fontSize: 11 },
  distancePill: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.pill, backgroundColor: Colors.bg.elevated },
  distanceText: { ...Type.bodyXs, color: Colors.text.muted, fontWeight: "600", fontSize: 10 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(225,90,35,0.1)", alignItems: "center", justifyContent: "center" },
  setting: { flexDirection: "row", alignItems: "center", gap: 12, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle },
  settingIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(13,79,61,0.1)", alignItems: "center", justifyContent: "center" },
  settingLabel: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "500", flex: 1 },
  settingValue: { ...Type.bodySm, color: Colors.text.muted },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: Spacing.lg, backgroundColor: Colors.bg.card, borderTopWidth: 1, borderTopColor: Colors.border.subtle, flexDirection: "row", gap: 10 },
  callBtn: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border.base },
  regroupBtn: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, backgroundColor: Colors.brand.forest, paddingVertical: 14, borderRadius: Radius.pill },
  regroupText: { ...Type.body, color: Colors.text.inverse, fontWeight: "700", fontSize: 15 },
});

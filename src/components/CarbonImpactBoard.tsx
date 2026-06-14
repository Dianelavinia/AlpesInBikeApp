import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { useCarbonStats, getFunEquivalents, getProjections, getMotivationalMessage } from "@/lib/carbon";

/**
 * Bloc visuel motivant à insérer dans l'écran bilan carbone.
 * Équivalents concrets parlants, projections fin d'année, message à palier.
 */

export default function CarbonImpactBoard() {
  const { stats } = useCarbonStats();
  const equivalents = getFunEquivalents(stats.co2Saved);
  const projections = getProjections(stats);
  const message = getMotivationalMessage(stats.co2Saved);
  const yearLabel = new Date().getFullYear();

  return (
    <View style={{ gap: Spacing.lg }}>
      <View style={styles.motivationCard}>
        <LinearGradient colors={[Colors.brand.orange, Colors.brand.orangeDark]} style={StyleSheet.absoluteFill} />
        <View style={styles.motivationIcon}>
          <Ionicons name={message.icon as any} size={26} color={Colors.text.inverse} />
        </View>
        <Text style={styles.motivationHead}>{message.headline}</Text>
        <Text style={styles.motivationBody}>{message.body}</Text>
      </View>

      <View>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionLabel}>Ça représente quoi {stats.co2Saved} kg de CO2 ?</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 16 }}>
          {equivalents.map((e, i) => (
            <View key={i} style={[styles.eqCard, { borderColor: `${e.tint}40` }]}>
              <View style={[styles.eqIcon, { backgroundColor: `${e.tint}15` }]}>
                <Ionicons name={e.icon as any} size={22} color={e.tint} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 8 }}>
                <Text style={[styles.eqBig, { color: e.tint }]}>{e.big}</Text>
                <Text style={styles.eqUnit}>{e.unit}</Text>
              </View>
              <Text style={styles.eqDesc}>{e.desc}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.projCard}>
        <View style={styles.projHead}>
          <View style={styles.projIcon}>
            <Ionicons name="trending-up" size={18} color={Colors.brand.forest} />
          </View>
          <Text style={styles.projTitle}>À ce rythme, fin {yearLabel}</Text>
        </View>
        <View style={styles.projRow}>
          <View style={styles.projItem}>
            <Text style={styles.projVal}>{projections.yearEnd} kg</Text>
            <Text style={styles.projLabel}>CO2 économisés</Text>
          </View>
          <View style={styles.projDivider} />
          <View style={styles.projItem}>
            <Text style={styles.projVal}>{projections.yearEndTrees}</Text>
            <Text style={styles.projLabel}>arbres équivalents</Text>
          </View>
          <View style={styles.projDivider} />
          <View style={styles.projItem}>
            <Text style={styles.projVal}>{projections.yearEndCarKm}</Text>
            <Text style={styles.projLabel}>km voiture évités</Text>
          </View>
        </View>
        <View style={[styles.projBadge, { backgroundColor: projections.onTrack ? "rgba(13,79,61,0.12)" : "rgba(245,158,11,0.12)" }]}>
          <Ionicons name={projections.onTrack ? "checkmark-circle" : "alert-circle"} size={13} color={projections.onTrack ? Colors.brand.forest : "#F59E0B"} />
          <Text style={[styles.projBadgeText, { color: projections.onTrack ? Colors.brand.forest : "#F59E0B" }]}>
            {projections.onTrack ? "Vous êtes en avance sur votre objectif" : `Plus que quelques rides pour atteindre ${stats.annualGoal} kg`}
          </Text>
        </View>
      </View>

      <View style={styles.shareCard}>
        <View style={styles.shareLeft}>
          <View style={styles.shareIcon}>
            <Ionicons name="megaphone-outline" size={20} color={Colors.brand.forest} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.shareTitle}>Inspirez vos amis</Text>
            <Text style={styles.shareDesc}>Partagez votre impact pour donner envie autour de vous</Text>
          </View>
        </View>
        <Pressable style={styles.shareBtn}>
          <Ionicons name="share-social-outline" size={16} color={Colors.text.inverse} />
          <Text style={styles.shareBtnText}>Partager</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  motivationCard: { marginHorizontal: Spacing.lg, padding: Spacing.lg, borderRadius: Radius.lg, overflow: "hidden", alignItems: "center" },
  motivationIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  motivationHead: { ...Type.display3, color: Colors.text.inverse, fontSize: 22, textAlign: "center", marginTop: 8 },
  motivationBody: { ...Type.bodySm, color: "rgba(255,255,255,0.92)", textAlign: "center", marginTop: 6, lineHeight: 20, paddingHorizontal: 8 },
  sectionHead: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  sectionLabel: { ...Type.label, color: Colors.text.muted, marginBottom: 8 },
  eqCard: { width: 200, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.bg.card, borderWidth: 1, marginLeft: Spacing.lg, gap: 4 },
  eqIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  eqBig: { ...Type.display1, fontSize: 32, fontWeight: "700" },
  eqUnit: { ...Type.bodySm, color: Colors.text.secondary, fontWeight: "600", fontSize: 13 },
  eqDesc: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 4, lineHeight: 16 },
  projCard: { marginHorizontal: Spacing.lg, padding: Spacing.lg, borderRadius: Radius.md, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle, gap: Spacing.md },
  projHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  projIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(13,79,61,0.1)", alignItems: "center", justifyContent: "center" },
  projTitle: { ...Type.display4, color: Colors.text.primary, fontSize: 15 },
  projRow: { flexDirection: "row", alignItems: "center" },
  projItem: { flex: 1, alignItems: "center", gap: 2 },
  projVal: { ...Type.display3, color: Colors.brand.forest, fontSize: 22 },
  projLabel: { ...Type.bodyXs, color: Colors.text.muted, textAlign: "center", fontSize: 11 },
  projDivider: { width: 1, height: 32, backgroundColor: Colors.border.subtle },
  projBadge: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill },
  projBadgeText: { ...Type.bodyXs, fontWeight: "700", fontSize: 11 },
  shareCard: { marginHorizontal: Spacing.lg, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: "rgba(13,79,61,0.06)", borderWidth: 1, borderColor: "rgba(13,79,61,0.2)", flexDirection: "row", alignItems: "center", gap: 12 },
  shareLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  shareIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(13,79,61,0.14)", alignItems: "center", justifyContent: "center" },
  shareTitle: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 14 },
  shareDesc: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 2 },
  shareBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Colors.brand.forest },
  shareBtnText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700" },
});

import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius, Type } from "@/constants/theme";
import { TRUST_META, type TrustLevel } from "@/lib/trust";

/**
 * Badge visuel de niveau de confiance.
 * 3 tailles : sm (chip mini), md (chip standard), lg (carte detaillee).
 */

export default function TrustBadge({ level, size = "md", showLabel = true }: { level: TrustLevel; size?: "sm" | "md" | "lg"; showLabel?: boolean }) {
  const meta = TRUST_META[level];

  if (size === "sm") {
    return (
      <View style={[styles.smBadge, { backgroundColor: meta.bg }]}>
        <Ionicons name={meta.icon as any} size={10} color={meta.tint} />
        {showLabel && <Text style={[styles.smText, { color: meta.tint }]}>{meta.shortLabel}</Text>}
      </View>
    );
  }
  if (size === "lg") {
    return (
      <View style={[styles.lgBadge, { backgroundColor: meta.bg, borderColor: `${meta.tint}40` }]}>
        <View style={[styles.lgIcon, { backgroundColor: `${meta.tint}25` }]}>
          <Ionicons name={meta.icon as any} size={18} color={meta.tint} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.lgTitle, { color: meta.tint }]}>{meta.label}</Text>
          <Text style={styles.lgDesc}>{meta.description}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.mdBadge, { backgroundColor: meta.bg }]}>
      <Ionicons name={meta.icon as any} size={12} color={meta.tint} />
      {showLabel && <Text style={[styles.mdText, { color: meta.tint }]}>{meta.shortLabel}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  smBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.pill },
  smText: { ...Type.bodyXs, fontWeight: "700", fontSize: 9.5 },
  mdBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill },
  mdText: { ...Type.bodyXs, fontWeight: "700", fontSize: 10.5 },
  lgBadge: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: Radius.md, borderWidth: 1 },
  lgIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  lgTitle: { ...Type.bodySm, fontWeight: "700", fontSize: 14 },
  lgDesc: { ...Type.bodyXs, color: Colors.text.secondary, marginTop: 2, lineHeight: 16 },
});

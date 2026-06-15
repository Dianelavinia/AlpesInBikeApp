import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";

/**
 * Composant generique d etat vide avec icone, titre, description et CTA optionnel.
 * Utilise dans toutes les listes vides pour avoir une UX coherente.
 */

export default function EmptyState({
  icon = "telescope-outline",
  iconColor,
  title,
  description,
  ctaLabel,
  onCta,
  variant = "default",
}: {
  icon?: any;
  iconColor?: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
  variant?: "default" | "compact" | "playful";
}) {
  const tint = iconColor ?? (variant === "playful" ? Colors.brand.orange : Colors.text.muted);
  const padding = variant === "compact" ? Spacing.lg : Spacing.xl;

  return (
    <View style={[styles.box, { paddingVertical: padding }]}>
      <View style={[styles.iconCircle, { backgroundColor: `${tint}15` }]}>
        <Ionicons name={icon} size={variant === "compact" ? 26 : 34} color={tint} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.desc}>{description}</Text>}
      {ctaLabel && onCta && (
        <Pressable onPress={onCta} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.text.inverse} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: "center", paddingHorizontal: Spacing.lg, gap: 10 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  title: { ...Type.display4, color: Colors.text.primary, fontSize: 16, textAlign: "center" },
  desc: { ...Type.bodySm, color: Colors.text.muted, textAlign: "center", lineHeight: 19, maxWidth: 280 },
  cta: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 11, paddingHorizontal: 18, borderRadius: Radius.pill, backgroundColor: Colors.brand.orange, marginTop: 6 },
  ctaText: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "700" },
});

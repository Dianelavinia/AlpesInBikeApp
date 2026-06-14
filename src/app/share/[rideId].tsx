import { View, Text, Pressable, StyleSheet, ScrollView, Image, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { ACTIVITIES } from "@/lib/activities";
import RideShareCard, { type ShareRide } from "@/components/RideShareCard";
import {
  ALPES_PHOTOS,
  FORMAT_META,
  TEMPLATE_META,
  generateCaption,
  type ShareFormat,
  type ShareTemplate,
} from "@/lib/share";

const FORMATS: ShareFormat[] = ["story", "square", "landscape"];
const TEMPLATES: ShareTemplate[] = ["dark-bottom", "minimal", "heatmap", "vintage"];

export default function ShareRide() {
  const router = useRouter();
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const activity = ACTIVITIES.find((a) => a.id === rideId);

  const [format, setFormat] = useState<ShareFormat>("story");
  const [template, setTemplate] = useState<ShareTemplate>("dark-bottom");
  const [photo, setPhoto] = useState<string>(ALPES_PHOTOS[0].url);

  if (!activity) return null;

  const ride: ShareRide = {
    title: activity.title,
    zone: activity.zone,
    distanceKm: activity.stats.distanceKm,
    elevationGain: activity.stats.elevationGain,
    durationMin: activity.stats.durationMin,
    avgSpeed: activity.stats.avgSpeed,
    date: activity.date,
  };

  const PREVIEW_WIDTH = format === "story" ? 220 : format === "square" ? 280 : 320;

  function share(target: string) {
    const caption = generateCaption(ride);
    if (Platform.OS === "web" && typeof navigator !== "undefined" && (navigator as any).share) {
      (navigator as any).share({ title: ride.title, text: caption }).catch(() => {});
      return;
    }
    Alert.alert(
      `Partage ${target}`,
      "Sur device natif, la carte est capturee en PNG via react-native-view-shot puis envoyee via expo-sharing.\n\nLegende automatique :\n\n" + caption.slice(0, 180) + "...",
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="close" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Partager ce ride</Text>
        <Pressable style={styles.headBtn}>
          <Ionicons name="download-outline" size={22} color={Colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.previewStage}>
          <RideShareCard ride={ride} photoUrl={photo} format={format} template={template} width={PREVIEW_WIDTH} />
        </View>

        <Text style={styles.sectionLabel}>Format</Text>
        <View style={styles.formatRow}>
          {FORMATS.map((f) => {
            const meta = FORMAT_META[f];
            const active = format === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFormat(f)}
                style={[styles.formatBtn, active && styles.formatBtnActive]}
              >
                <Ionicons name={meta.icon as any} size={18} color={active ? Colors.text.inverse : Colors.text.secondary} />
                <Text style={[styles.formatLabel, active && styles.formatLabelActive]}>{meta.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Style</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsRow}>
          {TEMPLATES.map((t) => {
            const meta = TEMPLATE_META[t];
            const active = template === t;
            return (
              <Pressable
                key={t}
                onPress={() => setTemplate(t)}
                style={[styles.templateCard, active && styles.templateCardActive]}
              >
                <Text style={[styles.templateLabel, active && styles.templateLabelActive]}>{meta.label}</Text>
                <Text style={styles.templateDesc} numberOfLines={2}>{meta.description}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionLabel}>Photo de fond</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll} contentContainerStyle={styles.photoRow}>
          <Pressable style={styles.photoUpload}>
            <Ionicons name="image-outline" size={24} color={Colors.brand.orange} />
            <Text style={styles.photoUploadText}>Ma photo</Text>
          </Pressable>
          {ALPES_PHOTOS.map((p) => {
            const active = photo === p.url;
            return (
              <Pressable key={p.id} onPress={() => setPhoto(p.url)} style={[styles.photoThumb, active && styles.photoThumbActive]}>
                <Image source={{ uri: p.url }} style={styles.photoImg} />
                {active && (
                  <View style={styles.photoCheck}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.brand.orange} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionLabel}>Partager vers</Text>
        <View style={styles.socialGrid}>
          <Social icon="logo-instagram" label="Story IG" tint="#E1306C" onPress={() => share("Instagram Story")} />
          <Social icon="logo-instagram" label="Post IG" tint="#5B51D8" onPress={() => share("Instagram Post")} />
          <Social icon="logo-facebook" label="Facebook" tint="#1877F2" onPress={() => share("Facebook")} />
          <Social icon="logo-tiktok" label="TikTok" tint="#000000" onPress={() => share("TikTok")} />
          <Social icon="logo-whatsapp" label="WhatsApp" tint="#25D366" onPress={() => share("WhatsApp")} />
          <Social icon="mail-outline" label="Email" tint="#0EA5E9" onPress={() => share("Email")} />
          <Social icon="link-outline" label="Copier lien" tint={Colors.brand.forest} onPress={() => share("Copy link")} />
          <Social icon="share-social-outline" label="Autre" tint={Colors.text.primary} onPress={() => share("System share")} />
        </View>

        <View style={styles.captionCard}>
          <Text style={styles.captionLabel}>Légende suggérée</Text>
          <Text style={styles.captionText}>{generateCaption(ride)}</Text>
          <Pressable style={styles.copyBtn}>
            <Ionicons name="copy-outline" size={14} color={Colors.brand.orange} />
            <Text style={styles.copyBtnText}>Copier</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Social({ icon, label, tint, onPress }: { icon: any; label: string; tint: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.social, pressed && { opacity: 0.85 }]}>
      <View style={[styles.socialIcon, { backgroundColor: `${tint}15` }]}>
        <Ionicons name={icon} size={22} color={tint} />
      </View>
      <Text style={styles.socialLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18 },

  previewStage: { alignItems: "center", paddingVertical: Spacing.lg, paddingHorizontal: Spacing.md, backgroundColor: "#E7E5E4", marginHorizontal: Spacing.lg, borderRadius: Radius.lg, marginTop: 4 },

  sectionLabel: { ...Type.label, color: Colors.text.muted, marginHorizontal: Spacing.lg, marginTop: Spacing.lg, marginBottom: 8 },

  formatRow: { flexDirection: "row", paddingHorizontal: Spacing.lg, gap: 6 },
  formatBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 11, borderRadius: Radius.pill, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle },
  formatBtnActive: { backgroundColor: Colors.brand.ink, borderColor: Colors.brand.ink },
  formatLabel: { ...Type.bodyXs, color: Colors.text.secondary, fontWeight: "700", fontSize: 12 },
  formatLabelActive: { color: Colors.text.inverse },

  chipsScroll: { flexGrow: 0, maxHeight: 110 },
  chipsRow: { paddingHorizontal: Spacing.lg, gap: 8, alignItems: "stretch", paddingVertical: 4 },
  templateCard: { width: 170, padding: 10, borderRadius: Radius.md, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle, marginRight: 8, gap: 4 },
  templateCardActive: { backgroundColor: "rgba(225,90,35,0.08)", borderColor: Colors.brand.orange },
  templateLabel: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 13 },
  templateLabelActive: { color: Colors.brand.orange },
  templateDesc: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 11, lineHeight: 15 },

  photoScroll: { flexGrow: 0, maxHeight: 90 },
  photoRow: { paddingHorizontal: Spacing.lg, gap: 8, alignItems: "center" },
  photoUpload: { width: 70, height: 70, borderRadius: Radius.md, borderWidth: 2, borderColor: Colors.brand.orange, borderStyle: "dashed", alignItems: "center", justifyContent: "center", marginRight: 8, gap: 4 },
  photoUploadText: { ...Type.bodyXs, color: Colors.brand.orange, fontWeight: "700", fontSize: 10 },
  photoThumb: { width: 70, height: 70, borderRadius: Radius.md, overflow: "hidden", marginRight: 8, borderWidth: 2, borderColor: "transparent" },
  photoThumbActive: { borderColor: Colors.brand.orange },
  photoImg: { width: "100%", height: "100%" },
  photoCheck: { position: "absolute", top: 4, right: 4, backgroundColor: "#FFF", borderRadius: 10 },

  socialGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: Spacing.lg, gap: 10 },
  social: { width: "22%", alignItems: "center", gap: 6, paddingVertical: 6 },
  socialIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  socialLabel: { ...Type.bodyXs, color: Colors.text.primary, fontWeight: "600", fontSize: 11 },

  captionCard: { marginHorizontal: Spacing.lg, marginTop: Spacing.lg, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle, gap: 6 },
  captionLabel: { ...Type.label, color: Colors.text.muted, fontSize: 10 },
  captionText: { ...Type.bodySm, color: Colors.text.primary, lineHeight: 19, fontSize: 13 },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 7, paddingHorizontal: 12, borderRadius: Radius.pill, backgroundColor: "rgba(225,90,35,0.12)", alignSelf: "flex-start", marginTop: 4 },
  copyBtnText: { ...Type.bodyXs, color: Colors.brand.orange, fontWeight: "700", fontSize: 12 },
});

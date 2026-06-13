import { ScrollView, View, Text, Pressable, StyleSheet, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { t } from "@/lib/i18n";

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greet}>{t("home.hello")}</Text>
            <Text style={styles.greetName}>Marie</Text>
          </View>
          <Pressable onPress={() => router.push("/sos")} style={styles.sosBtn}>
            <Ionicons name="warning" size={18} color={Colors.brand.orange} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <ImageBackground
            source={{ uri: "https://images.unsplash.com/photo-1591619759638-36921634f97e?w=1200&q=85" }}
            style={StyleSheet.absoluteFill}
            imageStyle={{ borderRadius: Radius.xl }}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.1)", "rgba(13,79,61,0.85)"]}
            style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{t("home.heroTitle")}</Text>
            <Pressable
              style={({ pressed }) => [styles.heroCta, pressed && { opacity: 0.85 }]}
              onPress={() => router.push("/booking/new")}
            >
              <Text style={styles.heroCtaText}>{t("home.heroCta")}</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.text.inverse} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t("home.currentBookingTitle")}</Text>
          <View style={styles.emptyCard}>
            <Ionicons name="bicycle-outline" size={32} color={Colors.text.muted} />
            <Text style={styles.emptyText}>{t("home.noBooking")}</Text>
            <Pressable onPress={() => router.push("/booking/new")} style={styles.emptyCta}>
              <Text style={styles.emptyCtaText}>{t("home.noBookingCta")}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t("home.quickActions")}</Text>
          <View style={styles.grid}>
            <QuickAction icon="bicycle-outline" label="Voir les vélos" onPress={() => router.push("/(tabs)/bikes")} />
            <QuickAction icon="map-outline" label="Parcours" onPress={() => {}} />
            <QuickAction icon="cloudy-outline" label="Météo" onPress={() => {}} />
            <QuickAction icon="logo-whatsapp" label="WhatsApp" tint="#25D366" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t("home.routesTitle")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
            <RouteCard title="Boucle du Revard" distance="38 km" elevation="+1200 m" image="https://images.unsplash.com/photo-1591028889197-3488e003481a?w=600&q=85" />
            <RouteCard title="Tour du lac" distance="44 km" elevation="+350 m" image="https://images.unsplash.com/photo-1561377718-ebad6e79bc4a?w=600&q=85" />
            <RouteCard title="Voie verte Annecy" distance="33 km" elevation="+100 m" image="https://images.unsplash.com/photo-1594056466093-52bcbc7f5e4b?w=600&q=85" />
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({ icon, label, onPress, tint }: { icon: any; label: string; onPress: () => void; tint?: string }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.qa, pressed && { opacity: 0.7 }]}>
      <View style={[styles.qaIcon, tint ? { backgroundColor: `${tint}15` } : null]}>
        <Ionicons name={icon} size={22} color={tint || Colors.brand.orange} />
      </View>
      <Text style={styles.qaLabel}>{label}</Text>
    </Pressable>
  );
}

function RouteCard({ title, distance, elevation, image }: { title: string; distance: string; elevation: string; image: string }) {
  return (
    <Pressable style={styles.route}>
      <ImageBackground source={{ uri: image }} style={styles.routeImg} imageStyle={{ borderRadius: 16 }} />
      <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={[styles.routeImg, { position: "absolute", borderRadius: 16 }]} />
      <View style={styles.routeText}>
        <Text style={styles.routeTitle}>{title}</Text>
        <Text style={styles.routeMeta}>{distance} · {elevation}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  greet: { ...Type.bodySm, color: Colors.text.muted },
  greetName: { ...Type.display3, color: Colors.text.primary },
  sosBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.bg.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border.subtle },
  hero: { marginHorizontal: Spacing.lg, height: 220, borderRadius: Radius.xl, overflow: "hidden", marginBottom: Spacing.xl },
  heroContent: { flex: 1, justifyContent: "flex-end", padding: Spacing.lg },
  heroTitle: { ...Type.display3, color: Colors.text.inverse, marginBottom: Spacing.md },
  heroCta: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 8, backgroundColor: Colors.brand.orange, paddingHorizontal: 20, paddingVertical: 12, borderRadius: Radius.pill },
  heroCtaText: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "600" },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  sectionLabel: { ...Type.label, color: Colors.text.muted, marginBottom: Spacing.md },
  emptyCard: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, padding: Spacing.xl, alignItems: "center", borderWidth: 1, borderColor: Colors.border.subtle, gap: Spacing.md },
  emptyText: { ...Type.body, color: Colors.text.secondary },
  emptyCta: { backgroundColor: Colors.brand.orange, paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radius.pill },
  emptyCtaText: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  qa: { flex: 1, minWidth: "47%", backgroundColor: Colors.bg.card, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle, flexDirection: "row", alignItems: "center", gap: 12 },
  qaIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(225,90,35,0.1)", alignItems: "center", justifyContent: "center" },
  qaLabel: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "600", flex: 1 },
  route: { width: 240, height: 140, borderRadius: 16, overflow: "hidden" },
  routeImg: { width: "100%", height: "100%" },
  routeText: { position: "absolute", bottom: 12, left: 14, right: 14 },
  routeTitle: { ...Type.display4, color: Colors.text.inverse, fontSize: 16 },
  routeMeta: { ...Type.bodyXs, color: "rgba(255,255,255,0.85)", marginTop: 2 },
});

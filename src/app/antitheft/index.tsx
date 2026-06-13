import { View, Text, Pressable, StyleSheet, ScrollView, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { REGISTERED_BIKES, STOLEN_NEARBY, type RegisteredBike } from "@/lib/antitheft";

export default function Antitheft() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Antivol communautaire</Text>
        <Pressable style={styles.headBtn}>
          <Ionicons name="help-circle-outline" size={22} color={Colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="shield-checkmark" size={28} color={Colors.brand.orange} />
          </View>
          <Text style={styles.heroTitle}>Vos vélos protégés par la communauté</Text>
          <Text style={styles.heroDesc}>Enregistrés, signalés au moindre vol, partagés à 800+ riders de la région.</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>Mes vélos enregistrés</Text>
            <Pressable style={styles.addBtn}>
              <Ionicons name="add" size={14} color={Colors.brand.orange} />
              <Text style={styles.addText}>Ajouter</Text>
            </Pressable>
          </View>
          {REGISTERED_BIKES.map((b) => (
            <MyBikeCard key={b.id} bike={b} />
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.alertBanner}>
            <Ionicons name="alert-circle" size={18} color="#EF4444" />
            <Text style={styles.alertText}>
              <Text style={{ fontWeight: "700" }}>{STOLEN_NEARBY.length} vélos volés</Text> dans votre zone, gardez l'œil ouvert
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Vélos volés à proximité</Text>
          <View style={{ gap: 12 }}>
            {STOLEN_NEARBY.map((b) => (
              <StolenBikeCard key={b.id} bike={b} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Comment ça marche</Text>
          <View style={styles.steps}>
            <Step n="01" title="Enregistrez votre vélo" desc="Marque, modèle, couleur, numéro de série, photos et facture." />
            <Step n="02" title="En cas de vol, un clic" desc="L'alerte est envoyée à toute la communauté locale en moins de 60 secondes." />
            <Step n="03" title="Aidez ou soyez aidé" desc="Si vous voyez un vélo signalé volé, signalez le. Récompense possible si rétrocession." />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={({ pressed }) => [styles.declareBtn, pressed && { opacity: 0.85 }]}>
          <Ionicons name="warning" size={18} color={Colors.text.inverse} />
          <Text style={styles.declareText}>Déclarer un vol</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function MyBikeCard({ bike }: { bike: RegisteredBike }) {
  return (
    <View style={styles.myBike}>
      <ImageBackground source={{ uri: bike.photos[0] }} style={styles.bikePhoto} imageStyle={{ borderRadius: 12 }} />
      <View style={{ flex: 1 }}>
        <View style={styles.bikeHead}>
          <Text style={styles.bikeName}>{bike.brand} {bike.model}</Text>
          <View style={styles.okBadge}>
            <Ionicons name="shield-checkmark" size={11} color={Colors.brand.forest} />
            <Text style={styles.okText}>Protégé</Text>
          </View>
        </View>
        <Text style={styles.bikeMeta}>{bike.color}</Text>
        <Text style={styles.bikeSerial}>S/N : {bike.serialNumber}</Text>
      </View>
    </View>
  );
}

function StolenBikeCard({ bike }: { bike: RegisteredBike }) {
  return (
    <Pressable style={styles.stolenCard}>
      <ImageBackground source={{ uri: bike.photos[0] }} style={styles.stolenPhoto} imageStyle={{ borderRadius: 12 }}>
        <View style={styles.stolenBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.stolenBadgeText}>VOLÉ</Text>
        </View>
      </ImageBackground>
      <View style={{ flex: 1 }}>
        <Text style={styles.stolenName}>{bike.brand} {bike.model}</Text>
        <Text style={styles.stolenColor}>{bike.color}</Text>
        <View style={styles.locRow}>
          <Ionicons name="location" size={11} color={Colors.text.muted} />
          <Text style={styles.locText}>{bike.stolenLocation?.label} · {bike.stolenAt}</Text>
        </View>
        {bike.reward && (
          <View style={styles.rewardPill}>
            <Ionicons name="cash-outline" size={11} color={Colors.brand.orange} />
            <Text style={styles.rewardText}>Récompense {bike.reward} €</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepN}>
        <Text style={styles.stepNText}>{n}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18 },
  heroCard: { margin: Spacing.lg, padding: Spacing.lg, backgroundColor: Colors.bg.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border.subtle, alignItems: "center" },
  heroIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(225,90,35,0.12)", alignItems: "center", justifyContent: "center", marginBottom: Spacing.md },
  heroTitle: { ...Type.display4, color: Colors.text.primary, fontSize: 18, textAlign: "center" },
  heroDesc: { ...Type.bodySm, color: Colors.text.secondary, textAlign: "center", marginTop: 6 },
  section: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, marginBottom: Spacing.md },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionLabel: { ...Type.label, color: Colors.text.muted },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: "rgba(225,90,35,0.1)" },
  addText: { ...Type.bodyXs, color: Colors.brand.orange, fontWeight: "700" },
  myBike: { flexDirection: "row", gap: 12, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle },
  bikePhoto: { width: 80, height: 80, borderRadius: 12 },
  bikeHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  bikeName: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 14, flex: 1 },
  okBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.pill, backgroundColor: "rgba(13,79,61,0.1)" },
  okText: { ...Type.bodyXs, color: Colors.brand.forest, fontWeight: "700", fontSize: 10 },
  bikeMeta: { ...Type.bodySm, color: Colors.text.secondary, marginTop: 4 },
  bikeSerial: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 4, fontFamily: "Courier" },
  alertBanner: { flexDirection: "row", alignItems: "center", gap: 10, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: "rgba(239,68,68,0.08)", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" },
  alertText: { ...Type.bodySm, color: Colors.text.primary, flex: 1 },
  stolenCard: { flexDirection: "row", gap: 12, padding: Spacing.md, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle },
  stolenPhoto: { width: 90, height: 90, borderRadius: 12, overflow: "hidden" },
  stolenBadge: { position: "absolute", top: 6, left: 6, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 6, paddingVertical: 3, borderRadius: Radius.pill, backgroundColor: "#EF4444" },
  pulseDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "white" },
  stolenBadgeText: { color: "white", fontSize: 9, fontWeight: "700", letterSpacing: 0.5 },
  stolenName: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 14 },
  stolenColor: { ...Type.bodyXs, color: Colors.text.secondary, marginTop: 2 },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  locText: { ...Type.bodyXs, color: Colors.text.muted, flex: 1 },
  rewardPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill, backgroundColor: "rgba(225,90,35,0.1)", alignSelf: "flex-start", marginTop: 6 },
  rewardText: { ...Type.bodyXs, color: Colors.brand.orange, fontWeight: "700" },
  steps: { gap: Spacing.md },
  step: { flexDirection: "row", gap: 12 },
  stepN: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(225,90,35,0.12)", alignItems: "center", justifyContent: "center" },
  stepNText: { ...Type.label, color: Colors.brand.orange, fontSize: 10 },
  stepTitle: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 14 },
  stepDesc: { ...Type.bodySm, color: Colors.text.secondary, marginTop: 4, lineHeight: 18 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: Spacing.lg, backgroundColor: Colors.bg.card, borderTopWidth: 1, borderTopColor: Colors.border.subtle },
  declareBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, backgroundColor: "#EF4444", paddingVertical: 16, borderRadius: Radius.pill },
  declareText: { ...Type.body, color: Colors.text.inverse, fontWeight: "700", fontSize: 15 },
});

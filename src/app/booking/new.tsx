import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { t } from "@/lib/i18n";
import { BIKES } from "@/lib/catalog";

const STEPS = [
  { id: 1, label: t("booking.stepRiders") },
  { id: 2, label: t("booking.stepLogistics") },
  { id: 3, label: t("booking.stepConfirm") },
];

export default function NewBooking() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [riders, setRiders] = useState<{ id: string; name: string; height: string; bike: string }[]>([]);
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");

  function addRider() {
    setRiders([...riders, { id: Math.random().toString(36).slice(2), name: "", height: "", bike: BIKES[0].slug }]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="close" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("booking.newBookingTitle")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.stepper}>
        {STEPS.map((s, i) => (
          <View key={s.id} style={styles.stepItem}>
            <View style={[styles.stepDot, step >= s.id && styles.stepDotActive, step > s.id && { backgroundColor: Colors.brand.forest }]}>
              {step > s.id ? (
                <Ionicons name="checkmark" size={14} color={Colors.text.inverse} />
              ) : (
                <Text style={[styles.stepNum, step === s.id && { color: Colors.text.inverse }]}>{s.id}</Text>
              )}
            </View>
            <Text style={[styles.stepLabel, step === s.id && styles.stepLabelActive]}>{s.label}</Text>
            {i < STEPS.length - 1 && <View style={[styles.stepLine, step > s.id && { backgroundColor: Colors.brand.forest }]} />}
          </View>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 120 }}>
        {step === 1 && (
          <View style={{ gap: Spacing.md }}>
            <Text style={styles.sectionTitle}>Qui pédale ?</Text>
            <Text style={styles.sectionDesc}>Ajoutez chaque personne, on suggère la taille de vélo.</Text>
            {riders.map((r, i) => (
              <View key={r.id} style={styles.riderCard}>
                <View style={styles.riderHead}>
                  <View style={styles.riderNum}><Text style={styles.riderNumText}>{i + 1}</Text></View>
                  <TextInput
                    style={styles.riderName}
                    placeholder={`Cycliste ${i + 1}`}
                    placeholderTextColor={Colors.text.muted}
                    value={r.name}
                    onChangeText={(v) => setRiders(riders.map((x) => (x.id === r.id ? { ...x, name: v } : x)))}
                  />
                  <Pressable onPress={() => setRiders(riders.filter((x) => x.id !== r.id))}>
                    <Ionicons name="trash-outline" size={18} color={Colors.text.muted} />
                  </Pressable>
                </View>
                <View style={styles.inputRow}>
                  <View style={styles.inputWrap}>
                    <Text style={styles.inputLabel}>Taille (cm)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="ex 175"
                      placeholderTextColor={Colors.text.muted}
                      keyboardType="number-pad"
                      value={r.height}
                      onChangeText={(v) => setRiders(riders.map((x) => (x.id === r.id ? { ...x, height: v } : x)))}
                    />
                  </View>
                </View>
              </View>
            ))}
            <Pressable onPress={addRider} style={styles.addBtn}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.brand.orange} />
              <Text style={styles.addBtnText}>{riders.length === 0 ? "Ajouter votre premier cycliste" : "Ajouter un autre cycliste"}</Text>
            </Pressable>
          </View>
        )}

        {step === 2 && (
          <View style={{ gap: Spacing.md }}>
            <Text style={styles.sectionTitle}>Quand et où ?</Text>
            <Text style={styles.sectionDesc}>Date, horaires et adresse de livraison.</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput style={styles.input} placeholder="14 juin 2026 · 9h-18h" placeholderTextColor={Colors.text.muted} value={date} onChangeText={setDate} />
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Adresse de livraison</Text>
              <TextInput style={styles.input} placeholder="Hôtel, chalet, camping..." placeholderTextColor={Colors.text.muted} value={address} onChangeText={setAddress} />
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={{ gap: Spacing.md }}>
            <Text style={styles.sectionTitle}>Récapitulatif</Text>
            <View style={styles.summary}>
              <SummaryRow label="Cyclistes" value={`${riders.length}`} />
              <SummaryRow label="Date" value={date || "À renseigner"} />
              <SummaryRow label="Adresse" value={address || "À renseigner"} />
              <View style={styles.divider} />
              <SummaryRow label="Sous-total" value={`${riders.length * 79} €`} />
              <SummaryRow label="Livraison" value="20 €" />
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total estimé</Text>
                <Text style={styles.totalValue}>{riders.length * 79 + 20} €</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <Pressable onPress={() => setStep(step - 1)} style={styles.btnSecondary}>
            <Text style={styles.btnSecondaryText}>{t("common.back")}</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => (step < 3 ? setStep(step + 1) : router.replace("/(tabs)/bookings"))}
          style={[styles.btnPrimary, { flex: 1 }]}
        >
          <Text style={styles.btnPrimaryText}>{step < 3 ? t("common.continue") : "Confirmer la demande"}</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.text.inverse} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerTitle: { ...Type.display4, color: Colors.text.primary },
  stepper: { flexDirection: "row", paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.bg.card, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle },
  stepItem: { flexDirection: "row", alignItems: "center", flex: 1 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.bg.elevated, alignItems: "center", justifyContent: "center" },
  stepDotActive: { backgroundColor: Colors.brand.orange },
  stepNum: { ...Type.bodySm, color: Colors.text.muted, fontWeight: "600" },
  stepLabel: { ...Type.bodyXs, color: Colors.text.muted, marginLeft: 8, fontWeight: "600" },
  stepLabelActive: { color: Colors.text.primary },
  stepLine: { flex: 1, height: 1, backgroundColor: Colors.border.subtle, marginHorizontal: 8 },
  sectionTitle: { ...Type.display3, color: Colors.text.primary },
  sectionDesc: { ...Type.bodySm, color: Colors.text.muted, marginBottom: Spacing.sm },
  riderCard: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border.subtle, gap: Spacing.md },
  riderHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  riderNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(225,90,35,0.1)", alignItems: "center", justifyContent: "center" },
  riderNumText: { ...Type.bodySm, color: Colors.brand.orange, fontWeight: "700" },
  riderName: { ...Type.display4, color: Colors.text.primary, flex: 1 },
  inputRow: { flexDirection: "row", gap: 12 },
  inputWrap: { flex: 1 },
  inputLabel: { ...Type.label, color: Colors.text.muted, fontSize: 10, marginBottom: 6 },
  input: { backgroundColor: Colors.bg.base, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, ...Type.body, color: Colors.text.primary, borderWidth: 1, borderColor: Colors.border.base },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 2, borderColor: Colors.border.subtle, borderStyle: "dashed" },
  addBtnText: { ...Type.bodySm, color: Colors.brand.orange, fontWeight: "600" },
  summary: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border.subtle, gap: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { ...Type.bodySm, color: Colors.text.muted },
  summaryValue: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "600" },
  divider: { height: 1, backgroundColor: Colors.border.subtle, marginVertical: 6 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  totalLabel: { ...Type.body, color: Colors.text.secondary },
  totalValue: { ...Type.display2, color: Colors.brand.orange, fontSize: 28 },
  footer: { flexDirection: "row", gap: 10, padding: Spacing.lg, paddingTop: Spacing.md, backgroundColor: Colors.bg.card, borderTopWidth: 1, borderTopColor: Colors.border.subtle },
  btnSecondary: { paddingHorizontal: 22, paddingVertical: 14, borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.border.base, justifyContent: "center" },
  btnSecondaryText: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "600" },
  btnPrimary: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.brand.orange, paddingVertical: 14, borderRadius: Radius.pill },
  btnPrimaryText: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "600" },
});

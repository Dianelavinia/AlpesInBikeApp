import { View, Text, Pressable, StyleSheet, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { t } from "@/lib/i18n";

const PHONE = "+33626187938";
const WHATSAPP = "33626187938";

export default function Sos() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.handle} />
      <View style={styles.iconWrap}>
        <View style={styles.iconCircle}>
          <Ionicons name="warning" size={36} color={Colors.brand.orange} />
        </View>
      </View>
      <Text style={styles.title}>{t("sos.title")}</Text>
      <Text style={styles.desc}>{t("sos.desc")}</Text>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.primary, pressed && { opacity: 0.85 }]}
          onPress={() => Linking.openURL(`tel:${PHONE}`)}
        >
          <Ionicons name="call" size={22} color={Colors.text.inverse} />
          <Text style={styles.primaryText}>{t("sos.call")}</Text>
          <Text style={styles.primaryPhone}>{PHONE}</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.whatsapp, pressed && { opacity: 0.85 }]}
          onPress={() => Linking.openURL(`https://wa.me/${WHATSAPP}?text=Bonjour, j'ai besoin d'aide avec ma location.`)}
        >
          <Ionicons name="logo-whatsapp" size={22} color={Colors.text.inverse} />
          <Text style={styles.whatsappText}>{t("sos.whatsapp")}</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => router.back()} style={styles.close}>
        <Text style={styles.closeText}>Fermer</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base, paddingHorizontal: Spacing.lg, justifyContent: "center" },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border.base, alignSelf: "center", position: "absolute", top: 12 },
  iconWrap: { alignItems: "center", marginBottom: Spacing.lg },
  iconCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: "rgba(225,90,35,0.1)", alignItems: "center", justifyContent: "center" },
  title: { ...Type.display1, color: Colors.text.primary, textAlign: "center", fontSize: 32 },
  desc: { ...Type.body, color: Colors.text.secondary, textAlign: "center", marginTop: Spacing.md, paddingHorizontal: Spacing.md },
  actions: { gap: Spacing.md, marginTop: Spacing.xl },
  primary: { backgroundColor: Colors.brand.orange, paddingVertical: 22, borderRadius: Radius.lg, alignItems: "center", gap: 6 },
  primaryText: { ...Type.body, color: Colors.text.inverse, fontWeight: "600", fontSize: 17 },
  primaryPhone: { ...Type.bodySm, color: "rgba(255,255,255,0.8)" },
  whatsapp: { backgroundColor: "#25D366", paddingVertical: 22, borderRadius: Radius.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  whatsappText: { ...Type.body, color: Colors.text.inverse, fontWeight: "600", fontSize: 17 },
  close: { alignItems: "center", paddingVertical: Spacing.lg, marginTop: Spacing.md },
  closeText: { ...Type.body, color: Colors.text.muted, fontWeight: "600" },
});

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Radius, Spacing, Type } from "@/constants/theme";

type Sensitivity = "faible" | "moyenne" | "haute";
type Countdown = 10 | 20 | 30 | 45 | 60;

type Contact = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
};

const SENSITIVITIES: { value: Sensitivity; label: string; hint: string }[] = [
  { value: "faible", label: "Faible", hint: "Chocs très marqués uniquement" },
  { value: "moyenne", label: "Moyenne", hint: "Recommandé sentier et route" },
  { value: "haute", label: "Haute", hint: "Sensible, idéal enduro et DH" },
];

const COUNTDOWNS: Countdown[] = [10, 20, 30, 45, 60];

const INITIAL_CONTACTS: Contact[] = [
  {
    id: "c1",
    name: "Camille Berthod",
    relationship: "Conjointe",
    phone: "+33 6 12 34 56 78",
  },
  {
    id: "c2",
    name: "Pierre Aubry",
    relationship: "Guide Alpes in Bike",
    phone: "+33 6 87 65 43 21",
  },
];

type ActionKey = "gps" | "call112" | "family";

const ACTIONS: { key: ActionKey; icon: keyof typeof Ionicons.glyphMap; label: string; hint: string }[] = [
  {
    key: "gps",
    icon: "location",
    label: "Envoyer ma position GPS aux contacts",
    hint: "Coordonnées précises et lien carte transmis par SMS",
  },
  {
    key: "call112",
    icon: "call",
    label: "Appel automatique au 112",
    hint: "Déclenché si aucune annulation pendant le compte à rebours",
  },
  {
    key: "family",
    icon: "people",
    label: "Notifier la famille dans l'app",
    hint: "Alerte instantanée sur les comptes liés à votre tribu",
  },
];

export default function FallDetectionSettings() {
  const router = useRouter();

  const [enabled, setEnabled] = useState(true);
  const [sensitivity, setSensitivity] = useState<Sensitivity>("moyenne");
  const [countdown, setCountdown] = useState<Countdown>(30);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [actions, setActions] = useState<Record<ActionKey, boolean>>({
    gps: true,
    call112: true,
    family: true,
  });
  const [customPhone, setCustomPhone] = useState("");

  const toggleAction = (key: ActionKey) => {
    setActions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Détection de chute
        </Text>
        <Pressable
          hitSlop={12}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="En savoir plus"
        >
          <Ionicons name="information-circle-outline" size={24} color={Colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <LinearGradient
          colors={[Colors.brand.forest, Colors.brand.forestDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="shield-checkmark" size={26} color={Colors.text.inverse} />
            </View>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>Actif</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Détection automatique</Text>
          <Text style={styles.heroDescription}>
            Votre téléphone combine accéléromètre et gyroscope pour repérer un choc
            anormal ou une immobilisation soudaine pendant la sortie. Si vous ne
            répondez pas au compte à rebours, vos contacts et les secours sont alertés
            avec votre position.
          </Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Ionicons name="pulse" size={16} color={Colors.text.inverse} />
              <Text style={styles.heroStatText}>Analyse en continu</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Ionicons name="navigate" size={16} color={Colors.text.inverse} />
              <Text style={styles.heroStatText}>GPS haute précision</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Master toggle */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleIconWrap}>
              <Ionicons name="alert-circle" size={22} color={Colors.brand.orange} />
            </View>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>Activer la détection de chute</Text>
              <Text style={styles.toggleHint}>
                Surveille vos sorties dès que l'app est ouverte
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{ false: Colors.border.base, true: Colors.brand.forest }}
              thumbColor={Colors.text.inverse}
              ios_backgroundColor={Colors.border.base}
            />
          </View>
        </View>

        {/* Sensitivity */}
        <SectionHeader
          icon="speedometer"
          title="Sensibilité du capteur"
          subtitle="Ajustez selon votre pratique et votre terrain"
        />
        <View style={styles.chipsRow}>
          {SENSITIVITIES.map((s) => {
            const active = s.value === sensitivity;
            return (
              <Pressable
                key={s.value}
                onPress={() => setSensitivity(s.value)}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.sliderHint}>
          {SENSITIVITIES.find((s) => s.value === sensitivity)?.hint}
        </Text>

        {/* Countdown */}
        <SectionHeader
          icon="timer-outline"
          title="Compte à rebours d'alerte"
          subtitle="Délai pour annuler une fausse alerte"
        />
        <View style={styles.chipsRow}>
          {COUNTDOWNS.map((c) => {
            const active = c === countdown;
            return (
              <Pressable
                key={c}
                onPress={() => setCountdown(c)}
                style={[styles.chipSm, active && styles.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                  {c}s
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.sliderHint}>
          Réglage actuel, {countdown} secondes avant transmission automatique.
        </Text>

        {/* Emergency contacts */}
        <SectionHeader
          icon="people-circle"
          title="Contacts d'urgence"
          subtitle="Joints en priorité si une chute est détectée"
        />
        <View style={styles.contactsCard}>
          {contacts.map((c, idx) => (
            <View
              key={c.id}
              style={[
                styles.contactRow,
                idx < contacts.length - 1 && styles.contactRowDivider,
              ]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {c.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{c.name}</Text>
                <Text style={styles.contactRelation}>{c.relationship}</Text>
                <Text style={styles.contactPhone}>{c.phone}</Text>
              </View>
              <Pressable
                hitSlop={10}
                style={styles.contactEdit}
                accessibilityRole="button"
                accessibilityLabel={`Modifier ${c.name}`}
              >
                <Ionicons name="pencil" size={18} color={Colors.brand.forest} />
              </Pressable>
            </View>
          ))}
          <Pressable
            style={styles.addContact}
            accessibilityRole="button"
            onPress={() => {
              // Placeholder, ouverture du formulaire d'ajout
            }}
          >
            <View style={styles.addContactIcon}>
              <Ionicons name="add" size={20} color={Colors.brand.forest} />
            </View>
            <Text style={styles.addContactText}>Ajouter un contact</Text>
          </Pressable>
        </View>

        {/* Actions */}
        <SectionHeader
          icon="flash"
          title="En cas de chute détectée"
          subtitle="Actions déclenchées à la fin du compte à rebours"
        />
        <View style={styles.card}>
          {ACTIONS.map((a, idx) => {
            const checked = actions[a.key];
            return (
              <Pressable
                key={a.key}
                onPress={() => toggleAction(a.key)}
                style={[
                  styles.actionRow,
                  idx < ACTIONS.length - 1 && styles.actionRowDivider,
                ]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
              >
                <View style={styles.actionIconWrap}>
                  <Ionicons name={a.icon} size={20} color={Colors.brand.forest} />
                </View>
                <View style={styles.actionTextWrap}>
                  <Text style={styles.actionLabel}>{a.label}</Text>
                  <Text style={styles.actionHint}>{a.hint}</Text>
                </View>
                <View style={[styles.checkbox, checked && styles.checkboxOn]}>
                  {checked ? (
                    <Ionicons name="checkmark" size={16} color={Colors.text.inverse} />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Custom emergency call */}
        <SectionHeader
          icon="call-outline"
          title="Configurer un appel d'urgence personnalisé"
          subtitle="Numéro local privilégié si vous roulez à l'étranger"
        />
        <View style={styles.card}>
          <View style={styles.inputWrap}>
            <Ionicons
              name="call"
              size={18}
              color={Colors.text.muted}
              style={styles.inputIcon}
            />
            <TextInput
              value={customPhone}
              onChangeText={setCustomPhone}
              placeholder="Ex, +33 4 79 00 00 00"
              placeholderTextColor={Colors.text.muted}
              keyboardType="phone-pad"
              style={styles.input}
              accessibilityLabel="Numéro d'urgence personnalisé"
            />
          </View>
          <Text style={styles.inputHint}>
            Ce numéro remplace le 112 uniquement si vous le précisez avant la sortie.
          </Text>
        </View>

        {/* Tests */}
        <SectionHeader
          icon="construct"
          title="Tests"
          subtitle="Vérifiez que tout est prêt avant de rouler"
        />
        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            accessibilityRole="button"
            onPress={() => {
              // Placeholder, déclenche un faux scénario d'alerte
            }}
          >
            <Ionicons name="play-circle" size={20} color={Colors.text.inverse} />
            <Text style={styles.ctaText}>Tester l'alerte</Text>
          </Pressable>
          <Text style={styles.ctaCaption}>
            Une simulation sera envoyée à vos contacts. Prévenez les avant le test.
          </Text>
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconWrap}>
        <Ionicons name={icon} size={16} color={Colors.brand.forest} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg.base,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  headerTitle: {
    ...Type.display4,
    color: Colors.text.primary,
    flex: 1,
    textAlign: "center",
    paddingHorizontal: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // Hero
  hero: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#7CE2A8",
    marginRight: 6,
  },
  badgeText: {
    ...Type.label,
    color: Colors.text.inverse,
  },
  heroTitle: {
    ...Type.display3,
    color: Colors.text.inverse,
    marginBottom: Spacing.xs,
  },
  heroDescription: {
    ...Type.bodySm,
    color: Colors.text.inverse,
    opacity: 0.86,
    lineHeight: 20,
  },
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  heroStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  heroStatDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: Spacing.sm,
  },
  heroStatText: {
    ...Type.bodyXs,
    color: Colors.text.inverse,
    opacity: 0.9,
  },

  // Generic card
  card: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: Spacing.md,
  },

  // Toggle row
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  toggleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(225,90,35,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleTextWrap: {
    flex: 1,
  },
  toggleTitle: {
    ...Type.body,
    color: Colors.text.primary,
  },
  toggleHint: {
    ...Type.bodyXs,
    color: Colors.text.secondary,
    marginTop: 2,
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(13,79,61,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    ...Type.display4,
    color: Colors.text.primary,
  },
  sectionSubtitle: {
    ...Type.bodyXs,
    color: Colors.text.secondary,
    marginTop: 2,
  },

  // Chips
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    flexGrow: 1,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    alignItems: "center",
  },
  chipSm: {
    minWidth: 64,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    alignItems: "center",
  },
  chipActive: {
    backgroundColor: Colors.brand.forest,
    borderColor: Colors.brand.forest,
  },
  chipLabel: {
    ...Type.label,
    color: Colors.text.primary,
  },
  chipLabelActive: {
    color: Colors.text.inverse,
  },
  sliderHint: {
    ...Type.bodyXs,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
  },

  // Contacts
  contactsCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    overflow: "hidden",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
  },
  contactRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Colors.brand.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...Type.label,
    color: Colors.text.inverse,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...Type.body,
    color: Colors.text.primary,
  },
  contactRelation: {
    ...Type.bodyXs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  contactPhone: {
    ...Type.bodyXs,
    color: Colors.text.muted,
    marginTop: 2,
  },
  contactEdit: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(13,79,61,0.08)",
  },
  addContact: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border.subtle,
  },
  addContactIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(13,79,61,0.10)",
  },
  addContactText: {
    ...Type.body,
    color: Colors.brand.forest,
  },

  // Actions
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  actionRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(13,79,61,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextWrap: {
    flex: 1,
  },
  actionLabel: {
    ...Type.body,
    color: Colors.text.primary,
  },
  actionHint: {
    ...Type.bodyXs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.border.base,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bg.card,
  },
  checkboxOn: {
    backgroundColor: Colors.brand.forest,
    borderColor: Colors.brand.forest,
  },

  // Input
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bg.base,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    ...Type.body,
    color: Colors.text.primary,
  },
  inputHint: {
    ...Type.bodyXs,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
  },

  // CTA
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.brand.orange,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
  },
  ctaPressed: {
    opacity: 0.88,
  },
  ctaText: {
    ...Type.body,
    color: Colors.text.inverse,
    fontWeight: "600",
  },
  ctaCaption: {
    ...Type.bodyXs,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
});

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";

type Duration = "2 jours" | "3 jours" | "4 jours" | "1 semaine";
type Level = "Découverte" | "Confirmé" | "Expert";
type Lodging = "Refuge" | "Gîte" | "Hôtel" | "Camping";
type Season = "Été" | "Automne" | "Printemps";

type DayLeg = {
  label: string;
  km: number;
  altitude: number;
};

type Trip = {
  id: string;
  title: string;
  image: string;
  distance: number;
  ascent: number;
  nights: number;
  lodgingLabel: string;
  rating: number;
  priceFrom: number;
  days: DayLeg[];
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1674651530623-bf21d2e8fd42?w=1200&q=85";

const TRIPS: Trip[] = [
  {
    id: "bauges-3j",
    title: "Tour des Bauges en 3 jours",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85",
    distance: 105,
    ascent: 3200,
    nights: 2,
    lodgingLabel: "2 refuges",
    rating: 4.6,
    priceFrom: 145,
    days: [
      { label: "Jour 1", km: 38, altitude: 1180 },
      { label: "Jour 2", km: 42, altitude: 1340 },
      { label: "Jour 3", km: 25, altitude: 680 },
    ],
  },
  {
    id: "chartreuse-4j",
    title: "Traversée Chartreuse 4 jours",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85",
    distance: 145,
    ascent: 4800,
    nights: 3,
    lodgingLabel: "Refuge, gîte, hôtel",
    rating: 4.7,
    priceFrom: 220,
    days: [
      { label: "Jour 1", km: 36, altitude: 1250 },
      { label: "Jour 2", km: 44, altitude: 1520 },
      { label: "Jour 3", km: 38, altitude: 1180 },
    ],
  },
  {
    id: "lacs-cols-7j",
    title: "Lacs et cols, semaine d'aventure",
    image:
      "https://images.unsplash.com/photo-1502786129293-79981df4e689?w=1200&q=85",
    distance: 280,
    ascent: 7100,
    nights: 6,
    lodgingLabel: "Mixte hébergements",
    rating: 4.9,
    priceFrom: 480,
    days: [
      { label: "Jour 1", km: 42, altitude: 980 },
      { label: "Jour 2", km: 38, altitude: 1450 },
      { label: "Jour 3", km: 46, altitude: 1320 },
    ],
  },
];

const EQUIPMENT: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: "bag-handle-outline", label: "Sac de bikepacking" },
  { icon: "briefcase-outline", label: "Sacoches étanches" },
  { icon: "bed-outline", label: "Sac de couchage" },
  { icon: "rainy-outline", label: "Vêtements pluie" },
  { icon: "construct-outline", label: "Outils + kit repair" },
  { icon: "medkit-outline", label: "Trousse premiers secours" },
];

export default function BikepackingPlanner() {
  const router = useRouter();

  const [duration, setDuration] = useState<Duration>("3 jours");
  const [level, setLevel] = useState<Level>("Confirmé");
  const [lodgings, setLodgings] = useState<Lodging[]>(["Refuge", "Gîte"]);
  const [season, setSeason] = useState<Season>("Été");

  const toggleLodging = (item: Lodging) => {
    setLodgings((prev) =>
      prev.includes(item) ? prev.filter((l) => l !== item) : [...prev, item]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Revenir en arrière"
          onPress={() => router.back()}
          style={styles.iconButton}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Bikepacking</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Informations"
          style={styles.iconButton}
          hitSlop={8}
        >
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={Colors.text.primary}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <View style={styles.heroCard}>
          <ImageBackground
            source={{ uri: HERO_IMAGE }}
            style={styles.heroImage}
            imageStyle={styles.heroImageRadius}
          >
            <LinearGradient
              colors={["rgba(13,79,61,0.15)", "rgba(13,79,61,0.85)"]}
              style={styles.heroOverlay}
            >
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>NOUVEAU</Text>
              </View>
              <View style={styles.heroTextBlock}>
                <Text style={styles.heroTitle}>Itinéraires multi-jours</Text>
                <Text style={styles.heroSubtitle}>
                  Hébergement, eau, ravitaillement, tout est planifié
                </Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Critères */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vos critères</Text>

          <FilterRow
            label="Durée"
            options={["2 jours", "3 jours", "4 jours", "1 semaine"]}
            selected={[duration]}
            onSelect={(v) => setDuration(v as Duration)}
          />
          <FilterRow
            label="Niveau"
            options={["Découverte", "Confirmé", "Expert"]}
            selected={[level]}
            onSelect={(v) => setLevel(v as Level)}
          />
          <FilterRow
            label="Type d'hébergement"
            options={["Refuge", "Gîte", "Hôtel", "Camping"]}
            selected={lodgings}
            onSelect={(v) => toggleLodging(v as Lodging)}
            multi
          />
          <FilterRow
            label="Saison"
            options={["Été", "Automne", "Printemps"]}
            selected={[season]}
            onSelect={(v) => setSeason(v as Season)}
          />
        </View>

        {/* Itinéraires recommandés */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itinéraires recommandés</Text>
          {TRIPS.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </View>

        {/* Équipements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes équipements nécessaires</Text>
          <View style={styles.equipmentWrap}>
            {EQUIPMENT.map((eq) => (
              <View key={eq.label} style={styles.equipmentChip}>
                <Ionicons
                  name={eq.icon}
                  size={16}
                  color={Colors.brand.forest}
                />
                <Text style={styles.equipmentChipText}>{eq.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA final */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prêt à partir ?</Text>
          <LinearGradient
            colors={[Colors.brand.forest, Colors.brand.forestDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.finalCta}
          >
            <View style={styles.finalCtaTextBlock}>
              <Text style={styles.finalCtaTitle}>
                On s'occupe de tout, vous pédalez
              </Text>
              <Text style={styles.finalCtaSubtitle}>
                Réservation des nuits, repas, transferts bagages et assistance
                mécanique inclus.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Réserver l'itinéraire complet"
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                Réserver l'itinéraire complet
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={Colors.text.inverse}
              />
            </Pressable>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- Sub components ---------------- */

function FilterRow({
  label,
  options,
  selected,
  onSelect,
  multi = false,
}: {
  label: string;
  options: string[];
  selected: string[];
  onSelect: (value: string) => void;
  multi?: boolean;
}) {
  return (
    <View style={styles.filterRow}>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <Pressable
              key={opt}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onSelect(opt)}
              style={[styles.chip, active && styles.chipActive]}
            >
              {multi && active && (
                <Ionicons
                  name="checkmark"
                  size={14}
                  color={Colors.text.inverse}
                  style={styles.chipIcon}
                />
              )}
              <Text
                style={[styles.chipText, active && styles.chipTextActive]}
              >
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function TripCard({ trip }: { trip: Trip }) {
  return (
    <View style={styles.tripCard}>
      <Image source={{ uri: trip.image }} style={styles.tripImage} />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.55)"]}
        style={styles.tripImageOverlay}
      />
      <View style={styles.tripImageBadge}>
        <Ionicons name="star" size={12} color={Colors.brand.orange} />
        <Text style={styles.tripImageBadgeText}>
          {trip.rating.toFixed(1)}/5
        </Text>
      </View>

      <View style={styles.tripBody}>
        <Text style={styles.tripTitle}>{trip.title}</Text>

        <View style={styles.tripStatsRow}>
          <TripStat
            icon="speedometer-outline"
            value={`${trip.distance} km`}
          />
          <View style={styles.tripStatDivider} />
          <TripStat
            icon="trending-up-outline"
            value={`+${trip.ascent} m`}
          />
          <View style={styles.tripStatDivider} />
          <TripStat
            icon="moon-outline"
            value={`${trip.nights} ${trip.nights > 1 ? "nuits" : "nuit"}`}
          />
        </View>

        <View style={styles.dayRow}>
          {trip.days.map((d) => (
            <View key={d.label} style={styles.dayCard}>
              <Text style={styles.dayLabel}>{d.label}</Text>
              <Text style={styles.dayKm}>{d.km} km</Text>
              <Text style={styles.dayAltitude}>{d.altitude} m D+</Text>
            </View>
          ))}
        </View>

        <View style={styles.lodgingRow}>
          <Ionicons
            name="home-outline"
            size={14}
            color={Colors.text.secondary}
          />
          <Text style={styles.lodgingText}>{trip.lodgingLabel}</Text>
        </View>

        <View style={styles.tripFooter}>
          <View>
            <Text style={styles.priceFromLabel}>à partir de</Text>
            <Text style={styles.priceValue}>
              {trip.priceFrom}€
              <Text style={styles.pricePerson}> /personne tout inclus</Text>
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Voir le détail de ${trip.title}`}
            style={({ pressed }) => [
              styles.detailCta,
              pressed && styles.detailCtaPressed,
            ]}
          >
            <Text style={styles.detailCtaText}>Voir détail</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={Colors.brand.orange}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function TripStat({
  icon,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
}) {
  return (
    <View style={styles.tripStat}>
      <Ionicons name={icon} size={14} color={Colors.brand.forest} />
      <Text style={styles.tripStatValue}>{value}</Text>
    </View>
  );
}

/* ---------------- Styles ---------------- */

const shadow = Platform.select({
  ios: {
    shadowColor: "#0D2C24",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  android: { elevation: 3 },
  default: {},
});

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
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.bg.base,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.round,
    backgroundColor: Colors.bg.elevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  headerTitle: {
    ...Type.title,
    color: Colors.text.primary,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },

  /* Hero */
  heroCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: Radius.lg,
    overflow: "hidden",
    ...shadow,
  },
  heroImage: {
    height: 200,
    width: "100%",
    justifyContent: "flex-end",
  },
  heroImageRadius: {
    borderRadius: Radius.lg,
  },
  heroOverlay: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: "space-between",
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.brand.orange,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  heroBadgeText: {
    ...Type.caption,
    color: Colors.text.inverse,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  heroTextBlock: {
    gap: 6,
  },
  heroTitle: {
    ...Type.title,
    color: Colors.text.inverse,
    fontSize: 24,
    fontWeight: "700",
  },
  heroSubtitle: {
    ...Type.body,
    color: "rgba(255,255,255,0.92)",
  },

  /* Sections */
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    ...Type.title,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },

  /* Filters */
  filterRow: {
    marginBottom: Spacing.md,
  },
  filterLabel: {
    ...Type.caption,
    color: Colors.text.secondary,
    fontWeight: "600",
    marginBottom: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  chipRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    paddingRight: Spacing.lg,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.round,
    backgroundColor: Colors.bg.elevated,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  chipActive: {
    backgroundColor: Colors.brand.forest,
    borderColor: Colors.brand.forest,
  },
  chipIcon: {
    marginRight: 4,
  },
  chipText: {
    ...Type.body,
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  chipTextActive: {
    color: Colors.text.inverse,
    fontWeight: "600",
  },

  /* Trip card */
  tripCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    overflow: "hidden",
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    ...shadow,
  },
  tripImage: {
    width: "100%",
    height: 170,
  },
  tripImageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 170,
  },
  tripImageBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.round,
  },
  tripImageBadgeText: {
    ...Type.caption,
    color: Colors.text.primary,
    fontWeight: "700",
  },
  tripBody: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  tripTitle: {
    ...Type.title,
    color: Colors.text.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  tripStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    justifyContent: "space-around",
  },
  tripStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tripStatDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.border.base,
  },
  tripStatValue: {
    ...Type.body,
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  dayRow: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  dayCard: {
    flex: 1,
    backgroundColor: Colors.bg.base,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    alignItems: "center",
    gap: 2,
  },
  dayLabel: {
    ...Type.caption,
    color: Colors.brand.orange,
    fontWeight: "700",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  dayKm: {
    ...Type.body,
    color: Colors.text.primary,
    fontWeight: "700",
    fontSize: 15,
  },
  dayAltitude: {
    ...Type.caption,
    color: Colors.text.muted,
    fontSize: 11,
  },
  lodgingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  lodgingText: {
    ...Type.body,
    color: Colors.text.secondary,
    fontSize: 13,
  },
  tripFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.border.subtle,
    paddingTop: Spacing.md,
  },
  priceFromLabel: {
    ...Type.caption,
    color: Colors.text.muted,
    fontSize: 11,
  },
  priceValue: {
    ...Type.body,
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  pricePerson: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.text.secondary,
  },
  detailCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    backgroundColor: "rgba(225,90,35,0.08)",
    borderRadius: Radius.round,
  },
  detailCtaPressed: {
    opacity: 0.7,
  },
  detailCtaText: {
    ...Type.body,
    color: Colors.brand.orange,
    fontWeight: "700",
    fontSize: 14,
  },

  /* Equipment */
  equipmentWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  equipmentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.round,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  equipmentChipText: {
    ...Type.body,
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: "500",
  },

  /* Final CTA */
  finalCta: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...shadow,
  },
  finalCtaTextBlock: {
    gap: 4,
  },
  finalCtaTitle: {
    ...Type.title,
    color: Colors.text.inverse,
    fontSize: 18,
    fontWeight: "700",
  },
  finalCtaSubtitle: {
    ...Type.body,
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.brand.orange,
    paddingVertical: 14,
    borderRadius: Radius.round,
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonText: {
    ...Type.body,
    color: Colors.text.inverse,
    fontWeight: "700",
    fontSize: 15,
  },
});

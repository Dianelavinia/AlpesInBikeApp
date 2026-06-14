import { View, Text, ImageBackground, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle } from "react-native-svg";
import { Colors, Type } from "@/constants/theme";
import { generateRoutePath, type ShareFormat, type ShareTemplate } from "@/lib/share";

/**
 * Carte visuelle exportable. C est ce composant qui est capture en PNG
 * via react-native-view-shot pour le partage social.
 *
 * Render different selon template choisi :
 *   - dark-bottom : photo plein, gradient sombre en bas, stats grandes
 *   - minimal     : photo respire, stats fines en haut
 *   - vintage     : cadre creme, typo serif, style carte postale
 *   - heatmap     : trace vedette grand, photo arriere-plan flou
 */

export type ShareRide = {
  title: string;
  zone: string;
  distanceKm: number;
  elevationGain: number;
  durationMin: number;
  avgSpeed: number;
  date: string;
};

export default function RideShareCard({
  ride,
  photoUrl,
  format,
  template,
  width,
}: {
  ride: ShareRide;
  photoUrl: string;
  format: ShareFormat;
  template: ShareTemplate;
  width: number;
}) {
  const aspect = format === "story" ? 16 / 9 : format === "square" ? 1 : 9 / 16;
  const height = format === "story" ? width * (16 / 9) : format === "square" ? width : width * (9 / 16);
  const routePath = generateRoutePath(ride.title.length, width, height);

  if (template === "minimal") return <MinimalCard ride={ride} photoUrl={photoUrl} width={width} height={height} routePath={routePath} />;
  if (template === "vintage") return <VintageCard ride={ride} photoUrl={photoUrl} width={width} height={height} routePath={routePath} />;
  if (template === "heatmap") return <HeatmapCard ride={ride} photoUrl={photoUrl} width={width} height={height} routePath={routePath} />;
  return <DarkBottomCard ride={ride} photoUrl={photoUrl} width={width} height={height} routePath={routePath} />;
}

// ---------------------------------------------------------------------------
// Template 1 : dark-bottom (default Strava-like)
// ---------------------------------------------------------------------------

function DarkBottomCard({ ride, photoUrl, width, height, routePath }: any) {
  return (
    <View style={[styles.card, { width, height }]}>
      <ImageBackground source={{ uri: photoUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient
        colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.05)", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.92)"]}
        locations={[0, 0.45, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.brand, { paddingTop: height * 0.04, paddingHorizontal: width * 0.06 }]}>
        <View style={styles.brandPill}>
          <Ionicons name="bicycle" size={width * 0.024} color={Colors.brand.orangeLight} />
          <Text style={[styles.brandText, { fontSize: width * 0.026 }]}>ALPES IN BIKE</Text>
        </View>
      </View>

      <View style={[styles.routeWrap, StyleSheet.absoluteFill]} pointerEvents="none">
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Path d={routePath} stroke={Colors.brand.orange} strokeWidth={width * 0.012} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.95} />
          <Path d={routePath} stroke="rgba(255,255,255,0.5)" strokeWidth={width * 0.005} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx={width * 0.42} cy={height * 0.42} r={width * 0.016} fill="#10B981" stroke="white" strokeWidth={3} />
          <Circle cx={width * 0.58} cy={height * 0.55} r={width * 0.016} fill="#E15A23" stroke="white" strokeWidth={3} />
        </Svg>
      </View>

      <View style={[styles.bottom, { paddingHorizontal: width * 0.06, paddingBottom: height * 0.04 }]}>
        <Text style={[styles.title, { fontSize: width * 0.066, lineHeight: width * 0.08 }]} numberOfLines={2}>{ride.title}</Text>
        <View style={styles.zoneRow}>
          <Ionicons name="location" size={width * 0.028} color={Colors.brand.orangeLight} />
          <Text style={[styles.zoneText, { fontSize: width * 0.032 }]}>{ride.zone}</Text>
        </View>
        <View style={[styles.statsRow, { marginTop: height * 0.025 }]}>
          <BigStat label="Distance" value={`${ride.distanceKm}`} unit="km" width={width} />
          <View style={styles.statsDiv} />
          <BigStat label="Dénivelé" value={`+${ride.elevationGain}`} unit="m" width={width} />
          <View style={styles.statsDiv} />
          <BigStat label="Durée" value={formatDur(ride.durationMin)} unit="" width={width} />
          <View style={styles.statsDiv} />
          <BigStat label="Allure" value={ride.avgSpeed.toFixed(1)} unit="km/h" width={width} />
        </View>
      </View>
    </View>
  );
}

function BigStat({ label, value, unit, width }: { label: string; value: string; unit: string; width: number }) {
  return (
    <View style={styles.bigStat}>
      <Text style={[styles.bigStatLabel, { fontSize: width * 0.022 }]}>{label.toUpperCase()}</Text>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2, marginTop: 2 }}>
        <Text style={[styles.bigStatVal, { fontSize: width * 0.046 }]}>{value}</Text>
        {unit !== "" && <Text style={[styles.bigStatUnit, { fontSize: width * 0.022 }]}>{unit}</Text>}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Template 2 : minimal
// ---------------------------------------------------------------------------

function MinimalCard({ ride, photoUrl, width, height, routePath }: any) {
  return (
    <View style={[styles.card, { width, height }]}>
      <ImageBackground source={{ uri: photoUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient colors={["rgba(0,0,0,0.45)", "rgba(0,0,0,0)"]} locations={[0, 0.35]} style={StyleSheet.absoluteFill} />

      <View style={[styles.minTop, { padding: width * 0.05 }]}>
        <Text style={[styles.minLabel, { fontSize: width * 0.024 }]}>ALPES IN BIKE</Text>
        <Text style={[styles.minTitle, { fontSize: width * 0.052 }]} numberOfLines={1}>{ride.title}</Text>
        <Text style={[styles.minZone, { fontSize: width * 0.028 }]}>{ride.zone}</Text>
      </View>

      <View style={[styles.routeWrap, StyleSheet.absoluteFill]} pointerEvents="none">
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Path d={routePath} stroke="rgba(255,255,255,0.95)" strokeWidth={width * 0.008} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>

      <View style={[styles.minBottom, { padding: width * 0.05 }]}>
        <View style={[styles.minPill]}>
          <Text style={[styles.minPillText, { fontSize: width * 0.028 }]}>
            {ride.distanceKm} km · +{ride.elevationGain} m · {formatDur(ride.durationMin)}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Template 3 : vintage carte postale
// ---------------------------------------------------------------------------

function VintageCard({ ride, photoUrl, width, height, routePath }: any) {
  const innerPad = width * 0.05;
  return (
    <View style={[styles.card, { width, height, backgroundColor: "#F2EBDC" }]}>
      <View style={{ flex: 1, margin: innerPad, borderWidth: 3, borderColor: "#0D4F3D", borderRadius: 4, overflow: "hidden" }}>
        <ImageBackground source={{ uri: photoUrl }} style={{ flex: 1 }} resizeMode="cover">
          <LinearGradient colors={["rgba(242,235,220,0)", "rgba(242,235,220,0.95)"]} locations={[0.5, 1]} style={StyleSheet.absoluteFill} />

          <View style={styles.routeWrap} pointerEvents="none">
            <Svg width={width - innerPad * 2 - 6} height={height - innerPad * 2 - 6} viewBox={`0 0 ${width} ${height}`}>
              <Path d={routePath} stroke="#B8431A" strokeWidth={width * 0.008} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>

          <View style={{ flex: 1, justifyContent: "flex-end", padding: width * 0.04 }}>
            <Text style={[styles.vintageStamp, { fontSize: width * 0.026 }]}>ALPES IN BIKE · SAISON 2026</Text>
            <Text style={[styles.vintageTitle, { fontSize: width * 0.05 }]} numberOfLines={2}>{ride.title}</Text>
            <Text style={[styles.vintageZone, { fontSize: width * 0.03 }]}>{ride.zone}</Text>
            <View style={[styles.vintageStats, { marginTop: width * 0.03 }]}>
              <Text style={[styles.vintageStat, { fontSize: width * 0.038 }]}>{ride.distanceKm} km</Text>
              <Text style={[styles.vintageDot, { fontSize: width * 0.04 }]}>·</Text>
              <Text style={[styles.vintageStat, { fontSize: width * 0.038 }]}>+{ride.elevationGain} m</Text>
              <Text style={[styles.vintageDot, { fontSize: width * 0.04 }]}>·</Text>
              <Text style={[styles.vintageStat, { fontSize: width * 0.038 }]}>{formatDur(ride.durationMin)}</Text>
            </View>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Template 4 : heatmap (trace XL, photo flou)
// ---------------------------------------------------------------------------

function HeatmapCard({ ride, photoUrl, width, height, routePath }: any) {
  return (
    <View style={[styles.card, { width, height, backgroundColor: Colors.brand.ink }]}>
      <ImageBackground source={{ uri: photoUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={18} />
      <LinearGradient colors={["rgba(10,10,10,0.65)", "rgba(10,10,10,0.85)"]} style={StyleSheet.absoluteFill} />

      <View style={[styles.heatBrand, { paddingTop: height * 0.05, paddingHorizontal: width * 0.06 }]}>
        <Text style={[styles.heatBrandText, { fontSize: width * 0.024 }]}>ALPES IN BIKE</Text>
        <Text style={[styles.heatTitle, { fontSize: width * 0.048 }]} numberOfLines={2}>{ride.title}</Text>
      </View>

      <View style={[styles.routeWrap, StyleSheet.absoluteFill]} pointerEvents="none">
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Path d={routePath} stroke={Colors.brand.orange} strokeWidth={width * 0.018} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.4} />
          <Path d={routePath} stroke={Colors.brand.orangeLight} strokeWidth={width * 0.008} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx={width * 0.42} cy={height * 0.42} r={width * 0.022} fill="#10B981" stroke="white" strokeWidth={4} />
          <Circle cx={width * 0.58} cy={height * 0.55} r={width * 0.022} fill="#E15A23" stroke="white" strokeWidth={4} />
        </Svg>
      </View>

      <View style={[styles.heatStatsBox, { bottom: height * 0.05, marginHorizontal: width * 0.06 }]}>
        <View style={styles.heatStatGroup}>
          <Text style={[styles.heatStatVal, { fontSize: width * 0.06 }]}>{ride.distanceKm}</Text>
          <Text style={[styles.heatStatLabel, { fontSize: width * 0.022 }]}>KILOMÈTRES</Text>
        </View>
        <View style={styles.heatStatGroup}>
          <Text style={[styles.heatStatVal, { fontSize: width * 0.06 }]}>+{ride.elevationGain}</Text>
          <Text style={[styles.heatStatLabel, { fontSize: width * 0.022 }]}>MÈTRES D+</Text>
        </View>
        <View style={styles.heatStatGroup}>
          <Text style={[styles.heatStatVal, { fontSize: width * 0.06 }]}>{formatDur(ride.durationMin)}</Text>
          <Text style={[styles.heatStatLabel, { fontSize: width * 0.022 }]}>TEMPS</Text>
        </View>
      </View>
    </View>
  );
}

function formatDur(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${m}min`;
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, overflow: "hidden", position: "relative" },

  brand: { position: "absolute", top: 0, left: 0, right: 0 },
  brandPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.45)", alignSelf: "flex-start" },
  brandText: { color: "#FFF", fontWeight: "700", letterSpacing: 1.2 },

  routeWrap: { position: "absolute", alignItems: "center", justifyContent: "center" },

  bottom: { position: "absolute", left: 0, right: 0, bottom: 0 },
  title: { color: "#FFF", fontWeight: "700" },
  zoneRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  zoneText: { color: "rgba(255,255,255,0.85)", fontWeight: "600" },

  statsRow: { flexDirection: "row", alignItems: "center", paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.18)" },
  statsDiv: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.18)" },
  bigStat: { flex: 1, alignItems: "center" },
  bigStatLabel: { color: "rgba(255,255,255,0.7)", fontWeight: "700", letterSpacing: 1 },
  bigStatVal: { color: "#FFF", fontWeight: "700" },
  bigStatUnit: { color: "rgba(255,255,255,0.7)", fontWeight: "600" },

  minTop: { position: "absolute", top: 0, left: 0, right: 0 },
  minLabel: { color: "rgba(255,255,255,0.7)", fontWeight: "700", letterSpacing: 1.5 },
  minTitle: { color: "#FFF", fontWeight: "700", marginTop: 8 },
  minZone: { color: "rgba(255,255,255,0.78)", marginTop: 4 },

  minBottom: { position: "absolute", left: 0, right: 0, bottom: 0, alignItems: "center" },
  minPill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.5)" },
  minPillText: { color: "#FFF", fontWeight: "700" },

  vintageStamp: { color: "#0D4F3D", fontWeight: "700", letterSpacing: 1.4, marginBottom: 6 },
  vintageTitle: { color: "#0A0A0A", fontWeight: "700" },
  vintageZone: { color: "#525252", marginTop: 4, fontStyle: "italic" },
  vintageStats: { flexDirection: "row", alignItems: "center", gap: 6 },
  vintageStat: { color: "#0A0A0A", fontWeight: "700" },
  vintageDot: { color: "#0D4F3D" },

  heatBrand: { gap: 4 },
  heatBrandText: { color: "rgba(255,255,255,0.65)", fontWeight: "700", letterSpacing: 1.6 },
  heatTitle: { color: "#FFF", fontWeight: "700", marginTop: 4 },
  heatStatsBox: { position: "absolute", left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.18)" },
  heatStatGroup: { alignItems: "center", flex: 1 },
  heatStatVal: { color: "#FFF", fontWeight: "700" },
  heatStatLabel: { color: "rgba(255,255,255,0.6)", fontWeight: "700", letterSpacing: 1, marginTop: 2 },
});

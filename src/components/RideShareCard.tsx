import { View, Text, ImageBackground, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle } from "react-native-svg";
import { Colors, Type } from "@/constants/theme";
import { projectRouteToPath, generateRoutePath, type ShareFormat, type ShareTemplate } from "@/lib/share";

/**
 * Carte visuelle exportable. C est ce composant qui est capture en PNG
 * via react-native-view-shot pour le partage social.
 *
 * Le trace GPS est rendu fidele au parcours reel via projectRouteToPath
 * qui projette les coordonnees lat/lng en SVG path en preservant le ratio
 * terrain (correction longitude par cos(lat)).
 *
 * Le branding ALPES IN BIKE est en bas facon Strava, jamais en haut.
 */

export type ShareRide = {
  title: string;
  zone: string;
  distanceKm: number;
  elevationGain: number;
  durationMin: number;
  avgSpeed: number;
  date: string;
  routeCoordinates?: [number, number][];
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
  const height = format === "story" ? width * (16 / 9) : format === "square" ? width : width * (9 / 16);

  // Reserve la zone basse pour les stats et le branding
  const routeArea = { width: width * 0.78, height: height * 0.45, offsetY: height * 0.12 };
  const realProjection = projectRouteToPath(ride.routeCoordinates, routeArea.width, routeArea.height, 0.05);
  const routePath = realProjection?.path ?? generateRoutePath(ride.title.length, routeArea.width, routeArea.height);
  const start = realProjection?.start ?? [routeArea.width * 0.3, routeArea.height * 0.4];
  const end = realProjection?.end ?? [routeArea.width * 0.65, routeArea.height * 0.6];

  const routeProps = { width, height, routeArea, routePath, start, end };

  if (template === "minimal") return <MinimalCard ride={ride} photoUrl={photoUrl} {...routeProps} />;
  if (template === "vintage") return <VintageCard ride={ride} photoUrl={photoUrl} {...routeProps} />;
  if (template === "heatmap") return <HeatmapCard ride={ride} photoUrl={photoUrl} {...routeProps} />;
  return <DarkBottomCard ride={ride} photoUrl={photoUrl} {...routeProps} />;
}

type RouteProps = {
  width: number;
  height: number;
  routeArea: { width: number; height: number; offsetY: number };
  routePath: string;
  start: [number, number];
  end: [number, number];
};

function RouteSvg({ routeArea, routePath, start, end, strokeColor, glowColor, strokeWidth }: RouteProps & { strokeColor: string; glowColor: string; strokeWidth: number }) {
  return (
    <Svg
      width={routeArea.width}
      height={routeArea.height}
      viewBox={`0 0 ${routeArea.width} ${routeArea.height}`}
    >
      <Path d={routePath} stroke={glowColor} strokeWidth={strokeWidth * 2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.45} />
      <Path d={routePath} stroke={strokeColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={start[0]} cy={start[1]} r={strokeWidth * 1.6} fill="#10B981" stroke="white" strokeWidth={Math.max(2, strokeWidth * 0.6)} />
      <Circle cx={end[0]} cy={end[1]} r={strokeWidth * 1.6} fill="#E15A23" stroke="white" strokeWidth={Math.max(2, strokeWidth * 0.6)} />
    </Svg>
  );
}

function Watermark({ width, color = "rgba(255,255,255,0.85)", subColor = "rgba(255,255,255,0.55)" }: { width: number; color?: string; subColor?: string }) {
  return (
    <View style={styles.watermark}>
      <View style={styles.watermarkLine}>
        <Ionicons name="bicycle" size={width * 0.034} color={color} />
        <Text style={[styles.watermarkBrand, { fontSize: width * 0.034, color }]}>ALPES IN BIKE</Text>
      </View>
      <Text style={[styles.watermarkUrl, { fontSize: width * 0.02, color: subColor }]}>alpesinbike.fr</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Template 1 : dark-bottom (default Strava-like)
// ---------------------------------------------------------------------------

function DarkBottomCard({ ride, photoUrl, width, height, routeArea, routePath, start, end }: RouteProps & { ride: ShareRide; photoUrl: string }) {
  return (
    <View style={[styles.card, { width, height }]}>
      <ImageBackground source={{ uri: photoUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient
        colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.05)", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.95)"]}
        locations={[0, 0.4, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.routeWrap, { top: routeArea.offsetY, height: routeArea.height, width }]} pointerEvents="none">
        <RouteSvg
          width={width} height={height} routeArea={routeArea}
          routePath={routePath} start={start} end={end}
          strokeColor={Colors.brand.orange} glowColor="rgba(255,255,255,0.7)" strokeWidth={width * 0.013}
        />
      </View>

      <View style={[styles.bottom, { paddingHorizontal: width * 0.06, paddingBottom: height * 0.04 }]}>
        <Text style={[styles.title, { fontSize: width * 0.066, lineHeight: width * 0.08 }]} numberOfLines={2}>{ride.title}</Text>
        <View style={styles.zoneRow}>
          <Ionicons name="location" size={width * 0.028} color={Colors.brand.orangeLight} />
          <Text style={[styles.zoneText, { fontSize: width * 0.032 }]}>{ride.zone}</Text>
        </View>
        <View style={[styles.statsRow, { marginTop: height * 0.022 }]}>
          <BigStat label="Distance" value={`${ride.distanceKm}`} unit="km" width={width} />
          <View style={styles.statsDiv} />
          <BigStat label="Dénivelé" value={`+${ride.elevationGain}`} unit="m" width={width} />
          <View style={styles.statsDiv} />
          <BigStat label="Durée" value={formatDur(ride.durationMin)} unit="" width={width} />
          <View style={styles.statsDiv} />
          <BigStat label="Allure" value={ride.avgSpeed.toFixed(1)} unit="km/h" width={width} />
        </View>

        <View style={[styles.brandFoot, { marginTop: height * 0.022, paddingTop: height * 0.018 }]}>
          <View style={styles.brandFootLeft}>
            <Ionicons name="bicycle" size={width * 0.034} color={Colors.brand.orangeLight} />
            <Text style={[styles.brandFootText, { fontSize: width * 0.034 }]}>ALPES IN BIKE</Text>
          </View>
          <Text style={[styles.brandFootUrl, { fontSize: width * 0.022 }]}>alpesinbike.fr</Text>
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
// Template 2 : minimal (titre haut, trace milieu, brand bas)
// ---------------------------------------------------------------------------

function MinimalCard({ ride, photoUrl, width, height, routeArea, routePath, start, end }: RouteProps & { ride: ShareRide; photoUrl: string }) {
  return (
    <View style={[styles.card, { width, height }]}>
      <ImageBackground source={{ uri: photoUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0.55)"]} locations={[0, 0.3, 0.7, 1]} style={StyleSheet.absoluteFill} />

      <View style={[styles.minTop, { padding: width * 0.05 }]}>
        <Text style={[styles.minTitle, { fontSize: width * 0.054 }]} numberOfLines={2}>{ride.title}</Text>
        <Text style={[styles.minZone, { fontSize: width * 0.028 }]}>{ride.zone}</Text>
      </View>

      <View style={[styles.routeWrap, { top: routeArea.offsetY, height: routeArea.height, width }]} pointerEvents="none">
        <RouteSvg
          width={width} height={height} routeArea={routeArea}
          routePath={routePath} start={start} end={end}
          strokeColor="rgba(255,255,255,0.95)" glowColor="rgba(0,0,0,0.25)" strokeWidth={width * 0.009}
        />
      </View>

      <View style={[styles.minBottom, { padding: width * 0.05 }]}>
        <View style={styles.minPill}>
          <Text style={[styles.minPillText, { fontSize: width * 0.028 }]}>
            {ride.distanceKm} km · +{ride.elevationGain} m · {formatDur(ride.durationMin)}
          </Text>
        </View>
        <Watermark width={width} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Template 3 : vintage carte postale
// ---------------------------------------------------------------------------

function VintageCard({ ride, photoUrl, width, height, routeArea, routePath, start, end }: RouteProps & { ride: ShareRide; photoUrl: string }) {
  const innerPad = width * 0.05;
  const photoWidth = width - innerPad * 2 - 6;
  const photoHeight = height - innerPad * 2 - 6;
  return (
    <View style={[styles.card, { width, height, backgroundColor: "#F2EBDC" }]}>
      <View style={{ flex: 1, margin: innerPad, borderWidth: 3, borderColor: "#0D4F3D", borderRadius: 4, overflow: "hidden" }}>
        <ImageBackground source={{ uri: photoUrl }} style={{ flex: 1 }} resizeMode="cover">
          <LinearGradient colors={["rgba(242,235,220,0)", "rgba(242,235,220,0.96)"]} locations={[0.4, 1]} style={StyleSheet.absoluteFill} />

          <View style={[styles.routeWrap, { top: photoHeight * 0.06, height: photoHeight * 0.45, width: photoWidth }]} pointerEvents="none">
            <RouteSvg
              width={photoWidth} height={photoHeight} routeArea={{ width: photoWidth, height: photoHeight * 0.45, offsetY: 0 }}
              routePath={routePath} start={start} end={end}
              strokeColor="#B8431A" glowColor="rgba(255,255,255,0.6)" strokeWidth={width * 0.009}
            />
          </View>

          <View style={{ flex: 1, justifyContent: "flex-end", padding: width * 0.04 }}>
            <Text style={[styles.vintageTitle, { fontSize: width * 0.05 }]} numberOfLines={2}>{ride.title}</Text>
            <Text style={[styles.vintageZone, { fontSize: width * 0.03 }]}>{ride.zone}</Text>
            <View style={[styles.vintageStats, { marginTop: width * 0.025 }]}>
              <Text style={[styles.vintageStat, { fontSize: width * 0.038 }]}>{ride.distanceKm} km</Text>
              <Text style={[styles.vintageDot, { fontSize: width * 0.04 }]}>·</Text>
              <Text style={[styles.vintageStat, { fontSize: width * 0.038 }]}>+{ride.elevationGain} m</Text>
              <Text style={[styles.vintageDot, { fontSize: width * 0.04 }]}>·</Text>
              <Text style={[styles.vintageStat, { fontSize: width * 0.038 }]}>{formatDur(ride.durationMin)}</Text>
            </View>
            <View style={[styles.vintageBrandRow, { marginTop: width * 0.03, paddingTop: width * 0.022 }]}>
              <Ionicons name="bicycle" size={width * 0.03} color="#0D4F3D" />
              <Text style={[styles.vintageBrand, { fontSize: width * 0.028 }]}>ALPES IN BIKE</Text>
              <Text style={[styles.vintageBrandDot, { fontSize: width * 0.028 }]}>·</Text>
              <Text style={[styles.vintageBrandUrl, { fontSize: width * 0.024 }]}>alpesinbike.fr</Text>
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

function HeatmapCard({ ride, photoUrl, width, height, routeArea, routePath, start, end }: RouteProps & { ride: ShareRide; photoUrl: string }) {
  const bigArea = { width: width * 0.85, height: height * 0.55, offsetY: height * 0.1 };
  return (
    <View style={[styles.card, { width, height, backgroundColor: Colors.brand.ink }]}>
      <ImageBackground source={{ uri: photoUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={18} />
      <LinearGradient colors={["rgba(10,10,10,0.7)", "rgba(10,10,10,0.88)"]} style={StyleSheet.absoluteFill} />

      <View style={[styles.heatTopText, { paddingTop: height * 0.06, paddingHorizontal: width * 0.06 }]}>
        <Text style={[styles.heatTitle, { fontSize: width * 0.052 }]} numberOfLines={2}>{ride.title}</Text>
        <View style={styles.zoneRow}>
          <Ionicons name="location" size={width * 0.028} color={Colors.brand.orangeLight} />
          <Text style={[styles.zoneText, { fontSize: width * 0.03 }]}>{ride.zone}</Text>
        </View>
      </View>

      <View style={[styles.routeWrap, { top: bigArea.offsetY, height: bigArea.height, width }]} pointerEvents="none">
        <RouteSvg
          width={width} height={height} routeArea={bigArea}
          routePath={(() => {
            const big = projectRouteToPath(ride.routeCoordinates, bigArea.width, bigArea.height, 0.06);
            return big?.path ?? routePath;
          })()}
          start={(() => {
            const big = projectRouteToPath(ride.routeCoordinates, bigArea.width, bigArea.height, 0.06);
            return big?.start ?? start;
          })()}
          end={(() => {
            const big = projectRouteToPath(ride.routeCoordinates, bigArea.width, bigArea.height, 0.06);
            return big?.end ?? end;
          })()}
          strokeColor={Colors.brand.orange} glowColor={Colors.brand.orangeLight} strokeWidth={width * 0.018}
        />
      </View>

      <View style={[styles.heatStatsBox, { bottom: height * 0.1, paddingHorizontal: width * 0.06 }]}>
        <View style={styles.heatStatGroup}>
          <Text style={[styles.heatStatVal, { fontSize: width * 0.058 }]}>{ride.distanceKm}</Text>
          <Text style={[styles.heatStatLabel, { fontSize: width * 0.022 }]}>KILOMÈTRES</Text>
        </View>
        <View style={styles.heatStatGroup}>
          <Text style={[styles.heatStatVal, { fontSize: width * 0.058 }]}>+{ride.elevationGain}</Text>
          <Text style={[styles.heatStatLabel, { fontSize: width * 0.022 }]}>MÈTRES D+</Text>
        </View>
        <View style={styles.heatStatGroup}>
          <Text style={[styles.heatStatVal, { fontSize: width * 0.058 }]}>{formatDur(ride.durationMin)}</Text>
          <Text style={[styles.heatStatLabel, { fontSize: width * 0.022 }]}>TEMPS</Text>
        </View>
      </View>

      <View style={[styles.heatBrandFoot, { bottom: height * 0.035, paddingHorizontal: width * 0.06 }]}>
        <Ionicons name="bicycle" size={width * 0.034} color={Colors.brand.orangeLight} />
        <Text style={[styles.brandFootText, { fontSize: width * 0.034 }]}>ALPES IN BIKE</Text>
        <Text style={[styles.brandFootDot, { fontSize: width * 0.028 }]}>·</Text>
        <Text style={[styles.brandFootUrl, { fontSize: width * 0.024 }]}>alpesinbike.fr</Text>
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

  routeWrap: { position: "absolute", left: 0, right: 0, alignItems: "center", justifyContent: "center" },

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

  brandFoot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.18)" },
  brandFootLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  brandFootText: { color: "#FFF", fontWeight: "700", letterSpacing: 1.6 },
  brandFootUrl: { color: "rgba(255,255,255,0.6)" },
  brandFootDot: { color: "rgba(255,255,255,0.6)" },

  minTop: { position: "absolute", top: 0, left: 0, right: 0 },
  minTitle: { color: "#FFF", fontWeight: "700" },
  minZone: { color: "rgba(255,255,255,0.85)", marginTop: 4 },

  minBottom: { position: "absolute", left: 0, right: 0, bottom: 0, alignItems: "center", gap: 12 },
  minPill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.5)" },
  minPillText: { color: "#FFF", fontWeight: "700" },

  watermark: { alignItems: "center", gap: 2 },
  watermarkLine: { flexDirection: "row", alignItems: "center", gap: 6 },
  watermarkBrand: { fontWeight: "700", letterSpacing: 1.6 },
  watermarkUrl: { letterSpacing: 0.5 },

  vintageTitle: { color: "#0A0A0A", fontWeight: "700" },
  vintageZone: { color: "#525252", marginTop: 4, fontStyle: "italic" },
  vintageStats: { flexDirection: "row", alignItems: "center", gap: 6 },
  vintageStat: { color: "#0A0A0A", fontWeight: "700" },
  vintageDot: { color: "#0D4F3D" },
  vintageBrandRow: { flexDirection: "row", alignItems: "center", gap: 5, borderTopWidth: 1, borderTopColor: "rgba(13,79,61,0.25)" },
  vintageBrand: { color: "#0D4F3D", fontWeight: "700", letterSpacing: 1.5 },
  vintageBrandDot: { color: "#0D4F3D" },
  vintageBrandUrl: { color: "#525252" },

  heatTopText: { gap: 4 },
  heatTitle: { color: "#FFF", fontWeight: "700" },
  heatStatsBox: { position: "absolute", left: 0, right: 0, flexDirection: "row", justifyContent: "space-between" },
  heatStatGroup: { alignItems: "center", flex: 1 },
  heatStatVal: { color: "#FFF", fontWeight: "700" },
  heatStatLabel: { color: "rgba(255,255,255,0.6)", fontWeight: "700", letterSpacing: 1, marginTop: 2 },
  heatBrandFoot: { position: "absolute", left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
});

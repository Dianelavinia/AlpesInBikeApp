import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { Colors } from "@/constants/theme";

/**
 * Représentation stylisée d'une trace GPS.
 * Sera remplacé par react-native-maps avec polyline réelle plus tard.
 */

type Props = {
  height?: number;
  variant?: "card" | "full";
  seed?: number;
};

export default function RideMap({ height = 180, variant = "card", seed = 0 }: Props) {
  const isCard = variant === "card";
  // Génère un tracé pseudo-réaliste avec un seed (pour varier entre rides)
  const path = generatePath(seed);

  return (
    <View style={[styles.container, { height }, isCard ? styles.card : styles.full]}>
      <Svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#E7F0E5" />
            <Stop offset="100%" stopColor="#D5E5D4" />
          </LinearGradient>
          <LinearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor={Colors.brand.orange} />
            <Stop offset="100%" stopColor={Colors.brand.orangeDark} />
          </LinearGradient>
        </Defs>
        <Path d="M0 0 H400 V200 H0 Z" fill="url(#bgGrad)" />

        {/* Reliefs simulés */}
        <Path d="M0 140 Q50 100 100 130 T200 110 T300 125 T400 100 V200 H0 Z" fill="rgba(13,79,61,0.08)" />
        <Path d="M0 165 Q60 140 130 160 T260 155 T400 145 V200 H0 Z" fill="rgba(13,79,61,0.12)" />

        {/* Rivières/routes claires */}
        <Path d="M-10 90 Q120 70 220 85 T420 80" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" />

        {/* Trace ride */}
        <Path d={path} stroke="url(#routeGrad)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Path d={path} stroke="white" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.25" />

        {/* Points de départ et arrivée */}
        <Circle cx={20} cy={150} r={7} fill="white" />
        <Circle cx={20} cy={150} r={4} fill={Colors.brand.forest} />
        <Circle cx={380} cy={60} r={7} fill="white" />
        <Circle cx={380} cy={60} r={4} fill={Colors.brand.orange} />
      </Svg>
    </View>
  );
}

function generatePath(seed: number): string {
  // PRNG simple seeded pour avoir un tracé reproductible par ride
  const rand = (i: number) => {
    const x = Math.sin(seed * 9301 + i * 49297) * 233280;
    return x - Math.floor(x);
  };
  const points: [number, number][] = [];
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = 20 + t * 360;
    const baseY = 150 - t * 90; // descend de gauche vers haut-droit
    const noise = (rand(i) - 0.5) * 50;
    points.push([x, Math.max(20, Math.min(180, baseY + noise))]);
  }
  return points
    .map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`))
    .join(" ");
}

const styles = StyleSheet.create({
  container: { overflow: "hidden" },
  card: { borderRadius: 16 },
  full: { borderRadius: 0 },
});

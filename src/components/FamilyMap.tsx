import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G } from "react-native-svg";
import { Colors } from "@/constants/theme";
import type { FamilyMember } from "@/lib/family";

type Props = {
  members: FamilyMember[];
  height?: number;
};

const W = 400;
const H = 280;

export default function FamilyMap({ members, height = 280 }: Props) {
  // Convert lat/lon to local SVG coords (simple projection around Chambéry)
  const cx = 45.568;
  const cy = 5.93;
  const scale = 20000;

  const projected = members.map((m) => ({
    ...m,
    x: W / 2 + (m.position.lon - cy) * scale,
    y: H / 2 - (m.position.lat - cx) * scale,
  }));

  return (
    <View style={[styles.container, { height }]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#E7F0E5" />
            <Stop offset="100%" stopColor="#C7DBC4" />
          </LinearGradient>
        </Defs>
        <Path d={`M0 0 H${W} V${H} H0 Z`} fill="url(#bg)" />

        {/* Hills */}
        <Path d={`M0 ${H * 0.6} Q${W * 0.25} ${H * 0.45} ${W * 0.5} ${H * 0.55} T${W} ${H * 0.5} V${H} H0 Z`} fill="rgba(13,79,61,0.1)" />
        <Path d={`M0 ${H * 0.75} Q${W * 0.3} ${H * 0.65} ${W * 0.5} ${H * 0.72} T${W} ${H * 0.7} V${H} H0 Z`} fill="rgba(13,79,61,0.16)" />

        {/* Trail */}
        <Path
          d={`M ${projected[0]?.x ?? W / 2} ${projected[0]?.y ?? H / 2} ` +
            projected.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ")}
          stroke={Colors.brand.orange}
          strokeWidth="3"
          strokeDasharray="6 4"
          fill="none"
          strokeLinecap="round"
        />

        {/* Pulse for moving members */}
        {projected.map((m, i) => (
          <G key={m.id}>
            {m.status === "riding" && (
              <Circle cx={m.x} cy={m.y} r={18} fill={getColor(m)} opacity={0.18} />
            )}
            <Circle cx={m.x} cy={m.y} r={14} fill="white" />
            <Circle cx={m.x} cy={m.y} r={12} fill={getColor(m)} />
          </G>
        ))}
      </Svg>

      {/* Avatars overlay */}
      {projected.map((m) => (
        <View key={`avat-${m.id}`} style={[styles.avatarOverlay, { left: `${(m.x / W) * 100}%`, top: `${(m.y / H) * 100}%` }]}>
          <Text style={styles.avatarLetters}>{m.avatar}</Text>
        </View>
      ))}
    </View>
  );
}

function getColor(m: FamilyMember): string {
  if (m.role === "parent") return Colors.brand.forest;
  if (m.role === "ado") return Colors.brand.orange;
  return "#B8431A";
}

const styles = StyleSheet.create({
  container: { borderRadius: 16, overflow: "hidden", position: "relative" },
  avatarOverlay: { position: "absolute", width: 24, height: 24, marginLeft: -12, marginTop: -12, alignItems: "center", justifyContent: "center", pointerEvents: "none" },
  avatarLetters: { color: "white", fontSize: 10, fontWeight: "700" },
});

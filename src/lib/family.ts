/**
 * Groupe famille avec position live des membres.
 * À brancher Supabase Realtime + expo-location background.
 */

export type FamilyRole = "parent" | "enfant" | "ado";
export type MemberStatus = "riding" | "paused" | "idle" | "offline";

export type FamilyMember = {
  id: string;
  name: string;
  avatar: string;
  role: FamilyRole;
  age?: number;
  status: MemberStatus;
  battery?: number;
  bike: string;
  position: { lat: number; lon: number };
  distanceFromYou: number;
  lastSeenMin: number;
  pace: number;
  totalKm: number;
};

export type FamilyAlert = {
  id: string;
  type: "distance" | "stopped" | "battery_low" | "off_route" | "fall";
  memberName: string;
  message: string;
  time: string;
  severity: "info" | "warning" | "critical";
};

export const FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: "m-1",
    name: "Marie (vous)",
    avatar: "MR",
    role: "parent",
    status: "riding",
    bike: "Giant Trance X E+",
    position: { lat: 45.566, lon: 5.929 },
    distanceFromYou: 0,
    lastSeenMin: 0,
    pace: 12.4,
    totalKm: 8.2,
    battery: 78,
  },
  {
    id: "m-2",
    name: "Thomas",
    avatar: "TH",
    role: "parent",
    status: "riding",
    bike: "LIV Intrigue X",
    position: { lat: 45.572, lon: 5.935 },
    distanceFromYou: 0.4,
    lastSeenMin: 0,
    pace: 11.8,
    totalKm: 8.0,
    battery: 65,
  },
  {
    id: "m-3",
    name: "Lucas",
    avatar: "LU",
    role: "ado",
    age: 14,
    status: "riding",
    bike: "Woom Up 5",
    position: { lat: 45.568, lon: 5.926 },
    distanceFromYou: 0.3,
    lastSeenMin: 0,
    pace: 10.2,
    totalKm: 7.8,
    battery: 42,
  },
  {
    id: "m-4",
    name: "Léa",
    avatar: "LE",
    role: "enfant",
    age: 9,
    status: "paused",
    bike: "Woom Explore 5",
    position: { lat: 45.564, lon: 5.931 },
    distanceFromYou: 0.5,
    lastSeenMin: 2,
    pace: 0,
    totalKm: 6.5,
  },
];

export const FAMILY_ALERTS: FamilyAlert[] = [
  { id: "al-1", type: "battery_low", memberName: "Lucas", message: "Batterie VTTAE à 42%, suggérer mode Eco", time: "il y a 3 min", severity: "warning" },
  { id: "al-2", type: "stopped", memberName: "Léa", message: "Arrêtée depuis 2 min, tout va bien ?", time: "il y a 2 min", severity: "info" },
];

export const STATUS_META: Record<MemberStatus, { label: string; color: string }> = {
  riding: { label: "En route", color: "#0D4F3D" },
  paused: { label: "Pause", color: "#F59E0B" },
  idle: { label: "Au repos", color: "#737373" },
  offline: { label: "Hors ligne", color: "#A8A29E" },
};

export const ROLE_META: Record<FamilyRole, { label: string; color: string; bg: string }> = {
  parent: { label: "Parent", color: "#0D4F3D", bg: "rgba(13,79,61,0.12)" },
  ado: { label: "Ado", color: "#E15A23", bg: "rgba(225,90,35,0.12)" },
  enfant: { label: "Enfant", color: "#B8431A", bg: "rgba(184,67,26,0.12)" },
};

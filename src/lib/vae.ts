/**
 * Assistant VAE intelligent : autonomie, modes, bornes recharge.
 */

export type AssistMode = "off" | "eco" | "sport" | "turbo";

export type VAEStatus = {
  batteryPercent: number;
  batteryWh: number;
  estimatedRange: { eco: number; sport: number; turbo: number };
  currentMode: AssistMode;
  averageConsumption: number;
  motorTemp: number;
  remainingTime: number;
};

export type ChargingStation = {
  id: string;
  name: string;
  type: "partenaire" | "publique" | "borne_publique";
  distanceKm: number;
  city: string;
  available: boolean;
  power: number;
  isOpen: boolean;
  hours: string;
};

export const MODE_META: Record<AssistMode, { label: string; multiplier: number; color: string; desc: string }> = {
  off: { label: "Off", multiplier: 1.5, color: "#737373", desc: "Pas d'assistance, autonomie max" },
  eco: { label: "Eco", multiplier: 1.0, color: "#0D4F3D", desc: "Économe, idéal plat et descente" },
  sport: { label: "Sport", multiplier: 0.7, color: "#F59E0B", desc: "Polyvalent, montées modérées" },
  turbo: { label: "Turbo", multiplier: 0.5, color: "#E15A23", desc: "Puissance max, gros cols" },
};

export const MOCK_VAE: VAEStatus = {
  batteryPercent: 68,
  batteryWh: 544,
  estimatedRange: { eco: 92, sport: 64, turbo: 46 },
  currentMode: "sport",
  averageConsumption: 8.5,
  motorTemp: 38,
  remainingTime: 240,
};

export const CHARGING_STATIONS: ChargingStation[] = [
  { id: "cs-1", name: "Tom Loc, La Féclaz", type: "partenaire", distanceKm: 4.2, city: "La Féclaz", available: true, power: 36, isOpen: true, hours: "9h-19h" },
  { id: "cs-2", name: "Aillon Sport", type: "partenaire", distanceKm: 8.7, city: "Aillon-le-Jeune", available: true, power: 36, isOpen: true, hours: "9h-18h" },
  { id: "cs-3", name: "Office de Tourisme Chambéry", type: "publique", distanceKm: 12.3, city: "Chambéry", available: false, power: 22, isOpen: true, hours: "24/24" },
  { id: "cs-4", name: "Refuge du Revard", type: "publique", distanceKm: 6.8, city: "Mont Revard", available: true, power: 22, isOpen: true, hours: "Mai à octobre" },
  { id: "cs-5", name: "Gare SNCF Chambéry", type: "borne_publique", distanceKm: 11.5, city: "Chambéry", available: true, power: 11, isOpen: true, hours: "24/24" },
];

export function getSuggestion(status: VAEStatus, remainingKm: number): { text: string; tone: "info" | "warning" | "critical" } {
  const range = status.estimatedRange[status.currentMode === "off" ? "eco" : status.currentMode];
  const margin = range - remainingKm;
  if (margin < -5) return { text: `Autonomie insuffisante pour ${remainingKm} km. Passez en Eco ou recharge recommandée.`, tone: "critical" };
  if (margin < 10) return { text: `Passez en mode Eco pour terminer le parcours sereinement.`, tone: "warning" };
  if (status.currentMode === "turbo" && status.batteryPercent < 50) return { text: `Batterie sous 50%, le mode Sport prolongerait l'autonomie de 18 km.`, tone: "info" };
  return { text: `Vous pouvez terminer le parcours en mode ${MODE_META[status.currentMode].label}. Marge confortable.`, tone: "info" };
}

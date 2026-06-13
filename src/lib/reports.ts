/**
 * Signalements communautaires type Waze.
 */

export type ReportType =
  | "accident"
  | "travaux"
  | "route_fermee"
  | "arbre_tombe"
  | "nid_poule"
  | "danger"
  | "chien"
  | "trafic"
  | "boue"
  | "verglas";

export type Report = {
  id: string;
  type: ReportType;
  description: string;
  location: { lat: number; lon: number; label: string };
  reportedBy: string;
  reportedAt: string;
  confirmations: number;
  isStillThere: boolean;
};

export const REPORT_META: Record<ReportType, { label: string; icon: string; color: string }> = {
  accident: { label: "Accident", icon: "warning", color: "#EF4444" },
  travaux: { label: "Travaux", icon: "construct", color: "#F59E0B" },
  route_fermee: { label: "Route fermée", icon: "close-circle", color: "#EF4444" },
  arbre_tombe: { label: "Arbre tombé", icon: "leaf", color: "#0D4F3D" },
  nid_poule: { label: "Nid de poule", icon: "alert-circle", color: "#F59E0B" },
  danger: { label: "Danger", icon: "warning-outline", color: "#EF4444" },
  chien: { label: "Chien agressif", icon: "paw", color: "#B8431A" },
  trafic: { label: "Trafic dense", icon: "car", color: "#F59E0B" },
  boue: { label: "Boue/Glissant", icon: "rainy", color: "#0369A1" },
  verglas: { label: "Verglas", icon: "snow", color: "#0369A1" },
};

export const REPORTS: Report[] = [
  { id: "r-1", type: "arbre_tombe", description: "Gros arbre en travers du sentier, contournement difficile", location: { lat: 45.567, lon: 5.93, label: "Sentier du Revard, km 6" }, reportedBy: "Léa M.", reportedAt: "il y a 12 min", confirmations: 3, isStillThere: true },
  { id: "r-2", type: "travaux", description: "Route fermée jusqu'à fin août", location: { lat: 45.572, lon: 5.918, label: "D912 Trévignin" }, reportedBy: "Thomas D.", reportedAt: "il y a 1h", confirmations: 8, isStillThere: true },
  { id: "r-3", type: "boue", description: "Très glissant après l'orage d'hier", location: { lat: 45.565, lon: 5.934, label: "Single track des Bauges" }, reportedBy: "Marc L.", reportedAt: "il y a 2h", confirmations: 5, isStillThere: true },
  { id: "r-4", type: "chien", description: "Berger sans laisse, agressif vers les cyclistes", location: { lat: 45.563, lon: 5.92, label: "Chemin du lac, La Motte" }, reportedBy: "Sophie F.", reportedAt: "il y a 3h", confirmations: 2, isStillThere: true },
  { id: "r-5", type: "nid_poule", description: "Profond, à éviter", location: { lat: 45.564, lon: 5.926, label: "D991 sortie Le Bourget" }, reportedBy: "Camille R.", reportedAt: "il y a 5h", confirmations: 4, isStillThere: true },
];

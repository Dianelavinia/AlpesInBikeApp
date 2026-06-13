/**
 * Carnet d'entretien : historique, rappels automatiques.
 */

export type MaintenanceType =
  | "revision_complete"
  | "pneus"
  | "chaine"
  | "freins"
  | "transmission"
  | "amortisseur"
  | "batterie"
  | "selle"
  | "guidon";

export type MaintenanceEntry = {
  id: string;
  bikeName: string;
  type: MaintenanceType;
  date: string;
  kmAtDate: number;
  cost?: number;
  shop?: string;
  notes?: string;
};

export type MaintenanceReminder = {
  id: string;
  bikeName: string;
  type: MaintenanceType;
  dueIn: string;
  dueInKm?: number;
  severity: "info" | "warning" | "critical";
};

export const MAINTENANCE_META: Record<MaintenanceType, { label: string; icon: string; color: string; intervalKm: number }> = {
  revision_complete: { label: "Révision complète", icon: "construct", color: "#0D4F3D", intervalKm: 2000 },
  pneus: { label: "Changement pneus", icon: "ellipse", color: "#525252", intervalKm: 3000 },
  chaine: { label: "Chaîne", icon: "link", color: "#737373", intervalKm: 2500 },
  freins: { label: "Plaquettes de frein", icon: "warning", color: "#EF4444", intervalKm: 1500 },
  transmission: { label: "Transmission", icon: "settings", color: "#0369A1", intervalKm: 4000 },
  amortisseur: { label: "Amortisseur", icon: "git-network", color: "#F59E0B", intervalKm: 5000 },
  batterie: { label: "Batterie VAE", icon: "battery-charging", color: "#E15A23", intervalKm: 10000 },
  selle: { label: "Selle", icon: "bicycle", color: "#525252", intervalKm: 8000 },
  guidon: { label: "Guidon / cintre", icon: "git-commit", color: "#525252", intervalKm: 10000 },
};

export const MAINTENANCE_HISTORY: MaintenanceEntry[] = [
  { id: "m-1", bikeName: "Giant Trance X E+", type: "revision_complete", date: "2026-05-10", kmAtDate: 1200, cost: 89, shop: "Pignon sur Routes", notes: "RAS, vélo en bon état" },
  { id: "m-2", bikeName: "Giant Trance X E+", type: "pneus", date: "2026-04-22", kmAtDate: 1050, cost: 120, shop: "Pignon sur Routes" },
  { id: "m-3", bikeName: "Giant Trance X E+", type: "chaine", date: "2026-03-15", kmAtDate: 850, cost: 45, shop: "Pignon sur Routes" },
  { id: "m-4", bikeName: "Giant Trance X E+", type: "freins", date: "2026-02-08", kmAtDate: 620, cost: 38, shop: "Tom Loc" },
];

export const MAINTENANCE_REMINDERS: MaintenanceReminder[] = [
  { id: "rem-1", bikeName: "Giant Trance X E+", type: "freins", dueIn: "dans 250 km", dueInKm: 250, severity: "warning" },
  { id: "rem-2", bikeName: "Giant Trance X E+", type: "chaine", dueIn: "dans 1100 km", dueInKm: 1100, severity: "info" },
  { id: "rem-3", bikeName: "Giant Trance X E+", type: "revision_complete", dueIn: "dans 8 mois", severity: "info" },
];

export const STATS = {
  totalKm: 1450,
  ridesCount: 87,
  totalElevation: 32400,
  longestRide: 88,
  fastestSpeed: 71.8,
  totalHours: 142,
};

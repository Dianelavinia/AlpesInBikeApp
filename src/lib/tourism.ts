/**
 * Tourisme vélo : POI (points d'intérêt) sur carte interactive.
 */

export type POIType =
  | "vue"
  | "restaurant"
  | "cafe"
  | "fontaine"
  | "parking"
  | "recharge"
  | "reparateur"
  | "magasin"
  | "musee"
  | "baignade"
  | "refuge";

export type POI = {
  id: string;
  name: string;
  type: POIType;
  location: { lat: number; lon: number };
  city: string;
  description?: string;
  distanceKm: number;
  rating?: number;
  isOpen?: boolean;
  hours?: string;
  phone?: string;
  veloAccueil?: boolean;
};

export const POI_META: Record<POIType, { label: string; icon: string; color: string }> = {
  vue: { label: "Point de vue", icon: "camera", color: "#0369A1" },
  restaurant: { label: "Restaurant", icon: "restaurant", color: "#E15A23" },
  cafe: { label: "Café", icon: "cafe", color: "#7C3AED" },
  fontaine: { label: "Fontaine", icon: "water", color: "#0EA5E9" },
  parking: { label: "Parking", icon: "car", color: "#525252" },
  recharge: { label: "Borne recharge", icon: "battery-charging", color: "#0D4F3D" },
  reparateur: { label: "Réparateur", icon: "construct", color: "#F59E0B" },
  magasin: { label: "Magasin vélo", icon: "storefront", color: "#0D4F3D" },
  musee: { label: "Musée", icon: "library", color: "#7C3AED" },
  baignade: { label: "Baignade", icon: "water-outline", color: "#0EA5E9" },
  refuge: { label: "Refuge", icon: "home", color: "#0D4F3D" },
};

export const POIS: POI[] = [
  { id: "p-1", name: "Mont Revard panorama", type: "vue", location: { lat: 45.647, lon: 5.997 }, city: "Le Revard", description: "Vue à 360° du sommet, Mont Blanc visible par temps clair", distanceKm: 2.1, rating: 4.9 },
  { id: "p-2", name: "Restaurant Le Sommet", type: "restaurant", location: { lat: 45.648, lon: 5.996 }, city: "Le Revard", description: "Cuisine savoyarde, terrasse panoramique", distanceKm: 2.2, rating: 4.6, isOpen: true, hours: "11h-22h", phone: "+33450123456", veloAccueil: true },
  { id: "p-3", name: "Café des Cyclistes", type: "cafe", location: { lat: 45.566, lon: 5.929 }, city: "Chambéry", description: "Vélos bienvenus, parking sécurisé", distanceKm: 0.4, rating: 4.7, isOpen: true, hours: "8h-19h", veloAccueil: true },
  { id: "p-4", name: "Fontaine de la Place", type: "fontaine", location: { lat: 45.567, lon: 5.930 }, city: "Chambéry", distanceKm: 0.3 },
  { id: "p-5", name: "Plage Sevrier", type: "baignade", location: { lat: 45.860, lon: 6.140 }, city: "Sevrier", description: "Plage publique, ponton, cabines", distanceKm: 18.2, rating: 4.4 },
  { id: "p-6", name: "Pignon sur Routes", type: "reparateur", location: { lat: 45.642, lon: 5.872 }, city: "Le Bourget-du-Lac", description: "Réparation toutes marques, rapide", distanceKm: 5.3, rating: 4.8, isOpen: true, phone: "+33479987654" },
  { id: "p-7", name: "Refuge du Revard", type: "refuge", location: { lat: 45.649, lon: 5.997 }, city: "Le Revard", description: "Hébergement et repas, étape bikepacking", distanceKm: 2.0, rating: 4.5 },
  { id: "p-8", name: "Musée Savoisien", type: "musee", location: { lat: 45.566, lon: 5.928 }, city: "Chambéry", distanceKm: 0.5, isOpen: true, hours: "10h-18h" },
];

/**
 * Suggestions de parcours par filtres.
 * À brancher sur algo + Supabase + données OSM/IGN plus tard.
 */

export type BikeType = "vttae" | "vtt" | "route" | "gravel" | "ville";
export type Surface = "asphalte" | "chemin" | "single" | "mixte";
export type Difficulty = "facile" | "intermediaire" | "difficile" | "expert";

export type RouteSuggestion = {
  id: string;
  title: string;
  zone: string;
  cover: string;
  distanceKm: number;
  elevationGain: number;
  durationMin: number;
  difficulty: Difficulty;
  surface: Surface;
  bikeTypes: BikeType[];
  highlights: string[];
  startPoint: string;
  endPoint: string;
  matchScore: number;
  isLoop: boolean;
  isFamily: boolean;
};

export const ROUTE_SUGGESTIONS: RouteSuggestion[] = [
  {
    id: "r-001",
    title: "Boucle douce du Lac du Bourget",
    zone: "Aix-les-Bains",
    cover: "https://images.unsplash.com/photo-1561377718-ebad6e79bc4a?w=800&q=85",
    distanceKm: 16,
    elevationGain: 120,
    durationMin: 90,
    difficulty: "facile",
    surface: "asphalte",
    bikeTypes: ["ville", "route", "vttae"],
    highlights: ["Bord du lac", "Plage Mémard", "Vue Dent du Chat"],
    startPoint: "Aix-les-Bains centre",
    endPoint: "Aix-les-Bains centre",
    matchScore: 96,
    isLoop: true,
    isFamily: true,
  },
  {
    id: "r-002",
    title: "Mont Revard, le balcon des Alpes",
    zone: "Massif des Bauges",
    cover: "https://images.unsplash.com/photo-1591028889197-3488e003481a?w=800&q=85",
    distanceKm: 38,
    elevationGain: 1240,
    durationMin: 285,
    difficulty: "intermediaire",
    surface: "mixte",
    bikeTypes: ["vttae", "vtt"],
    highlights: ["Sommet à 1538 m", "Vue Mont Blanc", "Restaurant d'altitude"],
    startPoint: "Trévignin",
    endPoint: "Trévignin",
    matchScore: 92,
    isLoop: true,
    isFamily: false,
  },
  {
    id: "r-003",
    title: "Voie verte Annecy, en famille",
    zone: "Lac d'Annecy",
    cover: "https://images.unsplash.com/photo-1594056466093-52bcbc7f5e4b?w=800&q=85",
    distanceKm: 22,
    elevationGain: 85,
    durationMin: 120,
    difficulty: "facile",
    surface: "asphalte",
    bikeTypes: ["ville", "vttae", "vtt"],
    highlights: ["100% sécurisée", "Plages Sevrier", "Saint-Jorioz glaces"],
    startPoint: "Annecy vieille ville",
    endPoint: "Saint-Jorioz",
    matchScore: 88,
    isLoop: false,
    isFamily: true,
  },
  {
    id: "r-004",
    title: "Belledonne single track",
    zone: "Chamrousse",
    cover: "https://images.unsplash.com/photo-1674651530623-bf21d2e8fd42?w=800&q=85",
    distanceKm: 28,
    elevationGain: 1520,
    durationMin: 270,
    difficulty: "expert",
    surface: "single",
    bikeTypes: ["vtt", "vttae"],
    highlights: ["Single track engagé", "Lac Robert", "Vue Écrins"],
    startPoint: "Chamrousse 1750",
    endPoint: "Chamrousse 1750",
    matchScore: 78,
    isLoop: true,
    isFamily: false,
  },
  {
    id: "r-005",
    title: "Col du Granier, montée chrono",
    zone: "Chartreuse",
    cover: "https://images.unsplash.com/photo-1657741684242-cf65a29c180a?w=800&q=85",
    distanceKm: 32,
    elevationGain: 890,
    durationMin: 145,
    difficulty: "difficile",
    surface: "asphalte",
    bikeTypes: ["route", "vttae"],
    highlights: ["Col mythique 1134 m", "Descente technique"],
    startPoint: "Chambéry centre",
    endPoint: "Chambéry centre",
    matchScore: 85,
    isLoop: true,
    isFamily: false,
  },
];

export type Filters = {
  bikeType: BikeType | "all";
  difficulty: Difficulty | "all";
  distanceRange: [number, number];
  family: boolean;
  loop: boolean;
};

export function filterRoutes(filters: Filters): RouteSuggestion[] {
  return ROUTE_SUGGESTIONS.filter((r) => {
    if (filters.bikeType !== "all" && !r.bikeTypes.includes(filters.bikeType)) return false;
    if (filters.difficulty !== "all" && r.difficulty !== filters.difficulty) return false;
    if (r.distanceKm < filters.distanceRange[0] || r.distanceKm > filters.distanceRange[1]) return false;
    if (filters.family && !r.isFamily) return false;
    if (filters.loop && !r.isLoop) return false;
    return true;
  }).sort((a, b) => b.matchScore - a.matchScore);
}

export function getRoute(id: string) {
  return ROUTE_SUGGESTIONS.find((r) => r.id === id);
}

/**
 * Activités (rides enregistrés) - modèle de données et mock.
 * À brancher sur Supabase table `activities` plus tard.
 */

export type Difficulty = "facile" | "intermediaire" | "difficile" | "expert";

export type RideStats = {
  distanceKm: number;
  durationMin: number;
  elevationGain: number;
  avgSpeed: number;
  maxSpeed: number;
  calories?: number;
};

export type Activity = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userLevel: Difficulty;
  title: string;
  date: string;
  zone: string;
  bikeName: string;
  cover: string;
  stats: RideStats;
  difficulty: Difficulty;
  likes: number;
  comments: number;
  isLiked?: boolean;
  description?: string;
  photos?: string[];
  /** Polyline GPS reelle du ride : tableau [lat, lng]. En prod, vient de la
   * table rides.route_coords stocke en JSONB Supabase apres enregistrement. */
  routeCoordinates?: [number, number][];
};

/**
 * Genere une polyline GPS plausible autour d un point central pour les mocks.
 * En prod, les vraies coordonnees viennent du tracker GPS pendant le ride.
 */
function makeRoute(center: [number, number], radiusKm: number, seed: number, points = 120): [number, number][] {
  const [lat, lng] = center;
  // 1 deg lat ~ 111 km, 1 deg lng ~ 111 * cos(lat)
  const latPerKm = 1 / 111;
  const lngPerKm = 1 / (111 * Math.cos((lat * Math.PI) / 180));
  const coords: [number, number][] = [];
  for (let i = 0; i <= points; i++) {
    const t = (i / points) * Math.PI * 2;
    // Forme alpine sinueuse : boucle de base + 3 harmoniques
    const r = radiusKm * (
      1 +
      Math.sin(t * 3 + seed) * 0.2 +
      Math.sin(t * 7 + seed * 2.1) * 0.08 +
      Math.cos(t * 11 + seed * 1.3) * 0.04
    );
    const dy = Math.cos(t) * r * latPerKm;
    const dx = Math.sin(t) * r * lngPerKm * 0.85;
    coords.push([lat + dy, lng + dx]);
  }
  return coords;
}

export const DIFFICULTY_META: Record<Difficulty, { label: string; color: string; bg: string }> = {
  facile: { label: "Facile", color: "#0D4F3D", bg: "rgba(13,79,61,0.12)" },
  intermediaire: { label: "Intermédiaire", color: "#0369A1", bg: "rgba(3,105,161,0.12)" },
  difficile: { label: "Difficile", color: "#E15A23", bg: "rgba(225,90,35,0.12)" },
  expert: { label: "Expert", color: "#0A0A0A", bg: "rgba(10,10,10,0.08)" },
};

export const ACTIVITIES: Activity[] = [
  {
    id: "a-001",
    userId: "u-1",
    userName: "Léa Martin",
    userAvatar: "LM",
    userLevel: "intermediaire",
    title: "Boucle du Revard, lever de soleil",
    date: "2026-06-10T07:30:00",
    zone: "Massif des Bauges",
    bikeName: "Giant Trance X E+",
    cover: "https://images.unsplash.com/photo-1591028889197-3488e003481a?w=800&q=85",
    difficulty: "intermediaire",
    stats: { distanceKm: 38.2, durationMin: 285, elevationGain: 1240, avgSpeed: 8.0, maxSpeed: 48.5, calories: 1850 },
    likes: 24,
    comments: 6,
    description: "Première sortie de la saison, vue Mont Blanc au sommet. Magique.",
    photos: ["https://images.unsplash.com/photo-1591028889197-3488e003481a?w=800&q=85", "https://images.unsplash.com/photo-1660726373520-6c893e1b3995?w=800&q=85"],
    // Boucle autour du Revard, Massif des Bauges
    routeCoordinates: makeRoute([45.6536, 5.9789], 5.5, 1.2),
  },
  {
    id: "a-002",
    userId: "u-2",
    userName: "Thomas Dubois",
    userAvatar: "TD",
    userLevel: "expert",
    title: "Belledonne en single track",
    date: "2026-06-09T14:15:00",
    zone: "Chaîne de Belledonne",
    bikeName: "Marin Rift Zone",
    cover: "https://images.unsplash.com/photo-1674651530623-bf21d2e8fd42?w=800&q=85",
    difficulty: "expert",
    stats: { distanceKm: 28.0, durationMin: 240, elevationGain: 1520, avgSpeed: 7.0, maxSpeed: 62.1, calories: 2100 },
    likes: 47,
    comments: 12,
    description: "Le Lac Robert valait la suée. Descente technique de folie.",
    photos: ["https://images.unsplash.com/photo-1600818596647-9d5318c20a8a?w=800&q=85"],
    // Belledonne single track depuis le Lac Robert, allure technique
    routeCoordinates: makeRoute([45.1167, 5.8833], 4.2, 3.7, 140),
  },
  {
    id: "a-003",
    userId: "u-3",
    userName: "Sophie et famille",
    userAvatar: "SF",
    userLevel: "facile",
    title: "Voie verte d'Annecy en famille",
    date: "2026-06-09T10:00:00",
    zone: "Lac d'Annecy",
    bikeName: "Woom Explore 5",
    cover: "https://images.unsplash.com/photo-1594056466093-52bcbc7f5e4b?w=800&q=85",
    difficulty: "facile",
    stats: { distanceKm: 22.5, durationMin: 195, elevationGain: 85, avgSpeed: 7.0, maxSpeed: 18.5, calories: 540 },
    likes: 18,
    comments: 4,
    description: "Pause baignade à Sevrier, gaufres à Saint-Jorioz. Les enfants ont adoré.",
    // Voie verte du lac Annecy, boucle douce
    routeCoordinates: makeRoute([45.8326, 6.1750], 3.6, 5.4, 100),
  },
  {
    id: "a-004",
    userId: "u-4",
    userName: "Marc Lefèvre",
    userAvatar: "ML",
    userLevel: "difficile",
    title: "Col du Granier, montée chrono",
    date: "2026-06-08T06:45:00",
    zone: "Massif de la Chartreuse",
    bikeName: "Giant TCR Advanced",
    cover: "https://images.unsplash.com/photo-1657741684242-cf65a29c180a?w=800&q=85",
    difficulty: "difficile",
    stats: { distanceKm: 32.0, durationMin: 145, elevationGain: 890, avgSpeed: 13.2, maxSpeed: 71.8, calories: 1320 },
    likes: 31,
    comments: 8,
    description: "Nouveau PR sur la montée. Descente, jamais aussi vite.",
    // Col du Granier depuis Chambery, montee chrono
    routeCoordinates: makeRoute([45.4750, 5.9333], 5.0, 7.1, 130),
  },
  {
    id: "a-005",
    userId: "u-5",
    userName: "Camille Rivière",
    userAvatar: "CR",
    userLevel: "intermediaire",
    title: "Tour du lac du Bourget",
    date: "2026-06-07T16:00:00",
    zone: "Lac du Bourget",
    bikeName: "Giant Trance X E+",
    cover: "https://images.unsplash.com/photo-1561377718-ebad6e79bc4a?w=800&q=85",
    difficulty: "facile",
    stats: { distanceKm: 44.0, durationMin: 180, elevationGain: 320, avgSpeed: 14.7, maxSpeed: 32.5, calories: 980 },
    likes: 22,
    comments: 5,
    description: "Le grand classique. Pause à Hautecombe, le coucher de soleil par dessus la dent du chat.",
    // Tour du Lac du Bourget, boucle complete
    routeCoordinates: makeRoute([45.7333, 5.8667], 7.5, 9.3, 160),
  },
];

export function getActivity(id: string) {
  return ACTIVITIES.find((a) => a.id === id);
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffH = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  if (diffH < 1) return "il y a moins d'1h";
  if (diffH < 24) return `il y a ${Math.floor(diffH)}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "hier";
  if (diffD < 7) return `il y a ${diffD} j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

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
};

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

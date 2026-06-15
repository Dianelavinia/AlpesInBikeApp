/**
 * Recherche de copains de route.
 *
 * IDENTITE PUBLIQUE vs PRIVEE :
 *   Public (toujours visible) : pseudo (displayName), avatar (couleur+initiale ou photo),
 *     tranche d age, zone geographique floue, distance approximative, niveau, allure,
 *     bike types, vibes, langues, bio moderee
 *   Prive (uniquement apres acceptation mutuelle d invitation) :
 *     vrai nom, ville exacte, age exact, contact direct
 *
 * En prod : table buddy_profiles Supabase avec colonnes public/private.
 * Le pseudo est unique, choisi a l inscription, modifiable une fois par mois.
 */

import { useEffect, useState } from "react";
import { supabase, isSupabaseEnabled } from "./supabase";
import type { Sex, AgeBracket } from "./leaderboard";

export type BikeKind = "vttae" | "vtt" | "route" | "gravel" | "ville" | "all";
export type Level = "decouverte" | "intermediaire" | "confirme" | "expert";
export type Pace = "tranquille" | "regulier" | "soutenu" | "competitif";
export type Vibe = "famille" | "decouverte" | "perf" | "social";

export type Buddy = {
  id: string;

  // ----- IDENTITE PUBLIQUE -----
  displayName: string;        // pseudo public
  avatarInitial: string;      // 1-2 lettres du pseudo
  avatarColor: string;        // couleur fond generee deterministe
  avatarUrl?: string;          // photo uploadee optionnelle
  sex: Sex;
  ageBracket: AgeBracket;
  zone: string;                // zone floue ex "Massif des Bauges"
  distanceRange: string;       // ex "Moins de 5 km"
  bikes: BikeKind[];
  level: Level;
  pace: Pace;
  vibes: Vibe[];
  languages: string[];
  bio: string;                 // bio moderee, pas d info privee
  ridesCount: number;
  badges: number;
  matchScore: number;          // 0-100
  isFriend: boolean;
  alreadyInvited?: boolean;

  // ----- TRI INTERNE (jamais affiche) -----
  distanceKm: number;
};

export type GroupRide = {
  id: string;
  title: string;
  cover: string;
  zone: string;
  dateLabel: string;
  startTime: string;
  distanceKm: number;
  elevationGain: number;
  difficulty: Level;
  pace: Pace;
  vibe: Vibe;
  bikeKinds: BikeKind[];
  organizer: { id: string; displayName: string; avatarInitial: string; avatarColor: string };
  participants: { id: string; displayName: string; avatarInitial: string; avatarColor: string }[];
  maxParticipants: number;
  description: string;
  meetingPoint: string;
  open: boolean;
};

export type BuddyRequest = {
  id: string;
  buddy: Buddy;
  direction: "received" | "sent";
  message: string;
  sentAt: string;
  status: "pending" | "accepted" | "declined";
};

// ---------------------------------------------------------------------------
// Generateur deterministe pseudo + couleur + initiale a partir d un id
// ---------------------------------------------------------------------------

const AVATAR_PALETTE = [
  "#0D4F3D", "#E15A23", "#7C3AED", "#0369A1", "#F59E0B",
  "#10B981", "#EF4444", "#B8431A", "#4B916D", "#0EA5E9",
];

export function avatarColorFor(id: string): string {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export function avatarInitialFor(displayName: string): string {
  const cleaned = displayName.replace(/[^a-zA-Z0-9]/g, "");
  if (cleaned.length === 0) return "?";
  if (cleaned.length === 1) return cleaned.toUpperCase();
  // Pseudo "LeaM" -> LM, pseudo "Trail42" -> TR
  const upper = cleaned.replace(/[^A-Z0-9]/g, "");
  if (upper.length >= 2) return upper.slice(0, 2);
  return cleaned.slice(0, 2).toUpperCase();
}

function distanceRangeFor(km: number): string {
  if (km < 5) return "Moins de 5 km";
  if (km < 10) return "5 à 10 km";
  if (km < 25) return "10 à 25 km";
  if (km < 50) return "25 à 50 km";
  return "Plus de 50 km";
}

// ---------------------------------------------------------------------------
// Metadonnees UI partagees
// ---------------------------------------------------------------------------

export const LEVEL_META: Record<Level, { label: string; tint: string }> = {
  decouverte:    { label: "Découverte",    tint: "#0EA5E9" },
  intermediaire: { label: "Intermédiaire", tint: "#FACC15" },
  confirme:      { label: "Confirmé",       tint: "#E15A23" },
  expert:        { label: "Expert",         tint: "#B8431A" },
};

export const PACE_META: Record<Pace, { label: string; speed: string }> = {
  tranquille:  { label: "Tranquille",  speed: "12 à 16 km/h" },
  regulier:    { label: "Régulier",    speed: "16 à 22 km/h" },
  soutenu:     { label: "Soutenu",      speed: "22 à 28 km/h" },
  competitif:  { label: "Compétitif",  speed: "28 km/h et +" },
};

export const VIBE_META: Record<Vibe, { label: string; icon: string; tint: string }> = {
  famille:    { label: "Famille",       icon: "people-outline",      tint: "#0D4F3D" },
  decouverte: { label: "Découverte",    icon: "compass-outline",     tint: "#0369A1" },
  perf:       { label: "Perf",          icon: "trophy-outline",      tint: "#E15A23" },
  social:     { label: "Social",        icon: "chatbubbles-outline", tint: "#7C3AED" },
};

export const BIKE_META: Record<BikeKind, { label: string; icon: string }> = {
  vttae:  { label: "VTTAE",  icon: "battery-charging-outline" },
  vtt:    { label: "VTT",    icon: "bicycle-outline" },
  route:  { label: "Route",  icon: "speedometer-outline" },
  gravel: { label: "Gravel", icon: "earth-outline" },
  ville:  { label: "Ville",  icon: "leaf-outline" },
  all:    { label: "Tous",   icon: "apps-outline" },
};

// ---------------------------------------------------------------------------
// Mock data : pseudos varies, pas de vrais noms, pas de villes exactes
// ---------------------------------------------------------------------------

function mockBuddy(p: {
  id: string;
  displayName: string;
  sex: Sex;
  ageBracket: AgeBracket;
  zone: string;
  distanceKm: number;
  bikes: BikeKind[];
  level: Level;
  pace: Pace;
  vibes: Vibe[];
  languages: string[];
  bio: string;
  ridesCount: number;
  badges: number;
  matchScore: number;
  isFriend: boolean;
}): Buddy {
  return {
    ...p,
    avatarInitial: avatarInitialFor(p.displayName),
    avatarColor: avatarColorFor(p.id),
    distanceRange: distanceRangeFor(p.distanceKm),
  };
}

export const BUDDIES: Buddy[] = [
  mockBuddy({ id: "b-1", displayName: "Aurore",     sex: "F", ageBracket: "25_34", zone: "Massif des Bauges",   distanceKm: 4,  bikes: ["vttae","vtt"],     level: "confirme",       pace: "regulier",    vibes: ["decouverte","social"], languages: ["FR","EN"],       bio: "Massif des Bauges au lever du jour, j adore.",                                  ridesCount: 62,  badges: 11, matchScore: 96, isFriend: true }),
  mockBuddy({ id: "b-2", displayName: "RoutardLac", sex: "H", ageBracket: "25_34", zone: "Lac d Annecy",        distanceKm: 22, bikes: ["route","gravel"],  level: "expert",         pace: "soutenu",     vibes: ["perf"],                languages: ["FR"],            bio: "Tour du lac le matin avant le boulot.",                                            ridesCount: 118, badges: 9,  matchScore: 78, isFriend: false }),
  mockBuddy({ id: "b-3", displayName: "Cam",         sex: "F", ageBracket: "25_34", zone: "Massif des Bauges",   distanceKm: 2,  bikes: ["vttae"],            level: "intermediaire", pace: "regulier",    vibes: ["famille","social"],   languages: ["FR","IT"],       bio: "Sorties chill, j aime decouvrir de nouveaux sentiers.",                          ridesCount: 58,  badges: 7,  matchScore: 92, isFriend: true }),
  mockBuddy({ id: "b-4", displayName: "GuideMB",     sex: "H", ageBracket: "25_34", zone: "Mont-Blanc",          distanceKm: 78, bikes: ["vtt","vttae"],      level: "expert",         pace: "competitif",  vibes: ["perf","decouverte"], languages: ["FR","EN","DE"],  bio: "Guide single technique en haute montagne.",                                       ridesCount: 184, badges: 11, matchScore: 71, isFriend: false }),
  mockBuddy({ id: "b-5", displayName: "MarmotteFan",sex: "F", ageBracket: "35_44", zone: "Massif de la Chartreuse", distanceKm: 12, bikes: ["route"],         level: "confirme",       pace: "soutenu",     vibes: ["perf","social"],       languages: ["FR"],            bio: "Cycliste route, prepare la Marmotte 2026. Cherche binome regulier.",            ridesCount: 142, badges: 6,  matchScore: 84, isFriend: true }),
  mockBuddy({ id: "b-6", displayName: "EnduroKid",  sex: "H", ageBracket: "u25",   zone: "Massif de la Chartreuse", distanceKm: 11, bikes: ["vtt"],          level: "expert",         pace: "competitif",  vibes: ["perf"],                languages: ["FR","EN"],       bio: "Enduro et bikepark, j enchaine les laps.",                                         ridesCount: 89,  badges: 7,  matchScore: 65, isFriend: false }),
  mockBuddy({ id: "b-7", displayName: "VeloVerte",  sex: "F", ageBracket: "25_34", zone: "Lac du Bourget",      distanceKm: 1,  bikes: ["vttae","ville"],    level: "decouverte",      pace: "tranquille",  vibes: ["famille","decouverte"], languages: ["FR"],          bio: "Reprise du velo en douceur. Sortie cool autour du lac.",                         ridesCount: 18,  badges: 5,  matchScore: 88, isFriend: true }),
  mockBuddy({ id: "b-8", displayName: "GravelDrome",sex: "H", ageBracket: "25_34", zone: "Vercors",              distanceKm: 96, bikes: ["gravel"],            level: "confirme",       pace: "regulier",    vibes: ["decouverte","social"], languages: ["FR"],          bio: "Gravel sur les routes blanches, ouvert pour decouvrir.",                        ridesCount: 76,  badges: 10, matchScore: 62, isFriend: false }),
  mockBuddy({ id: "b-9", displayName: "Nada",        sex: "F", ageBracket: "35_44", zone: "Massif des Bauges",   distanceKm: 3,  bikes: ["vttae","route"],    level: "intermediaire",  pace: "regulier",    vibes: ["social","famille"],   languages: ["FR","AR"],       bio: "Sorties tranquilles, j aime echanger autour d un cafe en fin de balade.",       ridesCount: 44,  badges: 9,  matchScore: 90, isFriend: true }),
];

function orgFromBuddy(b: Buddy): { id: string; displayName: string; avatarInitial: string; avatarColor: string } {
  return { id: b.id, displayName: b.displayName, avatarInitial: b.avatarInitial, avatarColor: b.avatarColor };
}

const FIND = (id: string) => BUDDIES.find((b) => b.id === id)!;

export const GROUP_RIDES: GroupRide[] = [
  {
    id: "g-1",
    title: "Boucle des Bauges au lever du jour",
    cover: "https://images.unsplash.com/photo-1591028889197-3488e003481a?w=900&q=85",
    zone: "Massif des Bauges",
    dateLabel: "Samedi 21 juin",
    startTime: "06h30",
    distanceKm: 38,
    elevationGain: 1240,
    difficulty: "confirme",
    pace: "regulier",
    vibe: "decouverte",
    bikeKinds: ["vttae","vtt"],
    organizer: orgFromBuddy(FIND("b-1")),
    participants: [orgFromBuddy(FIND("b-3")), orgFromBuddy(FIND("b-9"))],
    maxParticipants: 8,
    description: "Depart parking du Revard, single track avec la lumiere matinale. Pause cafe au sommet.",
    meetingPoint: "Parking public du Revard, 06h15. Coordonnees GPS partagees aux participants.",
    open: true,
  },
  {
    id: "g-2",
    title: "Tour du lac, allure marathon",
    cover: "https://images.unsplash.com/photo-1561377718-ebad6e79bc4a?w=900&q=85",
    zone: "Lac du Bourget",
    dateLabel: "Dimanche 22 juin",
    startTime: "08h00",
    distanceKm: 44,
    elevationGain: 380,
    difficulty: "intermediaire",
    pace: "soutenu",
    vibe: "perf",
    bikeKinds: ["route"],
    organizer: orgFromBuddy(FIND("b-5")),
    participants: [orgFromBuddy(FIND("b-2"))],
    maxParticipants: 6,
    description: "Tour du lac avec relais, on tient les 32 km/h de moyenne. Bon entrainement.",
    meetingPoint: "Lieu public d Aix-les-Bains, 07h45. Coordonnees GPS partagees aux participants.",
    open: true,
  },
  {
    id: "g-3",
    title: "Voie verte famille Annecy",
    cover: "https://images.unsplash.com/photo-1594056466093-52bcbc7f5e4b?w=900&q=85",
    zone: "Lac d Annecy",
    dateLabel: "Samedi 21 juin",
    startTime: "10h00",
    distanceKm: 24,
    elevationGain: 60,
    difficulty: "decouverte",
    pace: "tranquille",
    vibe: "famille",
    bikeKinds: ["vttae","ville","vtt"],
    organizer: orgFromBuddy(FIND("b-7")),
    participants: [],
    maxParticipants: 12,
    description: "Sortie pour les familles avec enfants des 6 ans. Pique-nique a mi-chemin.",
    meetingPoint: "Office de tourisme d Annecy, 09h45.",
    open: true,
  },
  {
    id: "g-4",
    title: "Single tech au Semnoz",
    cover: "https://images.unsplash.com/photo-1591619759638-36921634f97e?w=900&q=85",
    zone: "Semnoz",
    dateLabel: "Dimanche 22 juin",
    startTime: "13h00",
    distanceKm: 18,
    elevationGain: 720,
    difficulty: "expert",
    pace: "soutenu",
    vibe: "perf",
    bikeKinds: ["vtt"],
    organizer: orgFromBuddy(FIND("b-6")),
    participants: [orgFromBuddy(FIND("b-4"))],
    maxParticipants: 5,
    description: "Sentiers techniques. Protections recommandees.",
    meetingPoint: "Telesiege du Semnoz, 12h45.",
    open: true,
  },
];

export const BUDDY_REQUESTS: BuddyRequest[] = [
  {
    id: "req-1",
    buddy: FIND("b-2"),
    direction: "received",
    message: "Salut, je tente le tour du lac samedi 8h, ca te dirait de te joindre ? Allure soutenue mais rien de fou.",
    sentAt: "Il y a 2 h",
    status: "pending",
  },
  {
    id: "req-2",
    buddy: FIND("b-8"),
    direction: "sent",
    message: "Hello, je viens dans la Drome le 28 juin pour 3 jours. Une sortie gravel ?",
    sentAt: "Hier",
    status: "pending",
  },
];

// ---------------------------------------------------------------------------
// Filtres
// ---------------------------------------------------------------------------

export type BuddyFilters = {
  bikeKind: BikeKind | "all";
  level: Level | "all";
  vibe: Vibe | "all";
  maxDistanceKm: number;
};

export function filterBuddies(filters: BuddyFilters): Buddy[] {
  return BUDDIES
    .filter((b) => filters.bikeKind === "all" || b.bikes.includes(filters.bikeKind))
    .filter((b) => filters.level === "all" || b.level === filters.level)
    .filter((b) => filters.vibe === "all" || b.vibes.includes(filters.vibe))
    .filter((b) => b.distanceKm <= filters.maxDistanceKm)
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function useBuddies(filters: BuddyFilters) {
  const [list, setList] = useState<Buddy[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    if (!isSupabaseEnabled) {
      setList(filterBuddies(filters));
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.rpc("find_nearby_buddies", { p_filters: filters as any });
        if (error || !data) setList(filterBuddies(filters));
        else setList(data as Buddy[]);
      } catch {
        setList(filterBuddies(filters));
      } finally {
        setLoading(false);
      }
    })();
  }, [filters.bikeKind, filters.level, filters.vibe, filters.maxDistanceKm]);
  return { list, loading };
}

/**
 * Recherche de copains de route.
 *
 * 3 sections principales :
 *   1. Rideurs compatibles (filtre par niveau, vélo, allure, langues, dispo)
 *   2. Sorties groupe planifiées (rejoindre une sortie organisee par qqun)
 *   3. Invitations recues / envoyees
 *
 * En prod : table `buddy_profiles`, `group_rides`, `group_ride_members`,
 * `buddy_requests` dans Supabase, avec RPC `find_nearby_buddies(lat, lng, filters)`.
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
  name: string;
  avatar: string;
  age: number;
  sex: Sex;
  ageBracket: AgeBracket;
  city: string;
  bikes: BikeKind[];
  level: Level;
  pace: Pace;
  vibes: Vibe[];
  languages: string[];
  bio: string;
  availability: string[]; // ex: ["sam matin", "dim apres-midi"]
  ridesCount: number;
  badges: number;
  distanceKm: number;        // distance par rapport a moi
  matchScore: number;        // 0-100
  isFriend: boolean;
  alreadyInvited?: boolean;
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
  organizer: { id: string; name: string; avatar: string };
  participants: { id: string; name: string; avatar: string }[];
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
// Métadonnées UI partagées
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
// Mock data
// ---------------------------------------------------------------------------

export const BUDDIES: Buddy[] = [
  { id: "b-1", name: "Léa Martin",        avatar: "LM", age: 29, sex: "F", ageBracket: "25_34", city: "Aix-les-Bains",   bikes: ["vttae","vtt"],     level: "confirme",       pace: "regulier",   vibes: ["decouverte","social"], languages: ["FR","EN"], bio: "Massif des Bauges au lever du jour, j adore.", availability: ["sam matin","dim matin"],         ridesCount: 62, badges: 11, distanceKm: 4,  matchScore: 96, isFriend: true },
  { id: "b-2", name: "Alexis Petit",      avatar: "AP", age: 27, sex: "H", ageBracket: "25_34", city: "Annecy",          bikes: ["route","gravel"],  level: "expert",         pace: "soutenu",    vibes: ["perf"],                languages: ["FR"],      bio: "Tour du lac le matin avant le boulot. On part a fond.", availability: ["lun-ven 6h-8h"], ridesCount: 118, badges: 9, distanceKm: 22, matchScore: 78, isFriend: false },
  { id: "b-3", name: "Camille Rivière",   avatar: "CR", age: 32, sex: "F", ageBracket: "25_34", city: "Aix-les-Bains",   bikes: ["vttae"],            level: "intermediaire",   pace: "regulier",   vibes: ["famille","social"],   languages: ["FR","IT"], bio: "Sorties chill en couple ou avec les enfants. 2 ados.", availability: ["sam apres-midi","dim"],       ridesCount: 58, badges: 7, distanceKm: 2,  matchScore: 92, isFriend: true },
  { id: "b-4", name: "Hugo Fontaine",      avatar: "HF", age: 28, sex: "H", ageBracket: "25_34", city: "Chamonix",         bikes: ["vtt","vttae"],       level: "expert",         pace: "competitif", vibes: ["perf","decouverte"],  languages: ["FR","EN","DE"], bio: "Massif du Mont-Blanc, je guide aussi du single technique.", availability: ["weekend complet"], ridesCount: 184, badges: 11, distanceKm: 78, matchScore: 71, isFriend: false },
  { id: "b-5", name: "Sophie Faure",       avatar: "SF", age: 41, sex: "F", ageBracket: "35_44", city: "Chambéry",          bikes: ["route"],             level: "confirme",       pace: "soutenu",    vibes: ["perf","social"],       languages: ["FR"],      bio: "Cycliste route, prepare la Marmotte 2026. Cherche binome.", availability: ["mer soir","dim matin"], ridesCount: 142, badges: 6, distanceKm: 12, matchScore: 84, isFriend: true },
  { id: "b-6", name: "Mathieu Garnier",    avatar: "MG", age: 22, sex: "H", ageBracket: "u25",   city: "Chambéry",          bikes: ["vtt"],                level: "expert",         pace: "competitif", vibes: ["perf"],                languages: ["FR","EN"], bio: "Enduro et bikepark, j'enchaine les laps a Aillon.",       availability: ["sam","dim"],                ridesCount: 89, badges: 7, distanceKm: 11, matchScore: 65, isFriend: false },
  { id: "b-7", name: "Aurélie Roux",       avatar: "AR", age: 30, sex: "F", ageBracket: "25_34", city: "Aix-les-Bains",     bikes: ["vttae","ville"],     level: "decouverte",      pace: "tranquille", vibes: ["famille","decouverte"], languages: ["FR"],      bio: "Reprise du velo apres bebe. Sortie cool autour du lac.",  availability: ["mer matin","sam matin"],    ridesCount: 18, badges: 5, distanceKm: 1,  matchScore: 88, isFriend: true },
  { id: "b-8", name: "Damien Marchal",     avatar: "DM", age: 31, sex: "H", ageBracket: "25_34", city: "Romans",            bikes: ["gravel"],             level: "confirme",       pace: "regulier",   vibes: ["decouverte","social"], languages: ["FR"],      bio: "Gravel sur la Drome, ouvert pour decouvrir de nouvelles routes.", availability: ["sam"],                  ridesCount: 76, badges: 10, distanceKm: 96, matchScore: 62, isFriend: false },
  { id: "b-9", name: "Nadia Chevalier",    avatar: "NC", age: 39, sex: "F", ageBracket: "35_44", city: "Aix-les-Bains",     bikes: ["vttae","route"],      level: "intermediaire",   pace: "regulier",   vibes: ["social","famille"],   languages: ["FR","AR"], bio: "Sorties tranquilles, j'adore raconter mes balades autour d un cafe.", availability: ["jeu matin","sam apres-midi"], ridesCount: 44, badges: 9, distanceKm: 3,  matchScore: 90, isFriend: true },
];

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
    organizer: { id: "b-1", name: "Léa Martin", avatar: "LM" },
    participants: [
      { id: "b-3", name: "Camille R.", avatar: "CR" },
      { id: "b-9", name: "Nadia C.",   avatar: "NC" },
    ],
    maxParticipants: 8,
    description: "On part du parking du Revard au lever du jour, on enchaine les single track avec la lumiere magique. Cafe et viennoiseries au sommet.",
    meetingPoint: "Parking du Revard, 06h15",
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
    organizer: { id: "b-5", name: "Sophie Faure", avatar: "SF" },
    participants: [
      { id: "b-2", name: "Alexis P.", avatar: "AP" },
    ],
    maxParticipants: 6,
    description: "Tour du lac avec relais, on tient les 32 km/h de moyenne. Idee preparer la Marmotte. Ravito a Brison-Saint-Innocent.",
    meetingPoint: "Esplanade du Petit Port, 07h45",
    open: true,
  },
  {
    id: "g-3",
    title: "Voie verte famille Annecy",
    cover: "https://images.unsplash.com/photo-1594056466093-52bcbc7f5e4b?w=900&q=85",
    zone: "Voie verte d Annecy",
    dateLabel: "Samedi 21 juin",
    startTime: "10h00",
    distanceKm: 24,
    elevationGain: 60,
    difficulty: "decouverte",
    pace: "tranquille",
    vibe: "famille",
    bikeKinds: ["vttae","ville","vtt"],
    organizer: { id: "b-7", name: "Aurélie Roux", avatar: "AR" },
    participants: [],
    maxParticipants: 12,
    description: "Sortie pour les familles avec enfants des 6 ans. On s'arrete pique-niquer a Sevrier, glace en fin de balade.",
    meetingPoint: "Office de tourisme d Annecy, 09h45",
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
    organizer: { id: "b-6", name: "Mathieu Garnier", avatar: "MG" },
    participants: [{ id: "b-4", name: "Hugo F.", avatar: "HF" }],
    maxParticipants: 5,
    description: "On envoie sur les sentiers techniques du Semnoz. Protections recommandees, pas de debutants.",
    meetingPoint: "Telesiege du Semnoz, 12h45",
    open: true,
  },
];

export const BUDDY_REQUESTS: BuddyRequest[] = [
  {
    id: "req-1",
    buddy: BUDDIES.find((b) => b.id === "b-2")!,
    direction: "received",
    message: "Salut Marie, je tente le tour du lac samedi 8h, ca te dirait de te joindre ? Allure soutenue mais rien de fou.",
    sentAt: "Il y a 2 h",
    status: "pending",
  },
  {
    id: "req-2",
    buddy: BUDDIES.find((b) => b.id === "b-8")!,
    direction: "sent",
    message: "Hello, je viens dans la Drome le 28 juin pour 3 jours. Une sortie gravel ?",
    sentAt: "Hier",
    status: "pending",
  },
];

// ---------------------------------------------------------------------------
// Filters
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

// ---------------------------------------------------------------------------
// API : tout est mock pour la demo, Supabase quand le schema sera pose
// ---------------------------------------------------------------------------

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

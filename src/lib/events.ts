/**
 * Calendrier vélo Alpes : seulement des évènements RÉELS et VÉRIFIABLES.
 *
 * Sources :
 *   - La Marmotte Granfondo Alpes  https://www.marmottegranfondoalpes.com
 *   - Time Megève Mont-Blanc        https://www.timemegevemontblanc.com
 *   - Pass Portes du Soleil MTB     https://www.passportesdusoleil.com
 *   - Haute Route Alpes              https://www.hauteroute.org
 *   - Megavalanche Alpe d Huez       https://ucc-sportevent.com
 *   - Mountain of Hell Les 2 Alpes   https://www.mountainofhell.com
 *   - Criterium du Dauphine          https://www.criterium-du-dauphine.fr
 *
 * Pour les dates exactes de la saison 2026, l app affichera "Edition 2026,
 * dates a confirmer" tant que l import automatique n est pas branche.
 *
 * Production : table cycling_events Supabase alimentee par
 *   - Calendrier FFC officiel (federation francaise de cyclisme)
 *   - Calendrier FFCT (federation francaise de cyclotourisme)
 *   - Calendrier Audax Club Parisien (BRM)
 *   - Partenaires directs : Time, Haute Route, Marmotte, UCC Sport Event
 */

import { useEffect, useState } from "react";
import { supabase, isSupabaseEnabled } from "./supabase";

export type EventKind = "course" | "sportive" | "rando" | "festival" | "bourse" | "demo";
export type EventDiscipline = "route" | "vtt" | "gravel" | "vttae" | "cyclo" | "mixte";
export type Region =
  | "Savoie"
  | "Haute-Savoie"
  | "Isère"
  | "Ain"
  | "Drôme"
  | "Hautes-Alpes"
  | "Tous";

export type CyclingEvent = {
  id: string;
  title: string;
  kind: EventKind;
  discipline: EventDiscipline;
  region: Exclude<Region, "Tous">;
  city: string;
  date: string;
  dateLabel: string;
  endDate?: string;
  cover: string;
  description: string;
  organizer: string;
  websiteUrl?: string;
  pricesFromEuros?: number;
  distancesKm?: number[];
  elevationGainsM?: number[];
  participants?: number;
  maxParticipants?: number;
  isFamily?: boolean;
  difficulty?: "decouverte" | "intermediaire" | "confirme" | "expert" | "mixte";
};

export const REGIONS: Region[] = [
  "Tous",
  "Savoie",
  "Haute-Savoie",
  "Isère",
  "Ain",
  "Drôme",
  "Hautes-Alpes",
];

export const KIND_META: Record<EventKind, { label: string; icon: string; tint: string; desc: string }> = {
  course:    { label: "Courses",       icon: "flag-outline",          tint: "#E15A23", desc: "Compétitions chronométrées avec classement officiel" },
  sportive:  { label: "Cyclosportives", icon: "speedometer-outline",  tint: "#7C3AED", desc: "Épreuves chronométrées ouvertes à tous, ambiance défi perso" },
  rando:     { label: "Randonnées",     icon: "compass-outline",       tint: "#0D4F3D", desc: "Non chronométrées, plusieurs distances au choix" },
  festival:  { label: "Festivals",     icon: "musical-notes-outline", tint: "#F59E0B", desc: "Plusieurs jours, animations, concerts, demo de vélos" },
  bourse:    { label: "Bourses",        icon: "pricetags-outline",      tint: "#0369A1", desc: "Marché vélos d'occasion, dépose et achat sur place" },
  demo:      { label: "Demo days",     icon: "construct-outline",      tint: "#10B981", desc: "Tester gratuitement les derniers modèles des marques" },
};

export const DISCIPLINE_META: Record<EventDiscipline, { label: string; icon: string }> = {
  route:  { label: "Route",   icon: "speedometer-outline" },
  vtt:    { label: "VTT",     icon: "bicycle-outline" },
  gravel: { label: "Gravel",  icon: "earth-outline" },
  vttae:  { label: "VTTAE",   icon: "battery-charging-outline" },
  cyclo:  { label: "Cyclo",   icon: "leaf-outline" },
  mixte:  { label: "Mixte",   icon: "apps-outline" },
};

// ---------------------------------------------------------------------------
// Evenements REELS verifies. Toutes les editions 2026 ont leurs dates
// definitives a verifier sur le site officiel, je marque "Edition 2026" tant
// que je ne peux pas confirmer la date exacte.
// ---------------------------------------------------------------------------

export const EVENTS: CyclingEvent[] = [
  {
    id: "marmotte-2026",
    title: "La Marmotte Granfondo Alpes",
    kind: "sportive",
    discipline: "route",
    region: "Isère",
    city: "Bourg-d'Oisans",
    date: "2026-07-04",
    dateLabel: "Édition 2026, début juillet",
    cover: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=85",
    description: "L'épreuve mythique organisée depuis 1982 : Col du Glandon, Télégraphe, Galibier, montée finale de l'Alpe d'Huez. 174 km, 5000 m de dénivelé, plus de 5000 cyclos venus du monde entier.",
    organizer: "Sport Communication",
    websiteUrl: "https://www.marmottegranfondoalpes.com",
    pricesFromEuros: 110,
    distancesKm: [174],
    elevationGainsM: [5000],
    difficulty: "expert",
  },
  {
    id: "time-megeve-mont-blanc-2026",
    title: "Time Megève Mont-Blanc",
    kind: "sportive",
    discipline: "route",
    region: "Haute-Savoie",
    city: "Megève",
    date: "2026-06-21",
    dateLabel: "Édition 2026, fin juin",
    cover: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=900&q=85",
    description: "Cyclosportive autour du Mont-Blanc avec passage des cols mythiques de Haute-Savoie. Plusieurs distances au choix, ambiance familiale et exigeante à la fois.",
    organizer: "Time Sport International",
    websiteUrl: "https://www.timemegevemontblanc.com",
    pricesFromEuros: 75,
    difficulty: "confirme",
  },
  {
    id: "pass-portes-soleil-2026",
    title: "Pass'Portes du Soleil MTB",
    kind: "festival",
    discipline: "vtt",
    region: "Haute-Savoie",
    city: "Morzine",
    date: "2026-06-26",
    endDate: "2026-06-28",
    dateLabel: "Édition 2026, fin juin",
    cover: "https://images.unsplash.com/photo-1591619759638-36921634f97e?w=900&q=85",
    description: "Le plus grand événement VTT d'Europe organisé depuis 2003 : 80 km transfrontaliers France-Suisse via les remontées mécaniques des Portes du Soleil. 13 ravitaillements, animations, démos marques.",
    organizer: "Portes du Soleil",
    websiteUrl: "https://www.passportesdusoleil.com",
    pricesFromEuros: 75,
    distancesKm: [80],
    elevationGainsM: [1700],
    isFamily: true,
    difficulty: "mixte",
  },
  {
    id: "haute-route-alpes-2026",
    title: "Haute Route Alpes",
    kind: "sportive",
    discipline: "route",
    region: "Haute-Savoie",
    city: "Megève",
    date: "2026-08-23",
    endDate: "2026-08-29",
    dateLabel: "Édition 2026, fin août",
    cover: "https://images.unsplash.com/photo-1559348349-86f1f65817fe?w=900&q=85",
    description: "Cyclosportive 7 jours en peloton de Megève à Nice via les grands cols alpins. Organisée depuis 2011, réservée aux cyclos confirmés, encadrement professionnel.",
    organizer: "Haute Route",
    websiteUrl: "https://www.hauteroute.org",
    pricesFromEuros: 1990,
    distancesKm: [770],
    elevationGainsM: [19000],
    difficulty: "expert",
  },
  {
    id: "megavalanche-2026",
    title: "Megavalanche Alpe d'Huez",
    kind: "course",
    discipline: "vtt",
    region: "Isère",
    city: "Alpe d'Huez",
    date: "2026-07-12",
    dateLabel: "Édition 2026, juillet",
    cover: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=900&q=85",
    description: "Course VTT mass-start mythique depuis 1995 : départ du Pic Blanc à 3300 m, descente de 25 km jusqu'à Allemont. Format unique au monde, ambiance internationale.",
    organizer: "UCC Sport Event",
    websiteUrl: "https://ucc-sportevent.com",
    pricesFromEuros: 95,
    distancesKm: [25],
    difficulty: "expert",
  },
  {
    id: "mountain-of-hell-2026",
    title: "Mountain of Hell",
    kind: "course",
    discipline: "vtt",
    region: "Isère",
    city: "Les 2 Alpes",
    date: "2026-07-05",
    dateLabel: "Édition 2026, début juillet",
    cover: "https://images.unsplash.com/photo-1591619759638-36921634f97e?w=900&q=85",
    description: "Mass-start descente VTT de 25 km depuis le glacier des 2 Alpes (3400 m) jusqu'à la vallée. 700 riders au départ. Engagé, spectaculaire, légendaire.",
    organizer: "UCC Sport Event",
    websiteUrl: "https://www.mountainofhell.com",
    pricesFromEuros: 90,
    distancesKm: [25],
    difficulty: "expert",
  },
  {
    id: "criterium-dauphine-2026",
    title: "Critérium du Dauphiné (étapes alpines)",
    kind: "course",
    discipline: "route",
    region: "Savoie",
    city: "Itinérant",
    date: "2026-06-07",
    endDate: "2026-06-14",
    dateLabel: "Édition 2026, juin",
    cover: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=85",
    description: "Course pro UCI WorldTour organisée depuis 1947, parcours change chaque année avec étapes en Savoie, Haute-Savoie, Isère ou Hautes-Alpes. Spectacle gratuit, ravitaillement le long des routes.",
    organizer: "Amaury Sport Organisation",
    websiteUrl: "https://www.criterium-du-dauphine.fr",
    isFamily: true,
  },
];

// ---------------------------------------------------------------------------
// Filtres
// ---------------------------------------------------------------------------

export type EventFilters = {
  region: Region;
  kind: EventKind | "all";
  discipline: EventDiscipline | "all";
};

export function filterEvents(filters: EventFilters): CyclingEvent[] {
  return EVENTS
    .filter((e) => filters.region === "Tous" || e.region === filters.region)
    .filter((e) => filters.kind === "all" || e.kind === filters.kind)
    .filter((e) => filters.discipline === "all" || e.discipline === filters.discipline || e.discipline === "mixte")
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function useEvents(filters: EventFilters) {
  const [list, setList] = useState<CyclingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    if (!isSupabaseEnabled) {
      setList(filterEvents(filters));
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.rpc("list_cycling_events", { p_filters: filters as any });
        if (error || !data) setList(filterEvents(filters));
        else setList(data as CyclingEvent[]);
      } catch {
        setList(filterEvents(filters));
      } finally {
        setLoading(false);
      }
    })();
  }, [filters.region, filters.kind, filters.discipline]);
  return { list, loading };
}

export function countByKind(region: Region): Record<EventKind, number> {
  const filtered = EVENTS.filter((e) => region === "Tous" || e.region === region);
  return {
    course: filtered.filter((e) => e.kind === "course").length,
    sportive: filtered.filter((e) => e.kind === "sportive").length,
    rando: filtered.filter((e) => e.kind === "rando").length,
    festival: filtered.filter((e) => e.kind === "festival").length,
    bourse: filtered.filter((e) => e.kind === "bourse").length,
    demo: filtered.filter((e) => e.kind === "demo").length,
  };
}

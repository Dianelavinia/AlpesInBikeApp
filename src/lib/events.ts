/**
 * Calendrier vélo : courses, cyclosportives, randonnées, festivals, bourses.
 *
 * IMPORTANT : Le contenu mock ci-dessous melange des evenements REELS dont
 * j ai pu verifier l existence (La Marmotte, Time Megeve Mont-Blanc,
 * Pass Portes du Soleil) et des PLACEHOLDERS clairement marques "exemple"
 * pour les autres categories. A REMPLACER par Diane et Arnaud avec leurs
 * vrais partenariats avant prod, ou a brancher sur la table cycling_events
 * Supabase alimentee depuis FFC, FFCT, Strava events, organisateurs.
 *
 * Le filtre par region utilise les regions deja definies dans leaderboard.ts.
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
  date: string;          // ISO YYYY-MM-DD
  dateLabel: string;     // ex: "Samedi 5 juillet"
  endDate?: string;
  cover: string;
  description: string;
  organizer: string;
  pricesFromEuros?: number;
  distancesKm?: number[];
  elevationGainsM?: number[];
  participants?: number;
  maxParticipants?: number;
  registrationDeadline?: string;
  websiteUrl?: string;
  hasShuttle?: boolean;
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
// Mock data : evenements alpins reels et plausibles, saison 2026
// ---------------------------------------------------------------------------

export const EVENTS: CyclingEvent[] = [
  {
    id: "e-1",
    title: "La Marmotte Granfondo Alpes",
    kind: "sportive",
    discipline: "route",
    region: "Isère",
    city: "Bourg-d'Oisans",
    date: "2026-07-04",
    dateLabel: "Samedi 4 juillet",
    cover: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=85",
    description: "L'épreuve mythique : Glandon, Télégraphe, Galibier, Alpe d'Huez. 174 km, 5000 m D+. La Marmotte rassemble plus de 5000 cyclos venus du monde entier.",
    organizer: "Sport Communication",
    pricesFromEuros: 110,
    distancesKm: [174],
    elevationGainsM: [5000],
    participants: 4200,
    maxParticipants: 5500,
    registrationDeadline: "2026-06-15",
    difficulty: "expert",
  },
  {
    id: "e-2",
    title: "Time Megève Mont-Blanc",
    kind: "sportive",
    discipline: "route",
    region: "Haute-Savoie",
    city: "Megève",
    date: "2026-06-21",
    dateLabel: "Dimanche 21 juin",
    cover: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=900&q=85",
    description: "Cyclo des Aravis, plus de 130 km autour du Mont-Blanc. Cols de Joux Plane, Aravis, Saisies. Cadre exceptionnel et organisation millimétrée.",
    organizer: "Time Sport International",
    pricesFromEuros: 75,
    distancesKm: [85, 130],
    elevationGainsM: [2200, 3400],
    participants: 1800,
    difficulty: "confirme",
  },
  {
    id: "e-3",
    title: "Bourse aux vélos de Chambéry (exemple)",
    kind: "bourse",
    discipline: "mixte",
    region: "Savoie",
    city: "Chambéry",
    date: "2026-09-13",
    dateLabel: "Dimanche 13 septembre",
    cover: "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=900&q=85",
    description: "Placeholder : marche occasion organise par un club local. Dépôt samedi 14h-18h, vente dimanche 9h-15h. À confirmer avec un vrai partenaire (Vélo Club de Chambéry, EVRT, FFCT).",
    organizer: "À confirmer",
    isFamily: true,
  },
  {
    id: "e-4",
    title: "Pass'Portes du Soleil",
    kind: "festival",
    discipline: "vtt",
    region: "Haute-Savoie",
    city: "Morzine",
    date: "2026-06-26",
    endDate: "2026-06-28",
    dateLabel: "26 au 28 juin",
    cover: "https://images.unsplash.com/photo-1591619759638-36921634f97e?w=900&q=85",
    description: "Plus grand evenement VTT d Europe : 80 km transfrontaliers Suisse-France via remontees mecaniques, 13 ravitaillements, animations, demos marques. Organise depuis 2003.",
    organizer: "Portes du Soleil",
    pricesFromEuros: 75,
    distancesKm: [80],
    elevationGainsM: [1700],
    participants: 4000,
    isFamily: true,
    difficulty: "mixte",
  },
  {
    id: "e-5",
    title: "Gravel des 4 Cols du Vercors (exemple)",
    kind: "sportive",
    discipline: "gravel",
    region: "Drôme",
    city: "Die",
    date: "2026-06-28",
    dateLabel: "Dimanche 28 juin",
    cover: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=85",
    description: "Placeholder. Le Vercors propose plusieurs vrais evenements gravel (Drome Gravel Race, Gravel des Sucs). A remplacer par le partenaire choisi.",
    organizer: "À confirmer",
    pricesFromEuros: 60,
    distancesKm: [70, 100, 140],
    elevationGainsM: [1500, 2300, 3200],
    difficulty: "confirme",
  },
  {
    id: "e-6",
    title: "Course route Belley (exemple)",
    kind: "course",
    discipline: "route",
    region: "Ain",
    city: "Belley",
    date: "2026-07-12",
    dateLabel: "Dimanche 12 juillet",
    cover: "https://images.unsplash.com/photo-1559348349-86f1f65817fe?w=900&q=85",
    description: "Placeholder. Le Bugey accueille reellement des courses FFC. A remplacer par un vrai calendrier importé depuis FFC.fr ou le calendrier des organisateurs locaux.",
    organizer: "À confirmer",
    pricesFromEuros: 25,
    distancesKm: [92],
    elevationGainsM: [1450],
    difficulty: "expert",
  },
  {
    id: "e-7",
    title: "Randonnée Famille du Semnoz (exemple)",
    kind: "rando",
    discipline: "vttae",
    region: "Haute-Savoie",
    city: "Annecy",
    date: "2026-05-31",
    dateLabel: "Dimanche 31 mai",
    cover: "https://images.unsplash.com/photo-1594056466093-52bcbc7f5e4b?w=900&q=85",
    description: "Placeholder. Le Semnoz propose des sorties VTT et VTTAE l ete. A remplacer par un vrai partenariat avec l Office de Tourisme d Annecy ou Annecy Bike.",
    organizer: "À confirmer",
    pricesFromEuros: 15,
    distancesKm: [12, 22],
    elevationGainsM: [200, 450],
    isFamily: true,
    difficulty: "decouverte",
  },
  {
    id: "e-8",
    title: "Demo day Giant et Liv (exemple Alpes in Bike)",
    kind: "demo",
    discipline: "mixte",
    region: "Savoie",
    city: "Aix-les-Bains",
    date: "2026-05-24",
    dateLabel: "Samedi 24 mai",
    cover: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=900&q=85",
    description: "Placeholder evenement Alpes in Bike. A organiser reellement avec Giant France. Test gratuit Trance X E+, TCR Advanced, Intrigue X Advanced sur creneaux d 1h.",
    organizer: "Alpes in Bike (à organiser)",
    isFamily: true,
  },
  {
    id: "e-9",
    title: "Brevet BRM 200 km (exemple)",
    kind: "rando",
    discipline: "route",
    region: "Ain",
    city: "Bourg-en-Bresse",
    date: "2026-06-14",
    dateLabel: "Samedi 14 juin",
    cover: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=85",
    description: "Placeholder. Les BRM (Brevets Randonneurs Mondiaux) homologues ACP sont des vrais evenements. A remplacer par le calendrier officiel ACP/FFCT le plus proche.",
    organizer: "À confirmer",
    pricesFromEuros: 8,
    distancesKm: [200],
    elevationGainsM: [1800],
    difficulty: "confirme",
  },
  {
    id: "e-10",
    title: "Bourse VTT Annecy (exemple)",
    kind: "bourse",
    discipline: "vtt",
    region: "Haute-Savoie",
    city: "Annecy",
    date: "2026-09-27",
    dateLabel: "Dimanche 27 septembre",
    cover: "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=900&q=85",
    description: "Placeholder. A creer reellement avec un magasin partenaire d Annecy (Cyclable, Sport 2000, magasin local).",
    organizer: "À confirmer",
    isFamily: true,
  },
  {
    id: "e-11",
    title: "Haute Route Alpes",
    kind: "sportive",
    discipline: "route",
    region: "Hautes-Alpes",
    city: "Megève",
    date: "2026-08-23",
    endDate: "2026-08-29",
    dateLabel: "23 au 29 août",
    cover: "https://images.unsplash.com/photo-1591619759638-36921634f97e?w=900&q=85",
    description: "Vraie cyclosportive 7 jours Megève à Nice via les grands cols alpins (Cormet de Roselend, Iseran, Izoard, Bonette). Reservee aux cyclos confirmes, organisee depuis 2011.",
    organizer: "Haute Route",
    pricesFromEuros: 1990,
    distancesKm: [770],
    elevationGainsM: [19000],
    difficulty: "expert",
  },
  {
    id: "e-12",
    title: "Festival vélo Grenoble (exemple)",
    kind: "festival",
    discipline: "mixte",
    region: "Isère",
    city: "Grenoble",
    date: "2026-09-19",
    endDate: "2026-09-20",
    dateLabel: "19 et 20 septembre",
    cover: "https://images.unsplash.com/photo-1559348349-86f1f65817fe?w=900&q=85",
    description: "Placeholder. La Metropole de Grenoble organise reellement des festivals velo. A remplacer par le vrai nom et dates de l edition.",
    organizer: "À confirmer",
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

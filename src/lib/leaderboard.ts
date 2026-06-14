/**
 * Classements multi-dimensions.
 *
 * En production : appelle la RPC Supabase `get_leaderboard(scope, period, metric)`.
 * En dev sans Supabase configuré : fallback sur un pool mock 26 rideurs.
 *
 * SQL associé : supabase/sql/0001_leaderboard_carbon.sql
 */

import { useEffect, useState } from "react";
import { supabase, isSupabaseEnabled } from "./supabase";

export type Sex = "F" | "H" | "X";
export type AgeBracket = "u25" | "25_34" | "35_44" | "45_54" | "55p";
export type Region =
  | "Savoie"
  | "Haute-Savoie"
  | "Isère"
  | "Ain"
  | "Drôme"
  | "Hautes-Alpes";

export type Period = "week" | "month" | "year" | "all";
export type Metric = "km" | "elevation" | "co2" | "rides" | "points";

export type Scope =
  | "global"
  | "myAge"
  | "mySex"
  | "myRegion"
  | "friends"
  | "club";

export type RankedRider = {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  sex: Sex | null;
  ageBracket: AgeBracket | null;
  region: string | null;
  city: string | null;
  clubId: string | null;
  badges: number;
  value: number;
  isYou: boolean;
};

export type LeaderboardResult = {
  list: RankedRider[];
  total: number;
  meScopeRank: number | null;
  meScopeTotal: number;
  meValue: number;
  topValue: number;
};

// ---------------------------------------------------------------------------
// Métadonnées partagées UI
// ---------------------------------------------------------------------------

export const AGE_LABEL: Record<AgeBracket, string> = {
  u25: "Moins de 25 ans",
  "25_34": "25 à 34 ans",
  "35_44": "35 à 44 ans",
  "45_54": "45 à 54 ans",
  "55p": "55 ans et plus",
};

export const SEX_LABEL: Record<Sex, string> = {
  F: "Femmes",
  H: "Hommes",
  X: "Non précisé",
};

export const METRIC_META: Record<
  Metric,
  { label: string; unit: string; icon: string; tint: string }
> = {
  km: { label: "Kilomètres", unit: "km", icon: "speedometer-outline", tint: "#E15A23" },
  elevation: { label: "Dénivelé", unit: "m", icon: "trending-up-outline", tint: "#7C3AED" },
  co2: { label: "CO2 évité", unit: "kg", icon: "leaf-outline", tint: "#0D4F3D" },
  rides: { label: "Rides", unit: "rides", icon: "bicycle-outline", tint: "#0369A1" },
  points: { label: "Points Club", unit: "pts", icon: "ribbon-outline", tint: "#F59E0B" },
};

export const PERIOD_LABEL: Record<Period, string> = {
  week: "Semaine",
  month: "Mois",
  year: "Année",
  all: "Toujours",
};

export const SCOPE_META: Record<Scope, { label: string; icon: string }> = {
  global: { label: "Global", icon: "earth-outline" },
  myAge: { label: "Ma tranche d'âge", icon: "calendar-outline" },
  mySex: { label: "Mon genre", icon: "person-outline" },
  myRegion: { label: "Ma région", icon: "location-outline" },
  friends: { label: "Mes amis", icon: "people-outline" },
  club: { label: "Mon club", icon: "ribbon-outline" },
};

/** Profil démo pour les hints quand Supabase n'est pas encore branché. */
export const ME = {
  name: "Marie Roche",
  avatar: "MR",
  sex: "F" as Sex,
  ageBracket: "25_34" as AgeBracket,
  region: "Savoie" as Region,
  city: "Aix-les-Bains",
  club: "Aix Cycling",
};

// ---------------------------------------------------------------------------
// Appel Supabase
// ---------------------------------------------------------------------------

type RpcRow = {
  rank: number;
  user_id: string;
  display_name: string;
  avatar: string;
  city: string | null;
  region: string | null;
  sex: Sex | null;
  age_bracket: AgeBracket | null;
  club_id: string | null;
  badges: number;
  value: number;
  is_you: boolean;
};

async function fetchFromSupabase(
  scope: Scope,
  period: Period,
  metric: Metric
): Promise<LeaderboardResult> {
  const { data, error } = await supabase.rpc("get_leaderboard", {
    p_scope: scope,
    p_period: period,
    p_metric: metric,
    p_limit: 100,
  });
  if (error) throw error;

  const rows: RpcRow[] = (data ?? []) as RpcRow[];
  const list: RankedRider[] = rows.map((r) => ({
    id: r.user_id,
    rank: Number(r.rank),
    name: r.display_name,
    avatar: r.avatar,
    sex: r.sex,
    ageBracket: r.age_bracket,
    region: r.region,
    city: r.city,
    clubId: r.club_id,
    badges: r.badges,
    value: Number(r.value),
    isYou: r.is_you,
  }));
  const me = list.find((r) => r.isYou);
  return {
    list,
    total: list.length,
    meScopeRank: me?.rank ?? null,
    meScopeTotal: list.length,
    meValue: me?.value ?? 0,
    topValue: list[0]?.value ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Fallback mock (mode démo sans Supabase)
// ---------------------------------------------------------------------------

type MockRider = {
  id: string;
  name: string;
  avatar: string;
  sex: Sex;
  ageBracket: AgeBracket;
  region: Region;
  city: string;
  club?: string;
  isFriend: boolean;
  isYou?: boolean;
  badges: number;
  stats: Record<Period, Record<Metric, number>>;
};

function s(week: number[], month: number[], year: number[], all: number[]) {
  const m = (arr: number[]) => ({ km: arr[0], elevation: arr[1], co2: arr[2], rides: arr[3], points: arr[4] });
  return { week: m(week), month: m(month), year: m(year), all: m(all) };
}

const MOCK_RIDERS: MockRider[] = [
  { id: "r1", name: "Thomas Dubois", avatar: "TD", sex: "H", ageBracket: "35_44", region: "Savoie", city: "Chambéry", club: "Chambéry VTT", isFriend: false, badges: 18, stats: s([142, 2240, 28, 6, 720], [482, 8420, 96, 22, 2480], [4820, 78400, 940, 184, 24800], [9620, 142800, 1860, 376, 48200]) },
  { id: "r2", name: "Marc Lefèvre", avatar: "ML", sex: "H", ageBracket: "45_54", region: "Haute-Savoie", city: "Annecy", club: "Annecy Bike", isFriend: false, badges: 14, stats: s([98, 1620, 21, 4, 540], [367, 5210, 72, 16, 1820], [3640, 56200, 720, 142, 18200], [7280, 102000, 1420, 284, 36200]) },
  { id: "r3", name: "Léa Martin", avatar: "LM", sex: "F", ageBracket: "25_34", region: "Savoie", city: "Aix-les-Bains", club: "Aix Cycling", isFriend: true, badges: 11, stats: s([84, 1280, 17, 4, 460], [312, 4180, 62, 14, 1620], [2820, 38400, 580, 116, 14600], [4960, 64200, 990, 198, 24800]) },
  { id: "me", name: ME.name, avatar: ME.avatar, sex: ME.sex, ageBracket: ME.ageBracket, region: ME.region, city: ME.city, club: ME.club, isFriend: false, isYou: true, badges: 8, stats: s([68, 920, 13, 3, 380], [248, 3120, 50, 11, 1280], [1450, 18400, 312, 62, 7820], [3120, 38600, 620, 124, 14200]) },
  { id: "r5", name: "Camille Rivière", avatar: "CR", sex: "F", ageBracket: "25_34", region: "Savoie", city: "Aix-les-Bains", club: "Aix Cycling", isFriend: true, badges: 7, stats: s([62, 880, 12, 3, 340], [210, 2940, 42, 10, 1180], [1380, 17200, 276, 58, 7140], [2840, 32400, 568, 114, 13200]) },
  { id: "r6", name: "Sophie Faure", avatar: "SF", sex: "F", ageBracket: "35_44", region: "Savoie", city: "Chambéry", isFriend: true, badges: 6, stats: s([54, 720, 11, 2, 310], [184, 1820, 37, 8, 1020], [1180, 14200, 236, 47, 6480], [2240, 26800, 448, 90, 11800]) },
  { id: "r7", name: "Alexis Petit", avatar: "AP", sex: "H", ageBracket: "25_34", region: "Haute-Savoie", city: "Annecy", club: "Annecy Bike", isFriend: false, badges: 9, stats: s([110, 1480, 22, 5, 580], [342, 4620, 68, 15, 1780], [2940, 42800, 588, 118, 15200], [5180, 72400, 1036, 207, 26800]) },
  { id: "r8", name: "Julie Bernard", avatar: "JB", sex: "F", ageBracket: "45_54", region: "Isère", city: "Grenoble", isFriend: false, badges: 12, stats: s([78, 1180, 16, 4, 420], [256, 3680, 51, 12, 1380], [2140, 28200, 428, 86, 11400], [4280, 54200, 856, 172, 22800]) },
  { id: "r9", name: "Romain Leroy", avatar: "RL", sex: "H", ageBracket: "55p", region: "Savoie", city: "Chambéry", club: "Chambéry VTT", isFriend: false, badges: 16, stats: s([88, 1380, 18, 4, 480], [298, 4280, 60, 13, 1580], [2680, 38400, 536, 107, 14200], [5960, 78400, 1192, 238, 31600]) },
  { id: "r10", name: "Sarah Mercier", avatar: "SM", sex: "F", ageBracket: "35_44", region: "Haute-Savoie", city: "Annecy", club: "Annecy Bike", isFriend: false, badges: 10, stats: s([72, 980, 14, 3, 390], [228, 2960, 46, 11, 1240], [1820, 22400, 364, 73, 9620], [3640, 42600, 728, 146, 19200]) },
  { id: "r11", name: "Vincent Blanc", avatar: "VB", sex: "H", ageBracket: "35_44", region: "Ain", city: "Belley", isFriend: false, badges: 8, stats: s([66, 920, 13, 3, 360], [218, 2820, 44, 10, 1180], [1680, 21200, 336, 67, 8920], [3360, 40200, 672, 134, 17800]) },
  { id: "r12", name: "Aurélie Roux", avatar: "AR", sex: "F", ageBracket: "25_34", region: "Savoie", city: "Aix-les-Bains", club: "Aix Cycling", isFriend: true, badges: 5, stats: s([48, 620, 10, 2, 290], [168, 2240, 34, 8, 940], [1280, 14800, 256, 51, 6840], [2240, 24200, 448, 90, 11800]) },
  { id: "r13", name: "Mathieu Garnier", avatar: "MG", sex: "H", ageBracket: "u25", region: "Savoie", city: "Chambéry", isFriend: false, badges: 7, stats: s([124, 1820, 25, 5, 640], [392, 5680, 78, 18, 2080], [3280, 48400, 656, 131, 16800], [4920, 68200, 984, 197, 25200]) },
  { id: "r14", name: "Élodie Lambert", avatar: "EL", sex: "F", ageBracket: "u25", region: "Haute-Savoie", city: "Annecy", isFriend: false, badges: 6, stats: s([58, 740, 11, 2, 320], [192, 2480, 38, 9, 1080], [1480, 18400, 296, 59, 7820], [2360, 27200, 472, 94, 12400]) },
  { id: "r15", name: "Pierre Moreau", avatar: "PM", sex: "H", ageBracket: "45_54", region: "Drôme", city: "Valence", isFriend: false, badges: 13, stats: s([82, 1180, 16, 4, 440], [274, 3680, 55, 12, 1480], [2380, 31200, 476, 95, 12600], [5240, 68400, 1048, 210, 27800]) },
  { id: "r16", name: "Nadia Chevalier", avatar: "NC", sex: "F", ageBracket: "35_44", region: "Savoie", city: "Aix-les-Bains", club: "Aix Cycling", isFriend: true, badges: 9, stats: s([74, 1020, 15, 3, 400], [238, 3120, 47, 11, 1280], [1920, 24200, 384, 77, 10200], [3840, 46800, 768, 154, 20400]) },
  { id: "r17", name: "Stéphane Roy", avatar: "SR", sex: "H", ageBracket: "55p", region: "Isère", city: "Grenoble", isFriend: false, badges: 17, stats: s([68, 920, 13, 3, 380], [228, 2880, 46, 10, 1240], [2040, 26400, 408, 82, 10800], [5520, 72400, 1104, 221, 29200]) },
  { id: "r18", name: "Caroline Lefort", avatar: "CL", sex: "F", ageBracket: "45_54", region: "Ain", city: "Bourg-en-Bresse", isFriend: false, badges: 8, stats: s([56, 720, 11, 2, 310], [182, 2280, 36, 8, 1020], [1480, 18400, 296, 59, 7820], [2960, 35200, 592, 118, 15600]) },
  { id: "r19", name: "Hugo Fontaine", avatar: "HF", sex: "H", ageBracket: "25_34", region: "Haute-Savoie", city: "Chamonix", isFriend: false, badges: 11, stats: s([138, 2080, 28, 6, 700], [428, 6280, 86, 20, 2240], [3640, 54200, 728, 146, 18400], [5680, 78200, 1136, 227, 28800]) },
  { id: "r20", name: "Manon Berger", avatar: "MB", sex: "F", ageBracket: "u25", region: "Savoie", city: "Chambéry", isFriend: false, badges: 4, stats: s([42, 580, 8, 2, 240], [148, 1980, 30, 7, 820], [980, 12400, 196, 39, 5240], [1480, 17200, 296, 59, 7820]) },
  { id: "r21", name: "Benoît Riou", avatar: "BR", sex: "H", ageBracket: "35_44", region: "Hautes-Alpes", city: "Briançon", isFriend: false, badges: 14, stats: s([102, 1620, 21, 5, 540], [328, 4820, 66, 15, 1740], [2840, 42600, 568, 114, 14600], [5680, 78400, 1136, 227, 29200]) },
  { id: "r22", name: "Isabelle Faure", avatar: "IF", sex: "F", ageBracket: "55p", region: "Savoie", city: "Aix-les-Bains", club: "Aix Cycling", isFriend: true, badges: 11, stats: s([52, 680, 10, 2, 290], [172, 2180, 34, 8, 940], [1380, 17200, 276, 55, 7320], [3280, 39200, 656, 131, 17400]) },
  { id: "r23", name: "Lucas Henry", avatar: "LH", sex: "H", ageBracket: "u25", region: "Savoie", city: "Aix-les-Bains", club: "Aix Cycling", isFriend: true, badges: 5, stats: s([88, 1180, 18, 4, 460], [284, 3820, 57, 13, 1520], [1980, 26400, 396, 79, 10400], [2640, 32400, 528, 106, 13800]) },
  { id: "r24", name: "Patricia Noël", avatar: "PN", sex: "F", ageBracket: "45_54", region: "Isère", city: "Voiron", isFriend: false, badges: 9, stats: s([46, 620, 9, 2, 260], [158, 2080, 32, 7, 880], [1280, 16200, 256, 51, 6820], [2560, 30200, 512, 102, 13600]) },
  { id: "r25", name: "Damien Marchal", avatar: "DM", sex: "H", ageBracket: "25_34", region: "Drôme", city: "Romans", isFriend: false, badges: 10, stats: s([92, 1280, 18, 4, 480], [296, 3920, 59, 14, 1580], [2440, 32400, 488, 98, 12800], [4280, 54200, 856, 172, 22600]) },
  { id: "r26", name: "Charlotte Vidal", avatar: "CV", sex: "F", ageBracket: "25_34", region: "Savoie", city: "Aix-les-Bains", club: "Aix Cycling", isFriend: true, badges: 6, stats: s([58, 780, 11, 2, 320], [196, 2620, 39, 9, 1080], [1520, 18400, 304, 61, 8060], [2480, 28200, 496, 99, 13200]) },
];

function computeMock(scope: Scope, period: Period, metric: Metric): LeaderboardResult {
  const me = MOCK_RIDERS.find((r) => r.isYou)!;
  const filtered = MOCK_RIDERS.filter((r) => {
    switch (scope) {
      case "global":    return true;
      case "myAge":     return r.ageBracket === me.ageBracket;
      case "mySex":     return r.sex === me.sex;
      case "myRegion":  return r.region === me.region;
      case "friends":   return r.isFriend || r.isYou;
      case "club":      return r.club === me.club;
      default:          return true;
    }
  });
  const list: RankedRider[] = filtered
    .map((r) => ({
      id: r.id,
      rank: 0,
      name: r.name,
      avatar: r.avatar,
      sex: r.sex,
      ageBracket: r.ageBracket,
      region: r.region,
      city: r.city,
      clubId: r.club ?? null,
      badges: r.badges,
      value: r.stats[period][metric],
      isYou: !!r.isYou,
    }))
    .sort((a, b) => b.value - a.value)
    .map((r, i) => ({ ...r, rank: i + 1 }));
  const meEntry = list.find((r) => r.isYou);
  return {
    list,
    total: list.length,
    meScopeRank: meEntry?.rank ?? null,
    meScopeTotal: list.length,
    meValue: meEntry?.value ?? 0,
    topValue: list[0]?.value ?? 0,
  };
}

// ---------------------------------------------------------------------------
// API publique
// ---------------------------------------------------------------------------

export async function getLeaderboard(
  scope: Scope,
  period: Period,
  metric: Metric
): Promise<LeaderboardResult> {
  if (!isSupabaseEnabled) return computeMock(scope, period, metric);
  try {
    return await fetchFromSupabase(scope, period, metric);
  } catch (e) {
    console.warn("[leaderboard] supabase failed, falling back to mock", e);
    return computeMock(scope, period, metric);
  }
}

/** Hook React qui réagit aux changements de filtres. */
export function useLeaderboard(scope: Scope, period: Period, metric: Metric) {
  const [data, setData] = useState<LeaderboardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getLeaderboard(scope, period, metric)
      .then((r) => {
        if (cancelled) return;
        setData(r);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e as Error);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [scope, period, metric]);

  return { data, loading, error };
}

// ---------------------------------------------------------------------------
// Message motivant (UI-only, pas d'appel réseau)
// ---------------------------------------------------------------------------

export function getMotivation(
  meRank: number | null,
  total: number,
  metric: Metric,
  topValue: number,
  meValue: number
) {
  if (!meRank) {
    return {
      icon: "bicycle-outline",
      title: "Lancez votre premier ride",
      body: "Vous apparaîtrez dans le classement dès votre première sortie.",
    };
  }
  const meta = METRIC_META[metric];
  const gap = Math.max(0, topValue - meValue);
  const percentile = total > 0 ? Math.round(((total - meRank + 1) / total) * 100) : 0;

  if (meRank === 1) {
    return { icon: "trophy-outline", title: "Vous êtes en tête", body: `Tenez votre place, vous dominez sur ${meta.label.toLowerCase()}.` };
  }
  if (meRank <= 3) {
    return { icon: "medal-outline", title: `Podium, position ${meRank}`, body: `Plus que ${Math.round(gap)} ${meta.unit} pour passer numéro 1.` };
  }
  if (percentile >= 75) {
    return { icon: "flame-outline", title: `Top ${100 - percentile}% des rideurs`, body: `Vous êtes ${meRank}e sur ${total}, gardez le rythme.` };
  }
  if (percentile >= 50) {
    return { icon: "barbell-outline", title: "Au-dessus de la moyenne", body: `Position ${meRank} sur ${total}. Quelques rides et le top 25% est à vous.` };
  }
  return { icon: "leaf-outline", title: "À vous de jouer", body: `Position ${meRank} sur ${total}. Un ride régulier suffit pour grimper vite.` };
}

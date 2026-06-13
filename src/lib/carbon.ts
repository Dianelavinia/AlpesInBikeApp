/**
 * Bilan carbone personnel.
 * En production : appelle la RPC Supabase `get_my_carbon()`.
 * En dev sans Supabase : fallback sur données mock.
 *
 * SQL associé : supabase/sql/0001_leaderboard_carbon.sql
 */

import { useEffect, useState } from "react";
import { supabase, isSupabaseEnabled } from "./supabase";

export type CarbonStats = {
  co2Saved: number;
  kmRidden: number;
  carTripsAvoided: number;
  fuelLitersAvoided: number;
  annualGoal: number;
};

const MOCK_CARBON: CarbonStats = {
  co2Saved: 312,
  kmRidden: 1450,
  carTripsAvoided: 47,
  fuelLitersAvoided: 118,
  annualGoal: 500,
};

/** Compat ancienne API (composants qui n'utilisent pas encore le hook). */
export const USER_CARBON: CarbonStats = MOCK_CARBON;

type RpcRow = {
  co2_saved_kg: number;
  km_ridden: number;
  car_trips_avoided: number;
  fuel_liters_avoided: number;
  annual_goal_kg: number;
};

async function fetchFromSupabase(): Promise<CarbonStats> {
  const { data, error } = await supabase.rpc("get_my_carbon");
  if (error) throw error;
  const row: RpcRow | undefined = Array.isArray(data) ? data[0] : data;
  if (!row) return MOCK_CARBON;
  return {
    co2Saved: row.co2_saved_kg,
    kmRidden: row.km_ridden,
    carTripsAvoided: row.car_trips_avoided,
    fuelLitersAvoided: row.fuel_liters_avoided,
    annualGoal: row.annual_goal_kg,
  };
}

export async function getCarbonStats(): Promise<CarbonStats> {
  if (!isSupabaseEnabled) return MOCK_CARBON;
  try {
    return await fetchFromSupabase();
  } catch (e) {
    console.warn("[carbon] supabase failed, falling back to mock", e);
    return MOCK_CARBON;
  }
}

/** Hook React qui charge le bilan carbone de l'utilisateur. */
export function useCarbonStats() {
  const [stats, setStats] = useState<CarbonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getCarbonStats()
      .then((s) => {
        if (cancelled) return;
        setStats(s);
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
  }, []);

  return { stats: stats ?? MOCK_CARBON, loading, error };
}

export type FunEquivalent = {
  icon: string;
  emoji: string;
  big: string;
  unit: string;
  desc: string;
  tint: string;
};

/**
 * Équivalents parlants pour donner du sens aux kg CO2 économisés.
 * Conversions ADEME et bilan moyen voiture France.
 */
export function getFunEquivalents(co2Kg: number): FunEquivalent[] {
  return [
    { icon: "leaf",                 emoji: "🌳", big: Math.round(co2Kg / 22).toString(),  unit: "arbres",                     desc: "qu'il faudrait planter pour absorber autant de CO2 sur un an",     tint: "#0D4F3D" },
    { icon: "car-sport-outline",    emoji: "🚗", big: Math.round(co2Kg / 0.193).toString(), unit: "km en voiture",            desc: "que vous n'avez pas faits, soit l'équivalent d'un Chambéry-Marseille", tint: "#E15A23" },
    { icon: "airplane-outline",     emoji: "✈️", big: (co2Kg / 250).toFixed(1),            unit: "vols Paris-Nice",          desc: "C'est ce qu'un vol court-courrier émet, pour comparaison",         tint: "#0369A1" },
    { icon: "fast-food-outline",    emoji: "🍔", big: Math.round(co2Kg / 4).toString(),    unit: "burgers boeuf",            desc: "soit la même empreinte que de manger autant de burgers en moins",  tint: "#F59E0B" },
    { icon: "phone-portrait-outline", emoji: "📱", big: Math.round(co2Kg / 0.5).toString(), unit: "heures de streaming HD",   desc: "évitées (1h Netflix HD = environ 0,5 kg CO2)",                     tint: "#7C3AED" },
    { icon: "fitness-outline",      emoji: "🔋", big: Math.round(co2Kg * 1.4).toString(),  unit: "kWh d'électricité",        desc: "équivalent en consommation, soit 2 mois d'éclairage d'une maison", tint: "#FACC15" },
  ];
}

/** Projection fin d'année selon la tendance actuelle (12 mois). */
export function getProjections(stats: CarbonStats) {
  const monthsElapsed = new Date().getMonth() + 1;
  const monthsRemaining = Math.max(0, 12 - monthsElapsed);
  const monthlyRate = stats.co2Saved / Math.max(1, monthsElapsed);
  const yearEnd = Math.round(stats.co2Saved + monthlyRate * monthsRemaining);
  return {
    yearEnd,
    yearEndTrees: Math.round(yearEnd / 22),
    yearEndCarKm: Math.round(yearEnd / 0.193),
    onTrack: stats.co2Saved >= (stats.annualGoal / 12) * monthsElapsed,
    progressPercent: Math.min(100, Math.round((stats.co2Saved / stats.annualGoal) * 100)),
  };
}

/** Message motivant selon palier atteint. */
export function getMotivationalMessage(co2Kg: number): { headline: string; body: string; emoji: string } {
  if (co2Kg < 50) {
    return { emoji: "🌱", headline: "Vous êtes sur le bon chemin", body: "Chaque kilomètre compte. Continuez et vous serez surpris du résultat à la fin de la saison." };
  }
  if (co2Kg < 150) {
    return { emoji: "💪", headline: "Bravo, vous y êtes vraiment", body: "Vous êtes au-dessus de la moyenne des Français qui pédalent. Continuez et vous atteindrez 500 kg en fin d'année." };
  }
  if (co2Kg < 300) {
    return { emoji: "🔥", headline: "Vous changez les choses", body: "Vos économies de CO2 équivalent à plusieurs allers-retours en voiture évités. Pas mal du tout, vraiment." };
  }
  if (co2Kg < 500) {
    return { emoji: "🌍", headline: "Impact réel sur la planète", body: "À ce rythme, vous comptez parmi les 5% de cyclistes les plus engagés écologiquement de Savoie. Continuez." };
  }
  return { emoji: "🏆", headline: "Vous êtes une star verte", body: "Plus de 500 kg de CO2 évités. C'est l'équivalent d'un arbre adulte planté il y a 25 ans. Inspirez les autres." };
}

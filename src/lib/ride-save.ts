/**
 * Sauvegarde d un ride termine dans Supabase rides.
 * Avec fallback console.log si Supabase pas configure.
 */

import { supabase, isSupabaseEnabled } from "./supabase";
import type { LiveStats } from "./ride-tracker";

export type RideSaveResult = { ok: true; rideId: string } | { ok: false; error: string };

export async function saveRide(opts: {
  stats: LiveStats;
  title?: string;
  zone?: string;
  bikeModel?: string;
  difficulty?: "decouverte" | "facile" | "intermediaire" | "difficile" | "expert";
  isPublic?: boolean;
  notes?: string;
}): Promise<RideSaveResult> {
  if (!isSupabaseEnabled) {
    console.log("[ride-save] Supabase non configure, ride non persiste", {
      distance_m: opts.stats.distanceM,
      elevation_m: opts.stats.elevationGainM,
      points: opts.stats.points.length,
      duration_s: opts.stats.elapsedSec,
    });
    return { ok: true, rideId: `local-${Date.now()}` };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Non authentifie" };

    const startedAt = opts.stats.points[0]
      ? new Date(opts.stats.points[0].timestamp).toISOString()
      : new Date(Date.now() - opts.stats.elapsedSec * 1000).toISOString();
    const endedAt = opts.stats.points[opts.stats.points.length - 1]
      ? new Date(opts.stats.points[opts.stats.points.length - 1].timestamp).toISOString()
      : new Date().toISOString();

    // Convertit la polyline de points GPS en tableau compact [[lat,lng],...]
    const routeCoords = opts.stats.points.map((p) => [p.latitude, p.longitude]);

    const { data, error } = await supabase
      .from("rides")
      .insert({
        user_id: user.id,
        started_at: startedAt,
        ended_at: endedAt,
        distance_m: Math.round(opts.stats.distanceM),
        elevation_m: Math.round(opts.stats.elevationGainM),
        title: opts.title,
        zone: opts.zone,
        bike_model: opts.bikeModel,
        difficulty: opts.difficulty,
        is_public: !!opts.isPublic,
        notes: opts.notes,
        route_coords: routeCoords,
        avg_speed_mps: opts.stats.avgSpeedMps,
        max_speed_mps: opts.stats.maxSpeedMps,
        calories_kcal: Math.round(opts.stats.caloriesKcal),
      })
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };
    return { ok: true, rideId: data.id };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Erreur sauvegarde" };
  }
}

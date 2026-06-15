/**
 * Tracker GPS reel pour l enregistrement d un ride.
 *
 * Remplace le mock setInterval par expo-location en foreground et background
 * pour que l enregistrement continue meme ecran verrouille.
 *
 * Fonctions :
 *   - requestPermissions     : demande foreground + background
 *   - useRideTracker          : hook React qui expose start/pause/resume/stop
 *                              et les stats live (distance, denivele, allure)
 *   - calculateDistance       : Haversine entre 2 points GPS en metres
 *
 * En prod : a la fin du ride, save() pousse la polyline + stats dans la
 * table rides Supabase via supabase.from('rides').insert().
 */

import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

const BACKGROUND_LOCATION_TASK = "alpesinbike-background-location";

export type GpsPoint = {
  latitude: number;
  longitude: number;
  altitude: number | null;
  speed: number | null;     // m/s
  accuracy: number | null;  // metres
  timestamp: number;         // unix ms
};

export type RideStatus = "idle" | "recording" | "paused" | "finished";

export type LiveStats = {
  status: RideStatus;
  elapsedSec: number;
  distanceM: number;
  elevationGainM: number;
  elevationLossM: number;
  speedMps: number;
  avgSpeedMps: number;
  maxSpeedMps: number;
  caloriesKcal: number;
  points: GpsPoint[];
};

const INITIAL: LiveStats = {
  status: "idle",
  elapsedSec: 0,
  distanceM: 0,
  elevationGainM: 0,
  elevationLossM: 0,
  speedMps: 0,
  avgSpeedMps: 0,
  maxSpeedMps: 0,
  caloriesKcal: 0,
  points: [],
};

// ---------------------------------------------------------------------------
// Haversine : distance en metres entre 2 lat/lng
// ---------------------------------------------------------------------------

export function calculateDistance(a: GpsPoint, b: GpsPoint): number {
  const R = 6371000;
  const phi1 = (a.latitude * Math.PI) / 180;
  const phi2 = (b.latitude * Math.PI) / 180;
  const dPhi = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h = Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

export type PermissionsResult = { foreground: boolean; background: boolean; error?: string };

export async function requestPermissions(): Promise<PermissionsResult> {
  try {
    const { status: fg } = await Location.requestForegroundPermissionsAsync();
    if (fg !== "granted") return { foreground: false, background: false, error: "Permission GPS refusée" };
    if (Platform.OS === "web") {
      return { foreground: true, background: false };
    }
    const { status: bg } = await Location.requestBackgroundPermissionsAsync();
    return { foreground: true, background: bg === "granted" };
  } catch (e: any) {
    return { foreground: false, background: false, error: e?.message ?? "Erreur permissions" };
  }
}

// ---------------------------------------------------------------------------
// Background task : tourne meme ecran verrouille
// ---------------------------------------------------------------------------

if (!TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK)) {
  TaskManager.defineTask<{ locations: Location.LocationObject[] }>(
    BACKGROUND_LOCATION_TASK,
    async (body) => {
      if (body.error) {
        console.warn("[ride-tracker] background error", body.error);
        return;
      }
      if (body.data?.locations) {
        // Les locations sont push sur le store global (accessible depuis le hook
        // via Location.getLastKnownPositionAsync, ou un store externe Zustand
        // en production). Pour le scope demo on log seulement.
        console.log("[ride-tracker] bg locations", body.data.locations.length);
      }
    },
  );
}

// ---------------------------------------------------------------------------
// Hook principal
// ---------------------------------------------------------------------------

export function useRideTracker() {
  const [stats, setStats] = useState<LiveStats>(INITIAL);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);
  const pauseStartRef = useRef<number>(0);
  const elapsedTickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tick chaque seconde pour mettre a jour elapsedSec meme sans bouger
  useEffect(() => {
    if (stats.status !== "recording") return;
    elapsedTickerRef.current = setInterval(() => {
      setStats((s) => {
        if (s.status !== "recording") return s;
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current - pausedDurationRef.current) / 1000);
        return { ...s, elapsedSec: elapsed };
      });
    }, 1000);
    return () => {
      if (elapsedTickerRef.current) clearInterval(elapsedTickerRef.current);
    };
  }, [stats.status]);

  function ingestLocation(loc: Location.LocationObject) {
    const point: GpsPoint = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      altitude: loc.coords.altitude,
      speed: loc.coords.speed,
      accuracy: loc.coords.accuracy,
      timestamp: loc.timestamp,
    };

    setStats((s) => {
      if (s.status !== "recording") return s;
      // Filtre accuracy : ignore les points avec une erreur > 25 m
      if (point.accuracy && point.accuracy > 25) return s;
      const last = s.points[s.points.length - 1];
      let addedDistance = 0;
      let elevationGain = 0;
      let elevationLoss = 0;
      if (last) {
        addedDistance = calculateDistance(last, point);
        if (addedDistance > 250) return s; // saut suspect, ignore
        if (point.altitude !== null && last.altitude !== null) {
          const dAlt = point.altitude - last.altitude;
          if (dAlt > 0.5) elevationGain = dAlt;
          else if (dAlt < -0.5) elevationLoss = -dAlt;
        }
      }
      const newDistanceM = s.distanceM + addedDistance;
      const newElevationGainM = s.elevationGainM + elevationGain;
      const newElevationLossM = s.elevationLossM + elevationLoss;
      const speedMps = point.speed && point.speed > 0 ? point.speed : 0;
      const maxSpeedMps = Math.max(s.maxSpeedMps, speedMps);
      const avgSpeedMps = s.elapsedSec > 0 ? newDistanceM / s.elapsedSec : 0;
      // 50 kcal par km en velo, approximation grossiere
      const caloriesKcal = (newDistanceM / 1000) * 50;
      return {
        ...s,
        points: [...s.points, point],
        distanceM: newDistanceM,
        elevationGainM: newElevationGainM,
        elevationLossM: newElevationLossM,
        speedMps,
        avgSpeedMps,
        maxSpeedMps,
        caloriesKcal,
      };
    });
  }

  async function start(): Promise<{ ok: boolean; error?: string }> {
    const perms = await requestPermissions();
    if (!perms.foreground) return { ok: false, error: perms.error ?? "Permissions GPS refusées" };

    startTimeRef.current = Date.now();
    pausedDurationRef.current = 0;
    setStats({ ...INITIAL, status: "recording" });

    try {
      // Foreground subscription : update toutes les secondes ou tous les 5m
      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 5,
        },
        ingestLocation,
      );

      // Background task pour continuer ecran verrouille
      if (perms.background && Platform.OS !== "web") {
        await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000,
          distanceInterval: 10,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: "Alpes in Bike enregistre votre ride",
            notificationBody: "Tracking GPS actif en arrière-plan",
            notificationColor: "#E15A23",
          },
        });
      }
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "Erreur démarrage GPS" };
    }
  }

  function pause() {
    if (stats.status !== "recording") return;
    pauseStartRef.current = Date.now();
    setStats((s) => ({ ...s, status: "paused" }));
  }

  function resume() {
    if (stats.status !== "paused") return;
    pausedDurationRef.current += Date.now() - pauseStartRef.current;
    setStats((s) => ({ ...s, status: "recording" }));
  }

  async function stop(): Promise<LiveStats> {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    try {
      const running = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      if (running) await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    } catch {
      // ignore
    }
    let final: LiveStats = stats;
    setStats((s) => {
      final = { ...s, status: "finished" };
      return final;
    });
    return final;
  }

  function reset() {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    setStats(INITIAL);
  }

  return { stats, start, pause, resume, stop, reset };
}

// ---------------------------------------------------------------------------
// Helpers formatage
// ---------------------------------------------------------------------------

export function formatElapsed(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function mpsToKmh(mps: number): number {
  return mps * 3.6;
}

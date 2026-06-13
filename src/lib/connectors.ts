/**
 * Connecteurs sources de données fitness.
 *
 * Chaque connecteur définit un protocole d'auth et un type de données.
 * L'app gère seulement le statut côté UI ; les jetons OAuth sont stockés
 * dans Supabase (table `user_connectors`) ou SecureStore pour le BLE.
 *
 * Connecteurs prévus :
 *   1. Apple Health     (HealthKit, iOS only, lib: react-native-health)
 *   2. Wear OS / Google Fit (Health Connect Android, lib: react-native-health-connect)
 *   3. Strava           (OAuth, REST, sync activités passées et auto-upload)
 *   4. Garmin Connect   (OAuth, fenix/edge/forerunner)
 *   5. Polar Accesslink (OAuth)
 *   6. Suunto           (OAuth)
 *   7. Wahoo Fitness    (REST + BLE Tickr/Elemnt)
 *   8. BLE Heart Rate   (capteur générique 0x180D)
 *   9. BLE Power Meter  (Stages, 4iiii, Favero, Quarq)
 */

import { useEffect, useState } from "react";
import { supabase, isSupabaseEnabled } from "./supabase";

export type ConnectorId =
  | "apple-health"
  | "google-fit"
  | "strava"
  | "garmin"
  | "polar"
  | "suunto"
  | "wahoo"
  | "ble-hr"
  | "ble-power";

export type ConnectorStatus = {
  id: ConnectorId;
  name: string;
  brand: string;
  icon: string;
  brandColor: string;
  description: string;
  protocol: "healthkit" | "health-connect" | "oauth" | "ble" | "ant+";
  capabilities: Array<"history" | "live-hr" | "live-power" | "live-cadence" | "live-gps" | "upload">;
  connected: boolean;
  lastSync?: string;     // ISO timestamp
  deviceName?: string;
  batteryPct?: number;
};

const CATALOG: Omit<ConnectorStatus, "connected" | "lastSync" | "deviceName" | "batteryPct">[] = [
  { id: "apple-health", name: "Apple Santé", brand: "Apple",   icon: "logo-apple",       brandColor: "#000000", description: "Tous vos rides Apple Watch synchronisés en arrière-plan.", protocol: "healthkit",      capabilities: ["history","live-hr","live-gps","upload"] },
  { id: "google-fit",   name: "Google Fit",  brand: "Google",  icon: "logo-google",      brandColor: "#0F9D58", description: "Compatible Wear OS, Fitbit, Samsung Health via Health Connect.", protocol: "health-connect", capabilities: ["history","live-hr","upload"] },
  { id: "strava",       name: "Strava",      brand: "Strava",  icon: "flame-outline",    brandColor: "#FC5200", description: "Import auto de tous vos rides Strava et upload des sorties Alpes in Bike.", protocol: "oauth",         capabilities: ["history","upload"] },
  { id: "garmin",       name: "Garmin Connect", brand: "Garmin", icon: "watch-outline",  brandColor: "#000000", description: "Edge, Forerunner, Fenix, Vivoactive : capteurs et historique.", protocol: "oauth",         capabilities: ["history","live-hr","live-power","live-cadence","live-gps","upload"] },
  { id: "polar",        name: "Polar Flow",  brand: "Polar",   icon: "fitness-outline",  brandColor: "#E50000", description: "Vantage, Grit X, H10 cardio.", protocol: "oauth", capabilities: ["history","live-hr","upload"] },
  { id: "suunto",       name: "Suunto",      brand: "Suunto",  icon: "compass-outline",  brandColor: "#0F1419", description: "Race, Vertical, 9 Peak. Excellent pour le trail/VTT engagé.", protocol: "oauth", capabilities: ["history","live-hr","live-gps","upload"] },
  { id: "wahoo",        name: "Wahoo",       brand: "Wahoo",   icon: "speedometer-outline", brandColor: "#0079C1", description: "Elemnt Bolt/Roam, Tickr cardio, Kickr home-trainer.", protocol: "oauth", capabilities: ["history","live-hr","live-power","live-cadence","upload"] },
  { id: "ble-hr",       name: "Ceinture cardio BLE", brand: "BLE", icon: "heart-outline", brandColor: "#E11D48", description: "Polar H10, Wahoo Tickr, Garmin HRM-Pro, Coospo, Magene...", protocol: "ble", capabilities: ["live-hr"] },
  { id: "ble-power",    name: "Capteur de puissance BLE", brand: "BLE", icon: "flash-outline", brandColor: "#7C3AED", description: "Stages, 4iiii, Favero Assioma, Quarq, Power2Max.", protocol: "ble", capabilities: ["live-power","live-cadence"] },
];

/** Mock initial pour la démo : Marie a déjà connecté Apple Watch + ceinture Polar. */
const MOCK_STATE: Record<ConnectorId, Partial<ConnectorStatus>> = {
  "apple-health": { connected: true, lastSync: new Date(Date.now() - 1000 * 60 * 18).toISOString(), deviceName: "Apple Watch Series 10" },
  "ble-hr":       { connected: true, deviceName: "Polar H10", batteryPct: 82 },
  "google-fit":   { connected: false },
  "strava":       { connected: true, lastSync: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
  "garmin":       { connected: false },
  "polar":        { connected: false },
  "suunto":       { connected: false },
  "wahoo":        { connected: false },
  "ble-power":    { connected: false },
};

export async function listConnectors(): Promise<ConnectorStatus[]> {
  if (!isSupabaseEnabled) {
    return CATALOG.map((c) => ({ ...c, ...MOCK_STATE[c.id] } as ConnectorStatus));
  }
  try {
    const { data, error } = await supabase
      .from("user_connectors")
      .select("connector_id, connected, last_sync_at, device_name, battery_pct");
    if (error) throw error;
    const map = new Map((data ?? []).map((r: any) => [r.connector_id as ConnectorId, r]));
    return CATALOG.map((c) => {
      const row = map.get(c.id);
      return {
        ...c,
        connected: !!row?.connected,
        lastSync: row?.last_sync_at,
        deviceName: row?.device_name,
        batteryPct: row?.battery_pct,
      };
    });
  } catch (e) {
    console.warn("[connectors] supabase failed, mock", e);
    return CATALOG.map((c) => ({ ...c, ...MOCK_STATE[c.id] } as ConnectorStatus));
  }
}

export function useConnectors() {
  const [list, setList] = useState<ConnectorStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listConnectors().then((r) => {
      if (cancelled) return;
      setList(r);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { list, loading, setList };
}

export function formatLastSync(iso?: string): string {
  if (!iso) return "Jamais synchronisé";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const h = Math.round(mins / 60);
  if (h < 24) return `Il y a ${h} h`;
  const d = Math.round(h / 24);
  return `Il y a ${d} j`;
}

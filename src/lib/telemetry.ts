/**
 * Télémétrie live pendant un ride.
 *
 * En production : la lib s'abonne au capteur connecté (montre, ceinture
 * cardio BLE, capteur de puissance Wahoo/Stages...) et émet des updates
 * toutes les 1 à 2 secondes.
 *
 * En dev sans capteur : génère des valeurs réalistes (HR oscille autour
 * d'une zone cible, puissance suit le dénivelé, cadence stable).
 *
 * Capteurs supportés (à ajouter dans connectors.ts) :
 *   - BLE Heart Rate Profile (0x180D) via react-native-ble-plx
 *   - Apple HealthKit live (react-native-health)
 *   - Wear OS / Google Fit (react-native-google-fit)
 *   - Garmin Connect IQ (websocket relais via backend)
 *   - Polar Accesslink (REST polling)
 *
 * Format : conformité à la norme ANT+ FE-C / BLE FTMS pour interop.
 */

import { useEffect, useRef, useState } from "react";

export type HrZone = 1 | 2 | 3 | 4 | 5;

export type LiveTelemetry = {
  hr: number;             // bpm
  hrZone: HrZone;
  cadence: number;        // tours/min
  power: number;          // watts
  speed: number;          // km/h
  /** % de l'effort dans la zone cible (utilisé pour le coach). */
  effortPct: number;
  /** Source courante. Inconnu si aucun capteur. */
  source: "ble-hr" | "apple-watch" | "wear-os" | "garmin" | "polar" | "wahoo" | "simulator";
  /** Signal radio (BLE / GPS / réseau). */
  signal: "good" | "weak" | "lost";
  batteryPct?: number;
};

/** Profil utilisateur pour le calcul des zones. À remplir depuis profiles. */
export type AthleteProfile = {
  ageYears: number;
  restingHr?: number;
  ftpWatts?: number;
};

/** Calcule FCmax estimée via formule Tanaka (208 - 0.7 * âge). */
export function estimatedMaxHr(ageYears: number): number {
  return Math.round(208 - 0.7 * ageYears);
}

/** Renvoie la zone d'effort 1 à 5 selon % de FCmax (norme Karvonen simplifiée). */
export function hrToZone(hr: number, maxHr: number): HrZone {
  const pct = hr / maxHr;
  if (pct < 0.6) return 1;
  if (pct < 0.7) return 2;
  if (pct < 0.8) return 3;
  if (pct < 0.9) return 4;
  return 5;
}

export const ZONE_META: Record<HrZone, { label: string; tint: string; advice: string }> = {
  1: { label: "Récup",      tint: "#0EA5E9", advice: "Très facile, idéal pour échauffement et retour au calme." },
  2: { label: "Endurance",  tint: "#0D4F3D", advice: "Confortable, vous pourriez tenir une conversation. Brûle les graisses." },
  3: { label: "Tempo",      tint: "#FACC15", advice: "Soutenu mais maîtrisé. La zone qui rend fort sans casser." },
  4: { label: "Seuil",      tint: "#E15A23", advice: "Inconfortable, respiration courte. À tenir 10 à 30 minutes max." },
  5: { label: "VO2 max",    tint: "#B8431A", advice: "Maximal. Réservé aux intervalles courts, redoutable mais payant." },
};

// ---------------------------------------------------------------------------
// Simulateur (utilisé quand aucun capteur n'est appairé)
// ---------------------------------------------------------------------------

type SimConfig = { baseHr: number; baseCadence: number; basePower: number; baseSpeed: number };

function makeSim(config: SimConfig) {
  let t = 0;
  return (): LiveTelemetry => {
    t += 1;
    const wobble = Math.sin(t / 6) * 0.08 + Math.sin(t / 19) * 0.04;
    const hr = Math.round(config.baseHr * (1 + wobble));
    const cadence = Math.round(config.baseCadence + Math.sin(t / 4) * 4);
    const power = Math.round(config.basePower * (1 + wobble + Math.sin(t / 11) * 0.1));
    const speed = Math.max(0, config.baseSpeed + Math.sin(t / 7) * 4);
    const zone = hrToZone(hr, 186);
    const target: HrZone = 3;
    const effortPct = Math.max(0, Math.min(100, 100 - Math.abs(zone - target) * 20));
    return { hr, hrZone: zone, cadence, power, speed, effortPct, source: "simulator", signal: "good", batteryPct: 78 };
  };
}

// ---------------------------------------------------------------------------
// Hook live (s'abonne au premier capteur disponible, sinon simulateur)
// ---------------------------------------------------------------------------

export function useLiveTelemetry(opts: { active: boolean; profile?: AthleteProfile }) {
  const [telemetry, setTelemetry] = useState<LiveTelemetry | null>(null);
  const simRef = useRef<ReturnType<typeof makeSim> | null>(null);

  useEffect(() => {
    if (!opts.active) {
      setTelemetry(null);
      return;
    }
    // À brancher : si une source réelle (BLE, Apple Watch...) est appairée,
    // s'abonner ici. Pour la démo on lance le simulateur.
    if (!simRef.current) {
      simRef.current = makeSim({ baseHr: 142, baseCadence: 84, basePower: 195, baseSpeed: 22 });
    }
    setTelemetry(simRef.current());
    const id = setInterval(() => {
      if (!simRef.current) return;
      setTelemetry(simRef.current());
    }, 1500);
    return () => clearInterval(id);
  }, [opts.active]);

  return telemetry;
}

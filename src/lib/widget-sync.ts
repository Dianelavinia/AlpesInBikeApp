/**
 * Synchronisation des stats utilisateur vers les widgets natifs.
 *
 * iOS (WidgetKit) : ecrit dans UserDefaults App Group "group.com.alpesinbike.app"
 * Android (Glance) : ecrit dans SharedPreferences "alpes_widget"
 *
 * Le widget natif lit ensuite via :
 *   iOS    : UserDefaults(suiteName: "group.com.alpesinbike.app")?.integer(forKey: "km")
 *   Android: ctx.getSharedPreferences("alpes_widget", MODE_PRIVATE).getInt("km", 0)
 *
 * Pour ecrire depuis JS on a besoin d un pont natif :
 *   iOS    : module Swift WidgetBridge expose RCTMethod setData
 *   Android: module Kotlin WidgetBridge expose setData
 *
 * Tant que le pont natif n est pas compile (custom dev client),
 * on log et on stub silencieusement. La data reste en SecureStore
 * pour relecture rapide cote app.
 */

import { Platform, NativeModules } from "react-native";
import * as SecureStore from "expo-secure-store";

export type WidgetSnapshot = {
  km: number;
  kmThisWeek: number;
  co2: number;
  rank: number;
  rankTotal: number;
  streakDays: number;
  monthlyKm: number;
  monthlyGoal: number;
  badges: number;
};

const SECURE_KEY = "widget_snapshot_v1";

const WidgetBridge: any = (NativeModules as any).WidgetBridge;

/**
 * Pousse les dernieres stats vers le widget natif.
 * A appeler :
 *   - apres le login
 *   - apres chaque fin de ride
 *   - au demarrage de l app
 *   - apres rafraichissement du leaderboard
 */
export async function syncWidgetSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  // 1. Sauve la derniere snapshot connue pour relecture rapide
  try {
    if (Platform.OS !== "web") {
      await SecureStore.setItemAsync(SECURE_KEY, JSON.stringify(snapshot));
    }
  } catch (e) {
    console.warn("[widget-sync] SecureStore failed", e);
  }

  // 2. Pousse au widget natif si pont disponible
  if (Platform.OS === "web") return;
  if (!WidgetBridge || typeof WidgetBridge.setData !== "function") {
    console.log("[widget-sync] WidgetBridge non disponible, voir native-widgets/README.md", snapshot);
    return;
  }
  try {
    await WidgetBridge.setData(snapshot);
    if (typeof WidgetBridge.reloadAll === "function") {
      await WidgetBridge.reloadAll();
    }
  } catch (e) {
    console.warn("[widget-sync] bridge failed", e);
  }
}

export async function readLastSnapshot(): Promise<WidgetSnapshot | null> {
  if (Platform.OS === "web") return null;
  try {
    const raw = await SecureStore.getItemAsync(SECURE_KEY);
    return raw ? (JSON.parse(raw) as WidgetSnapshot) : null;
  } catch {
    return null;
  }
}

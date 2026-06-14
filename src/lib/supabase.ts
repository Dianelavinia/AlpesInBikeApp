import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

// Sur Node SSR (Expo Router rendering), pas de WebSocket natif avant Node 22.
// Supabase Realtime crashe à l'init du client. On stub un WebSocket no-op
// pour passer la construction. Aucun impact côté client web (window présent)
// ni iOS/Android (WebSocket natif).
if (typeof window === "undefined" && typeof (globalThis as any).WebSocket === "undefined") {
  (globalThis as any).WebSocket = class {
    close() {}
    addEventListener() {}
    removeEventListener() {}
    send() {}
  };
}

/**
 * Client Supabase pour l'app mobile.
 * À activer en définissant EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY.
 *
 * Sur Web, expo-secure-store n'existe pas : on fallback sur localStorage
 * pour permettre la preview développeur. En prod iOS/Android, SecureStore.
 */

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

const webStorage = {
  getItem: async (key: string) => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },
};

const nativeStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const storage = Platform.OS === "web" ? webStorage : nativeStorage;

export const supabase = createClient(SUPABASE_URL || "https://placeholder.supabase.co", SUPABASE_ANON_KEY || "placeholder", {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const isSupabaseEnabled = !!SUPABASE_URL && !!SUPABASE_ANON_KEY;

/**
 * Authentification : Apple, Google, email magique, sessions Supabase.
 *
 * En production, brancher :
 *   - expo-apple-authentication pour Sign in with Apple (iOS only)
 *   - expo-auth-session + Google OAuth WebClientId pour Google (iOS, Android, Web)
 *   - Supabase Auth pour la session unifiee
 *
 * Documentation Supabase :
 *   https://supabase.com/docs/guides/auth/social-login/auth-apple
 *   https://supabase.com/docs/guides/auth/social-login/auth-google
 */

import { Platform } from "react-native";
import { supabase, isSupabaseEnabled } from "./supabase";

export type AuthProvider = "apple" | "google" | "email";

export type AuthResult = { ok: true } | { ok: false; error: string };

/**
 * Lance le flow OAuth Apple. Retourne un AuthResult.
 *
 * En prod iOS : utilise expo-apple-authentication pour récupérer un
 * identityToken puis supabase.auth.signInWithIdToken({ provider: "apple", token })
 * En prod Android / Web : redirige vers le flow Web Supabase OAuth.
 */
export async function signInWithApple(): Promise<AuthResult> {
  if (!isSupabaseEnabled) {
    console.warn("[auth] Supabase non configuré, Apple OAuth simulé");
    return { ok: true };
  }
  try {
    if (Platform.OS === "ios") {
      // Production : decommenter une fois expo-apple-authentication installe
      // const credential = await AppleAuthentication.signInAsync({
      //   requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
      // });
      // if (!credential.identityToken) return { ok: false, error: "Pas de token Apple" };
      // const { error } = await supabase.auth.signInWithIdToken({ provider: "apple", token: credential.identityToken });
      // if (error) return { ok: false, error: error.message };
      // return { ok: true };
      return { ok: false, error: "expo-apple-authentication non installé, à brancher dans EAS build" };
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider: "apple" });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Erreur Apple" };
  }
}

/**
 * Lance le flow OAuth Google.
 * iOS / Android : expo-auth-session + native Google Sign-In, retourne idToken
 * puis supabase.auth.signInWithIdToken({ provider: "google", token })
 * Web : supabase.auth.signInWithOAuth({ provider: "google" })
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  if (!isSupabaseEnabled) {
    console.warn("[auth] Supabase non configuré, Google OAuth simulé");
    return { ok: true };
  }
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? window.location.origin + "/auth-callback" : undefined },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Erreur Google" };
  }
}

/** Lance un magic link par email. */
export async function signInWithMagicLink(email: string): Promise<AuthResult> {
  if (!isSupabaseEnabled) {
    return { ok: true };
  }
  try {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Erreur email" };
  }
}

export async function signOut(): Promise<void> {
  if (!isSupabaseEnabled) return;
  await supabase.auth.signOut();
}

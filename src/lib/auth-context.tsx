/**
 * Auth context global.
 *
 * Gere la session utilisateur, persistee via Supabase auth + SecureStore.
 * Expose useAuth() hook pour acceder a user, session, loading, signOut.
 *
 * En production : la session Supabase est restaure au demarrage via
 * supabase.auth.getSession(), et un listener met a jour le context
 * a chaque changement (signIn, signOut, token refresh).
 *
 * Mock : si pas de Supabase, on simule un user mock pour la demo.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseEnabled } from "./supabase";

export type AppUser = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  avatarInitial: string;
  avatarColor: string;
  pseudoSet: boolean;
  onboardingDone: boolean;
};

type AuthState = {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  setPseudoLocal: (displayName: string) => void;
};

const Ctx = createContext<AuthState>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refresh: async () => {},
  setPseudoLocal: () => {},
});

const MOCK_USER: AppUser = {
  id: "u-me",
  email: "marie@example.com",
  displayName: "Marie",
  avatarInitial: "MR",
  avatarColor: "#E15A23",
  pseudoSet: true,
  onboardingDone: true,
};

function toAppUser(supabaseUser: User | null): AppUser | null {
  if (!supabaseUser) return null;
  const meta = (supabaseUser.user_metadata ?? {}) as any;
  const displayName = (meta.display_name as string) ?? (supabaseUser.email?.split("@")[0] ?? "Rideur");
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    displayName,
    avatarUrl: meta.avatar_url,
    avatarInitial: displayName.slice(0, 2).toUpperCase(),
    avatarColor: meta.avatar_color ?? "#E15A23",
    pseudoSet: !!meta.pseudo_set,
    onboardingDone: !!meta.onboarding_done,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadSession() {
    if (!isSupabaseEnabled) {
      // Mode demo : utilisateur mock connecte
      setUser(MOCK_USER);
      setSession(null);
      setLoading(false);
      return;
    }
    try {
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);
      setUser(toAppUser(s?.user ?? null));
    } catch (e) {
      console.warn("[auth] getSession failed", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSession();
    if (!isSupabaseEnabled) return;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(toAppUser(s?.user ?? null));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    if (isSupabaseEnabled) await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  }

  function setPseudoLocal(displayName: string) {
    setUser((u) => (u ? { ...u, displayName, pseudoSet: true, avatarInitial: displayName.slice(0, 2).toUpperCase() } : u));
  }

  return (
    <Ctx.Provider value={{ user, session, loading, signOut, refresh: loadSession, setPseudoLocal }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}

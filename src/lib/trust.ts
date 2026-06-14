/**
 * Système de confiance utilisateur.
 *
 * Objectif : eviter que des gens mal intentionnes organisent des sorties
 * ou envoient des invitations pour reperer/voler des velos.
 *
 * 5 niveaux de confiance progressifs avec gates sur les actions a risque :
 *   - Anonyme        : navigation seule, aucune interaction
 *   - Email          : commenter, liker, rejoindre une sortie publique
 *   - Phone          : inviter un copain en direct, envoyer message
 *   - Identite       : organiser une sortie groupe (verif via Stripe Identity)
 *   - Ambassadeur    : niveau premium accorde apres N sorties sans incident
 *
 * Verifications :
 *   - Email : magic link Supabase, deja en place
 *   - Phone : OTP SMS Twilio ou Supabase Phone Auth
 *   - Identite : Stripe Identity (pieces d ID + selfie video, KYC light)
 *   - Ambassadeur : automatique apres 10 sorties terminees sans report
 *
 * En prod : table `user_trust` Supabase avec colonnes phone_verified_at,
 * identity_verified_at, ambassador_at, reports_count, rides_completed.
 */

import { useEffect, useState } from "react";
import { supabase, isSupabaseEnabled } from "./supabase";

export type TrustLevel = "anonymous" | "email" | "phone" | "identity" | "ambassador";

export type TrustStatus = {
  level: TrustLevel;
  emailVerifiedAt?: string;
  phoneVerifiedAt?: string;
  identityVerifiedAt?: string;
  ambassadorSince?: string;
  ridesCompleted: number;
  reportsAgainst: number;
};

export const TRUST_META: Record<TrustLevel, {
  label: string;
  shortLabel: string;
  icon: string;
  tint: string;
  bg: string;
  description: string;
}> = {
  anonymous:  { label: "Non vérifié",      shortLabel: "Visiteur",     icon: "help-circle-outline",      tint: "#94A3B8", bg: "rgba(148,163,184,0.12)", description: "Pas de compte ou aucune vérification. Peut seulement consulter." },
  email:      { label: "Email vérifié",     shortLabel: "Email",         icon: "mail-outline",              tint: "#0EA5E9", bg: "rgba(14,165,233,0.12)",  description: "Adresse email confirmée. Peut commenter et rejoindre des sorties publiques." },
  phone:      { label: "Téléphone vérifié", shortLabel: "Téléphone",    icon: "call-outline",              tint: "#0D4F3D", bg: "rgba(13,79,61,0.12)",    description: "Numéro de téléphone confirmé par SMS. Peut envoyer des invitations privées." },
  identity:   { label: "Identité vérifiée", shortLabel: "Identité",     icon: "shield-checkmark",          tint: "#E15A23", bg: "rgba(225,90,35,0.12)",   description: "Pièce d'identité + selfie vérifiés (Stripe Identity). Peut organiser des sorties groupe." },
  ambassador: { label: "Ambassadeur",        shortLabel: "Ambassadeur",  icon: "ribbon",                     tint: "#7C3AED", bg: "rgba(124,58,237,0.14)",  description: "10+ sorties sans incident. Profil de confiance certifié communauté." },
};

const LEVEL_ORDER: TrustLevel[] = ["anonymous", "email", "phone", "identity", "ambassador"];

export function meetsLevel(current: TrustLevel, required: TrustLevel): boolean {
  return LEVEL_ORDER.indexOf(current) >= LEVEL_ORDER.indexOf(required);
}

// ---------------------------------------------------------------------------
// Gates : ce qu il faut pour chaque action a risque
// ---------------------------------------------------------------------------

export type GatedAction = "joinGroup" | "inviteBuddy" | "organizeGroup" | "acceptInvite" | "sendMessage";

export const ACTION_REQUIREMENTS: Record<GatedAction, { required: TrustLevel; reason: string }> = {
  joinGroup:      { required: "email",    reason: "Pour rejoindre une sortie groupe, confirmez votre email. C'est gratuit et rapide, ça protège les autres rideurs." },
  inviteBuddy:    { required: "phone",    reason: "Pour inviter quelqu'un en direct, vérifiez votre numéro de téléphone. Ça permet aux autres de savoir qu'il y a une vraie personne derrière." },
  sendMessage:    { required: "phone",    reason: "Les messages privés sont réservés aux profils avec téléphone vérifié pour limiter le spam et les arnaques." },
  organizeGroup:  { required: "identity", reason: "Pour organiser une sortie groupe, vérifiez votre identité (pièce + selfie). C'est essentiel pour la sécurité : les autres rideurs sauront qui ils rencontrent au point de rdv." },
  acceptInvite:   { required: "email",    reason: "Vérifiez au moins votre email avant d'accepter une invitation, pour qu'on puisse vous prévenir si la sortie est modifiée ou annulée." },
};

export function canDo(action: GatedAction, currentLevel: TrustLevel): boolean {
  return meetsLevel(currentLevel, ACTION_REQUIREMENTS[action].required);
}

// ---------------------------------------------------------------------------
// API : recupere le niveau de trust de l utilisateur courant
// ---------------------------------------------------------------------------

const MOCK_TRUST: TrustStatus = {
  level: "email",
  emailVerifiedAt: "2026-05-12T10:00:00Z",
  ridesCompleted: 4,
  reportsAgainst: 0,
};

export async function getMyTrust(): Promise<TrustStatus> {
  if (!isSupabaseEnabled) return MOCK_TRUST;
  try {
    const { data, error } = await supabase.rpc("get_my_trust");
    if (error || !data) return MOCK_TRUST;
    return data as TrustStatus;
  } catch {
    return MOCK_TRUST;
  }
}

export function useMyTrust() {
  const [trust, setTrust] = useState<TrustStatus>(MOCK_TRUST);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    getMyTrust().then((t) => {
      if (cancelled) return;
      setTrust(t);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return { trust, loading };
}

/** Renvoie le niveau de confiance d un autre rideur (pour affichage). */
export function getBuddyTrust(buddyId: string): TrustLevel {
  // En prod : lookup table user_trust
  // Pour la demo : derive un niveau plausible depuis l'id pour varier l'UI
  const hash = buddyId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const buckets: TrustLevel[] = ["email", "phone", "phone", "identity", "identity", "ambassador"];
  return buckets[hash % buckets.length];
}

/**
 * Couche sécurité communauté : blocage et signalement.
 * RPC Supabase block_user, unblock_user, report_user (table safety_block_report).
 */

import { supabase, isSupabaseEnabled } from "./supabase";

export type ReportReason =
  | "inappropriate_content"
  | "spam"
  | "fake_profile"
  | "harassment"
  | "suspicious_behavior"
  | "no_show"
  | "theft_attempt"
  | "other";

export const REPORT_REASONS: { id: ReportReason; label: string; description: string }[] = [
  { id: "fake_profile",        label: "Faux profil",            description: "Le profil semble usurper l'identité de quelqu'un d'autre ou être fictif" },
  { id: "suspicious_behavior", label: "Comportement suspect",  description: "Insistance bizarre, demande de venir seul, pression sur les vélos" },
  { id: "theft_attempt",       label: "Tentative de vol",       description: "A tenté de voler un vélo lors d'une sortie groupe" },
  { id: "harassment",          label: "Harcèlement",            description: "Messages insistants, propos déplacés, intimidation" },
  { id: "inappropriate_content", label: "Contenu inapproprié",  description: "Photos ou texte choquants, illicites, à caractère sexuel" },
  { id: "no_show",             label: "No-show répété",         description: "S'inscrit aux sorties et ne vient jamais sans prévenir" },
  { id: "spam",                label: "Spam",                    description: "Envoie de la pub ou des messages commerciaux non sollicités" },
  { id: "other",               label: "Autre",                   description: "Précisez en quelques mots dans le message" },
];

export async function blockUser(blockedId: string, reason?: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseEnabled) return { ok: true };
  try {
    const { error } = await supabase.from("blocked_users").insert({ blocked_id: blockedId, reason });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message };
  }
}

export async function unblockUser(blockedId: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseEnabled) return { ok: true };
  try {
    const { error } = await supabase.from("blocked_users").delete().eq("blocked_id", blockedId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message };
  }
}

export async function reportUser(opts: {
  reportedId: string;
  reason: ReportReason;
  message?: string;
  context?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseEnabled) {
    console.log("[safety] mock report", opts);
    return { ok: true };
  }
  try {
    const { error } = await supabase.from("user_reports").insert({
      reported_id: opts.reportedId,
      reason: opts.reason,
      message: opts.message,
      context: opts.context,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message };
  }
}

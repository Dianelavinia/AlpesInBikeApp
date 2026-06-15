// Edge Function Supabase : declenche un push silencieux pour rafraichir
// le widget natif iOS ou Android d un utilisateur cible.
//
// Appel typique :
//   - Apres l insert d un ride : trigger SQL appelle cette fonction
//   - Quand un user est depasse dans le classement : trigger
//   - Apres calcul nightly du widget_snapshot
//
// Deploy : supabase functions deploy push-widget-refresh

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EXPO_ACCESS_TOKEN = Deno.env.get("EXPO_ACCESS_TOKEN") ?? "";

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const { user_id } = await req.json();
  if (!user_id) return new Response("user_id required", { status: 400 });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  // 1. Recharge le snapshot via RPC
  const { error: rpcError } = await supabase.rpc("refresh_widget_snapshot", {}, {
    head: false,
  });
  if (rpcError) {
    return new Response(JSON.stringify({ error: rpcError.message }), { status: 500 });
  }

  // 2. Recupere les push tokens du user (table user_devices)
  const { data: devices } = await supabase
    .from("user_devices")
    .select("expo_push_token, platform")
    .eq("user_id", user_id);

  if (!devices || devices.length === 0) {
    return new Response(JSON.stringify({ skipped: "no devices" }), { status: 200 });
  }

  // 3. Envoie un push silencieux pour declencher le widget reload
  // iOS : content-available 1, sans alert
  // Android : data-only, FCM declenche le receiver
  const messages = devices.map((d: any) => ({
    to: d.expo_push_token,
    data: { type: "widget.refresh" },
    contentAvailable: true,
    priority: "high",
    sound: null,
    _displayInForeground: false,
  }));

  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(EXPO_ACCESS_TOKEN && { "Authorization": `Bearer ${EXPO_ACCESS_TOKEN}` }),
    },
    body: JSON.stringify(messages),
  });

  const result = await res.json();
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

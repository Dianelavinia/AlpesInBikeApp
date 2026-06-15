/**
 * Messagerie in-app entre rideurs.
 *
 * Branche sur Supabase tables conversations + messages avec RLS qui limite
 * l acces aux participants. Realtime Supabase pour push instantane.
 *
 * Fallback mock si Supabase pas configure : conversations en RAM,
 * disparaissent au reload.
 */

import { useEffect, useState } from "react";
import { supabase, isSupabaseEnabled } from "./supabase";
import { BUDDIES, type Buddy } from "./buddies";

export type Message = {
  id: string;
  conversationId: string;
  authorId: string;
  text: string;
  sentAt: string;
  isMine: boolean;
};

export type Conversation = {
  id: string;
  withBuddyId: string;
  lastMessage: string;
  lastSentAt: string;
  unread: number;
};

// ---------------------------------------------------------------------------
// MOCK fallback
// ---------------------------------------------------------------------------

const MOCK_CONVERSATIONS: Conversation[] = BUDDIES.filter((b) => b.isFriend).map((b, i) => ({
  id: `conv-${b.id}`,
  withBuddyId: b.id,
  lastMessage: i % 3 === 0 ? "Top, on se voit samedi 8h au point de RDV ?" :
               i % 3 === 1 ? "Coucou, ca tient toujours pour demain ?" :
                              "Merci pour les conseils sur la boucle des Bauges",
  lastSentAt: i === 0 ? "il y a 5 min" : i === 1 ? "hier" : `il y a ${i} jours`,
  unread: i === 0 ? 2 : 0,
}));

const MOCK_MESSAGES_BY_CONV: Record<string, Message[]> = {};

function seedMockMessages(convId: string, buddyId: string) {
  if (MOCK_MESSAGES_BY_CONV[convId]) return;
  MOCK_MESSAGES_BY_CONV[convId] = [
    { id: `${convId}-1`, conversationId: convId, authorId: buddyId, text: "Salut, tu fais la boucle des Bauges samedi ?",          sentAt: "10:42", isMine: false },
    { id: `${convId}-2`, conversationId: convId, authorId: "me",     text: "Oui carrement, ca te dit qu on parte ensemble ?",     sentAt: "10:44", isMine: true },
    { id: `${convId}-3`, conversationId: convId, authorId: buddyId, text: "Avec plaisir. Rdv au parking du Revard a 6h30 ?",      sentAt: "10:45", isMine: false },
    { id: `${convId}-4`, conversationId: convId, authorId: "me",     text: "Parfait. J apporte le cafe.",                          sentAt: "10:46", isMine: true },
    { id: `${convId}-5`, conversationId: convId, authorId: buddyId, text: "Top, on se voit samedi 8h au point de RDV ?",          sentAt: "10:47", isMine: false },
  ];
}

// ---------------------------------------------------------------------------
// API publique : bascule auto Supabase ou mock selon config
// ---------------------------------------------------------------------------

export async function listConversations(): Promise<Conversation[]> {
  if (!isSupabaseEnabled) return MOCK_CONVERSATIONS;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from("conversations")
      .select("id, user_a, user_b, last_message, last_sent_at")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order("last_sent_at", { ascending: false, nullsFirst: false });
    if (error || !data) return MOCK_CONVERSATIONS;
    return data.map((r: any) => ({
      id: r.id,
      withBuddyId: r.user_a === user.id ? r.user_b : r.user_a,
      lastMessage: r.last_message ?? "",
      lastSentAt: r.last_sent_at ?? "",
      unread: 0,
    }));
  } catch {
    return MOCK_CONVERSATIONS;
  }
}

export async function getOrCreateConversation(buddyId: string): Promise<Conversation> {
  if (!isSupabaseEnabled) {
    let conv = MOCK_CONVERSATIONS.find((c) => c.withBuddyId === buddyId);
    if (!conv) {
      conv = { id: `conv-${buddyId}`, withBuddyId: buddyId, lastMessage: "", lastSentAt: "", unread: 0 };
      MOCK_CONVERSATIONS.push(conv);
    }
    return conv;
  }
  try {
    const { data, error } = await supabase.rpc("get_or_create_conversation", { p_other_user_id: buddyId });
    if (error || !data) throw error;
    return { id: data as string, withBuddyId: buddyId, lastMessage: "", lastSentAt: "", unread: 0 };
  } catch {
    return { id: `conv-${buddyId}`, withBuddyId: buddyId, lastMessage: "", lastSentAt: "", unread: 0 };
  }
}

export function useConversations() {
  const [list, setList] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    listConversations().then((r) => {
      if (cancelled) return;
      setList(r);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);
  return { list, loading };
}

export function useMessages(conversationId: string, buddyId: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!isSupabaseEnabled) {
      seedMockMessages(conversationId, buddyId);
      setMessages(MOCK_MESSAGES_BY_CONV[conversationId] ?? []);
      return;
    }
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("messages")
        .select("id, conversation_id, author_id, text, sent_at")
        .eq("conversation_id", conversationId)
        .order("sent_at", { ascending: true });
      if (data) {
        setMessages(data.map((m: any) => ({
          id: m.id,
          conversationId: m.conversation_id,
          authorId: m.author_id,
          text: m.text,
          sentAt: new Date(m.sent_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          isMine: m.author_id === user.id,
        })));
      }

      // Realtime : ecoute des nouveaux messages
      const channel = supabase
        .channel(`conv:${conversationId}`)
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        }, (payload) => {
          const m: any = payload.new;
          setMessages((prev) => [...prev, {
            id: m.id,
            conversationId: m.conversation_id,
            authorId: m.author_id,
            text: m.text,
            sentAt: new Date(m.sent_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
            isMine: m.author_id === user.id,
          }]);
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    })();
  }, [conversationId, buddyId]);

  async function send(text: string) {
    if (!text.trim()) return;
    if (!isSupabaseEnabled) {
      const m: Message = {
        id: `${conversationId}-${Date.now()}`,
        conversationId,
        authorId: "me",
        text: text.trim(),
        sentAt: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        isMine: true,
      };
      MOCK_MESSAGES_BY_CONV[conversationId] = [...(MOCK_MESSAGES_BY_CONV[conversationId] ?? []), m];
      setMessages(MOCK_MESSAGES_BY_CONV[conversationId]);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      author_id: user.id,
      text: text.trim(),
    });
    // Le Realtime listener ajoute le message dans la liste automatiquement
  }

  return { messages, send };
}

export function findBuddyForConversation(conv: Conversation): Buddy | undefined {
  return BUDDIES.find((b) => b.id === conv.withBuddyId);
}

// Compat ancienne API pour ne pas casser les imports existants
export const CONVERSATIONS = MOCK_CONVERSATIONS;
export function getConversations() { return MOCK_CONVERSATIONS; }

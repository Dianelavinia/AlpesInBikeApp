/**
 * Messagerie in-app entre rideurs ayant accepte une invitation mutuelle.
 *
 * En prod : tables conversations + messages Supabase, Realtime pour push,
 * RLS qui n autorise que les participants a la conversation.
 */

import { useEffect, useState } from "react";
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

// Mock conversations basees sur les amis declares
export const CONVERSATIONS: Conversation[] = BUDDIES.filter((b) => b.isFriend).map((b, i) => ({
  id: `conv-${b.id}`,
  withBuddyId: b.id,
  lastMessage: i % 3 === 0 ? "Top ! On se voit samedi 8h au point de RDV ?" :
               i % 3 === 1 ? "Coucou, ca tient toujours pour demain ?" :
                              "Merci pour les conseils sur la boucle des Bauges 🚴",
  lastSentAt: i === 0 ? "il y a 5 min" : i === 1 ? "hier" : `il y a ${i} jours`,
  unread: i === 0 ? 2 : 0,
}));

const MESSAGES_BY_CONV: Record<string, Message[]> = {};

function seedMessages(convId: string, buddyId: string) {
  if (MESSAGES_BY_CONV[convId]) return;
  MESSAGES_BY_CONV[convId] = [
    { id: `${convId}-1`, conversationId: convId, authorId: buddyId, text: "Salut ! Tu fais la boucle des Bauges samedi ?", sentAt: "10:42", isMine: false },
    { id: `${convId}-2`, conversationId: convId, authorId: "me",     text: "Oui carrément, ça te dit qu'on parte ensemble ?", sentAt: "10:44", isMine: true },
    { id: `${convId}-3`, conversationId: convId, authorId: buddyId, text: "Avec plaisir. Rdv au parking du Revard à 6h30 ?", sentAt: "10:45", isMine: false },
    { id: `${convId}-4`, conversationId: convId, authorId: "me",     text: "Parfait. J'apporte le café !", sentAt: "10:46", isMine: true },
    { id: `${convId}-5`, conversationId: convId, authorId: buddyId, text: "Top ! On se voit samedi 8h au point de RDV ?", sentAt: "10:47", isMine: false },
  ];
}

export function getConversations(): Conversation[] {
  return CONVERSATIONS;
}

export function getOrCreateConversation(buddyId: string): Conversation {
  let conv = CONVERSATIONS.find((c) => c.withBuddyId === buddyId);
  if (!conv) {
    conv = { id: `conv-${buddyId}`, withBuddyId: buddyId, lastMessage: "", lastSentAt: "", unread: 0 };
    CONVERSATIONS.push(conv);
  }
  return conv;
}

export function useMessages(conversationId: string, buddyId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  useEffect(() => {
    seedMessages(conversationId, buddyId);
    setMessages(MESSAGES_BY_CONV[conversationId] ?? []);
  }, [conversationId, buddyId]);

  function send(text: string) {
    if (!text.trim()) return;
    const m: Message = {
      id: `${conversationId}-${Date.now()}`,
      conversationId,
      authorId: "me",
      text: text.trim(),
      sentAt: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      isMine: true,
    };
    MESSAGES_BY_CONV[conversationId] = [...(MESSAGES_BY_CONV[conversationId] ?? []), m];
    setMessages(MESSAGES_BY_CONV[conversationId]);
  }

  return { messages, send };
}

export function findBuddyForConversation(conv: Conversation): Buddy | undefined {
  return BUDDIES.find((b) => b.id === conv.withBuddyId);
}

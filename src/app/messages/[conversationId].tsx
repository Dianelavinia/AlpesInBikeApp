import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { useMessages, getConversations, findBuddyForConversation, getOrCreateConversation } from "@/lib/messages";
import { BUDDIES } from "@/lib/buddies";

export default function ConversationThread() {
  const router = useRouter();
  const params = useLocalSearchParams<{ conversationId?: string; to?: string }>();
  const [conversationId, setConversationId] = useState<string>("");
  const [buddyId, setBuddyId] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (params.conversationId === "new" && params.to) {
        const conv = await getOrCreateConversation(params.to);
        setConversationId(conv.id);
        setBuddyId(params.to);
      } else if (params.conversationId) {
        const conv = getConversations().find((c) => c.id === params.conversationId);
        setConversationId(params.conversationId);
        setBuddyId(conv?.withBuddyId ?? "");
      }
    })();
  }, [params.conversationId, params.to]);

  const buddy = buddyId ? BUDDIES.find((b) => b.id === buddyId) : undefined;
  const { messages, send } = useMessages(conversationId, buddyId);
  const [input, setInput] = useState("");
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
  }, [messages.length]);

  if (!buddy) return null;

  function onSend() {
    send(input);
    setInput("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
          </Pressable>
          <Pressable onPress={() => router.push(`/buddy/${buddy.id}` as any)} style={styles.headerCenter}>
            <View style={[styles.avatarSmall, { backgroundColor: buddy.avatarColor }]}>
              <Text style={styles.avatarSmallText}>{buddy.avatarInitial}</Text>
            </View>
            <View>
              <Text style={styles.headerName}>{buddy.displayName}</Text>
              <Text style={styles.headerZone}>{buddy.zone}</Text>
            </View>
          </Pressable>
          <Pressable style={styles.headBtn}>
            <Ionicons name="information-circle-outline" size={22} color={Colors.text.primary} />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: 10 }}
          style={{ flex: 1 }}
        >
          <View style={styles.startBanner}>
            <Ionicons name="lock-closed" size={12} color={Colors.brand.forest} />
            <Text style={styles.startText}>Conversation chiffrée. Restez courtois et signalez tout comportement suspect.</Text>
          </View>

          {messages.map((m) => (
            <View key={m.id} style={[styles.bubbleRow, m.isMine ? styles.mineRow : styles.theirRow]}>
              {!m.isMine && (
                <View style={[styles.avatarBubble, { backgroundColor: buddy.avatarColor }]}>
                  <Text style={styles.avatarBubbleText}>{buddy.avatarInitial}</Text>
                </View>
              )}
              <View style={[styles.bubble, m.isMine ? styles.mine : styles.their]}>
                <Text style={[styles.bubbleText, m.isMine && { color: Colors.text.inverse }]}>{m.text}</Text>
                <Text style={[styles.bubbleTime, m.isMine && { color: "rgba(255,255,255,0.6)" }]}>{m.sentAt}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputBar}>
          <Pressable style={styles.attachBtn}>
            <Ionicons name="add-circle-outline" size={26} color={Colors.text.muted} />
          </Pressable>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Écrire un message"
            placeholderTextColor={Colors.text.muted}
            multiline
            style={styles.input}
          />
          <Pressable
            onPress={onSend}
            disabled={!input.trim()}
            style={[styles.sendBtn, !input.trim() && { opacity: 0.4 }]}
          >
            <Ionicons name="send" size={18} color={Colors.text.inverse} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatarSmallText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700", fontSize: 12 },
  headerName: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 15 },
  headerZone: { ...Type.bodyXs, color: Colors.text.muted },

  startBanner: { flexDirection: "row", gap: 6, alignItems: "center", padding: 10, borderRadius: Radius.sm, backgroundColor: "rgba(13,79,61,0.06)", borderWidth: 1, borderColor: "rgba(13,79,61,0.18)", marginBottom: Spacing.sm },
  startText: { flex: 1, ...Type.bodyXs, color: Colors.brand.forest, fontSize: 11.5, lineHeight: 15 },

  bubbleRow: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
  mineRow: { justifyContent: "flex-end" },
  theirRow: { justifyContent: "flex-start" },
  avatarBubble: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  avatarBubbleText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700", fontSize: 10 },
  bubble: { maxWidth: "75%", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 16 },
  mine: { backgroundColor: Colors.brand.orange, borderBottomRightRadius: 4 },
  their: { backgroundColor: Colors.bg.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border.subtle },
  bubbleText: { ...Type.bodySm, color: Colors.text.primary, fontSize: 14, lineHeight: 19 },
  bubbleTime: { ...Type.bodyXs, color: Colors.text.muted, fontSize: 10, marginTop: 3, textAlign: "right" },

  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: Spacing.md, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.border.subtle, backgroundColor: Colors.bg.card },
  attachBtn: { paddingBottom: 2 },
  input: { flex: 1, ...Type.body, color: Colors.text.primary, fontSize: 15, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: Colors.bg.elevated, borderRadius: 20, maxHeight: 120, outlineWidth: 0 as any },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.brand.orange, alignItems: "center", justifyContent: "center" },
});

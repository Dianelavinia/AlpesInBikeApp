import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";

type Message = { id: string; from: "ai" | "user"; text: string; suggestion?: { title: string; meta: string }[] };

const INITIAL: Message[] = [
  { id: "m-1", from: "ai", text: "Bonjour Marie. Je suis votre assistant Alpine Bike. Dites-moi votre programme et je trouve le parcours idéal." },
];

const QUICK_PROMPTS = [
  "Balade facile en famille",
  "Sortie sportive 2h",
  "Cols de l'après-midi",
  "Détente bord de lac",
];

export default function AIChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState("");

  function send(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { id: `u-${Date.now()}`, from: "user", text };
    const aiResponse = generateResponse(text);
    setMessages((prev) => [...prev, userMsg, aiResponse]);
    setInput("");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <View style={styles.headTitle}>
          <View style={styles.aiDot}>
            <View style={styles.aiDotInner} />
          </View>
          <Text style={styles.title}>Assistant Alpine</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.chatContainer}>
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </ScrollView>

      <View style={styles.promptsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: Spacing.lg }}>
          {QUICK_PROMPTS.map((p) => (
            <Pressable key={p} onPress={() => send(p)} style={styles.promptChip}>
              <Text style={styles.promptText}>{p}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Décrivez votre envie de balade..."
          placeholderTextColor={Colors.text.muted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => send(input)}
          returnKeyType="send"
        />
        <Pressable onPress={() => send(input)} style={styles.sendBtn}>
          <Ionicons name="arrow-up" size={20} color={Colors.text.inverse} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function MessageBubble({ message }: { message: Message }) {
  if (message.from === "user") {
    return (
      <View style={[styles.bubbleRow, { justifyContent: "flex-end" }]}>
        <LinearGradient colors={[Colors.brand.orange, Colors.brand.orangeDark]} style={styles.userBubble}>
          <Text style={styles.userText}>{message.text}</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.aiBlock}>
      <View style={styles.aiBubbleRow}>
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={14} color={Colors.brand.orange} />
        </View>
        <View style={styles.aiBubble}>
          <Text style={styles.aiText}>{message.text}</Text>
        </View>
      </View>
      {message.suggestion && (
        <View style={styles.suggestionList}>
          {message.suggestion.map((s, i) => (
            <Pressable key={i} style={styles.suggestion}>
              <View style={styles.suggIcon}>
                <Ionicons name="navigate-outline" size={18} color={Colors.brand.orange} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.suggTitle}>{s.title}</Text>
                <Text style={styles.suggMeta}>{s.meta}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.text.muted} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function generateResponse(prompt: string): Message {
  const lower = prompt.toLowerCase();
  if (lower.includes("famille") || lower.includes("facile") || lower.includes("enfant")) {
    return {
      id: `a-${Date.now()}`,
      from: "ai",
      text: "Voici 2 parcours adaptés à une sortie famille tranquille en demi-journée.",
      suggestion: [
        { title: "Voie verte Annecy", meta: "33 km · plat · 100% sécurisé" },
        { title: "Tour Lac du Bourget partiel", meta: "16 km · plat · plages baignade" },
      ],
    };
  }
  if (lower.includes("sport") || lower.includes("col") || lower.includes("dénivelé")) {
    return {
      id: `a-${Date.now()}`,
      from: "ai",
      text: "Pour une sortie sportive avec dénivelé, je vous recommande ces 2 grands classiques.",
      suggestion: [
        { title: "Mont Revard, le balcon des Alpes", meta: "38 km · +1240 m · 4h45" },
        { title: "Col du Granier chrono", meta: "32 km · +890 m · 2h25" },
      ],
    };
  }
  if (lower.includes("lac") || lower.includes("eau") || lower.includes("plage")) {
    return {
      id: `a-${Date.now()}`,
      from: "ai",
      text: "Trois itinéraires bord d'eau à votre disposition. Le Bourget est mon préféré au coucher de soleil.",
      suggestion: [
        { title: "Tour du Lac du Bourget complet", meta: "44 km · plat · 3h" },
        { title: "Voie verte Annecy bout du lac", meta: "33 km · plat · plages" },
      ],
    };
  }
  return {
    id: `a-${Date.now()}`,
    from: "ai",
    text: "Je vous propose 2 parcours qui correspondent à votre demande. Cliquez pour voir le détail et démarrer la navigation.",
    suggestion: [
      { title: "Boucle douce du Lac du Bourget", meta: "16 km · 1h30 · facile" },
      { title: "Voie verte Annecy", meta: "33 km · 2h · facile" },
    ],
  };
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headTitle: { flexDirection: "row", alignItems: "center", gap: 8 },
  aiDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(225,90,35,0.15)", alignItems: "center", justifyContent: "center" },
  aiDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.brand.orange },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18 },
  chatContainer: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xl },
  bubbleRow: { flexDirection: "row" },
  userBubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderBottomRightRadius: 4, maxWidth: "80%" },
  userText: { ...Type.body, color: Colors.text.inverse, fontSize: 15 },
  aiBlock: { gap: Spacing.sm },
  aiBubbleRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(225,90,35,0.12)", alignItems: "center", justifyContent: "center" },
  aiBubble: { flex: 1, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderBottomLeftRadius: 4, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle, maxWidth: "85%" },
  aiText: { ...Type.body, color: Colors.text.primary, fontSize: 15, lineHeight: 22 },
  suggestionList: { gap: 8, marginLeft: 36 },
  suggestion: { flexDirection: "row", alignItems: "center", gap: 10, padding: Spacing.sm, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle },
  suggIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(225,90,35,0.1)", alignItems: "center", justifyContent: "center" },
  suggTitle: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 13 },
  suggMeta: { ...Type.bodyXs, color: Colors.text.muted, marginTop: 2 },
  promptsRow: { paddingVertical: Spacing.sm },
  promptChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.pill, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle },
  promptText: { ...Type.bodyXs, color: Colors.text.primary, fontWeight: "600", fontSize: 12 },
  inputBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border.subtle },
  input: { flex: 1, backgroundColor: Colors.bg.elevated, borderRadius: Radius.pill, paddingHorizontal: 16, paddingVertical: 12, ...Type.body, fontSize: 15, color: Colors.text.primary },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.brand.orange, alignItems: "center", justifyContent: "center" },
});

import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Radius, Spacing, Type } from "@/constants/theme";
import { getConversations, findBuddyForConversation } from "@/lib/messages";
import EmptyState from "@/components/EmptyState";

export default function MessagesList() {
  const router = useRouter();
  const conversations = getConversations();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Messages</Text>
        <Pressable style={styles.headBtn}>
          <Ionicons name="search" size={22} color={Colors.text.primary} />
        </Pressable>
      </View>

      {conversations.length === 0 ? (
        <EmptyState
          icon="chatbubbles-outline"
          title="Pas encore de conversations"
          description="Les conversations apparaissent ici quand vous acceptez une invitation ou qu'un copain vous écrit."
          ctaLabel="Trouver des copains"
          onCta={() => router.push("/buddies" as any)}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <View style={styles.safetyBanner}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.brand.forest} />
            <Text style={styles.safetyText}>Messages chiffrés et accessibles uniquement aux deux participants</Text>
          </View>
          {conversations.map((c) => {
            const buddy = findBuddyForConversation(c);
            if (!buddy) return null;
            return (
              <Pressable
                key={c.id}
                onPress={() => router.push(`/messages/${c.id}` as any)}
                style={({ pressed }) => [styles.row, pressed && { backgroundColor: Colors.bg.elevated }]}
              >
                <View style={[styles.avatar, { backgroundColor: buddy.avatarColor }]}>
                  <Text style={styles.avatarText}>{buddy.avatarInitial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowTop}>
                    <Text style={styles.pseudo}>{buddy.displayName}</Text>
                    <Text style={styles.time}>{c.lastSentAt}</Text>
                  </View>
                  <View style={styles.rowBottom}>
                    <Text style={[styles.preview, c.unread > 0 && styles.previewUnread]} numberOfLines={1}>{c.lastMessage}</Text>
                    {c.unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{c.unread}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...Type.display3, color: Colors.text.primary, fontSize: 18 },

  safetyBanner: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: Spacing.lg, padding: 10, borderRadius: Radius.sm, backgroundColor: "rgba(13,79,61,0.06)", borderWidth: 1, borderColor: "rgba(13,79,61,0.2)", marginBottom: Spacing.sm },
  safetyText: { flex: 1, ...Type.bodyXs, color: Colors.brand.forest, fontSize: 11.5 },

  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle },
  avatar: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center" },
  avatarText: { ...Type.bodySm, color: Colors.text.inverse, fontWeight: "700", fontSize: 15 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  pseudo: { ...Type.bodySm, color: Colors.text.primary, fontWeight: "700", fontSize: 15 },
  time: { ...Type.bodyXs, color: Colors.text.muted },
  rowBottom: { flexDirection: "row", alignItems: "center", marginTop: 3, gap: 8 },
  preview: { flex: 1, ...Type.bodySm, color: Colors.text.muted, fontSize: 13 },
  previewUnread: { color: Colors.text.primary, fontWeight: "600" },
  unreadBadge: { minWidth: 20, paddingHorizontal: 6, height: 20, borderRadius: 10, backgroundColor: Colors.brand.orange, alignItems: "center", justifyContent: "center" },
  unreadText: { ...Type.bodyXs, color: Colors.text.inverse, fontWeight: "700", fontSize: 11 },
});

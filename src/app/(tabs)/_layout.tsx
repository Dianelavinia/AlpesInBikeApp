import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { t } from "@/lib/i18n";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.brand.orange,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarStyle: {
          backgroundColor: Colors.bg.card,
          borderTopColor: Colors.border.subtle,
          height: 64 + bottomPad,
          paddingTop: 10,
          paddingBottom: bottomPad,
        },
        tabBarItemStyle: { paddingVertical: 0, justifyContent: "center" },
        tabBarIconStyle: { marginBottom: 2 },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: "600", letterSpacing: 0, marginTop: 0, paddingBottom: 0, includeFontPadding: false },
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" options={{ title: t("tabs.home"), tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} /> }} />
      <Tabs.Screen name="bikes" options={{ title: t("tabs.bikes"), tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "bicycle" : "bicycle-outline"} size={24} color={color} /> }} />
      <Tabs.Screen name="community" options={{ title: "Rides", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "compass" : "compass-outline"} size={24} color={color} /> }} />
      <Tabs.Screen name="bookings" options={{ title: t("tabs.bookings"), tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "calendar" : "calendar-outline"} size={22} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: t("tabs.profile"), tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} /> }} />
    </Tabs>
  );
}

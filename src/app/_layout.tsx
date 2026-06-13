import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#FAF7F2" } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/welcome" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="booking/new" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="bike/[slug]" />
        <Stack.Screen name="ride/record" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="ride/[id]" />
        <Stack.Screen name="plan/index" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="plan/[id]" />
        <Stack.Screen name="family/index" />
        <Stack.Screen name="vae/index" />
        <Stack.Screen name="reports/index" />
        <Stack.Screen name="antitheft/index" />
        <Stack.Screen name="maintenance/index" />
        <Stack.Screen name="achievements/index" />
        <Stack.Screen name="tourism/index" />
        <Stack.Screen name="pro/index" />
        <Stack.Screen name="sos" options={{ presentation: "modal", animation: "fade" }} />
      </Stack>
    </SafeAreaProvider>
  );
}

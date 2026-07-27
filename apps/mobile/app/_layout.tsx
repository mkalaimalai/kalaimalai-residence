/**
 * Root navigation shell. Follows the system light/dark setting — the same "light is the
 * default, dark is a palette swap" model the web uses.
 */
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { palette } from "../lib/theme";

export default function RootLayout() {
  const scheme = useColorScheme();
  const colors = palette(scheme);

  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          headerTitleStyle: { fontWeight: "600" },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Projects" }} />
        <Stack.Screen name="project/[id]" options={{ title: "" }} />
        <Stack.Screen name="space/[id]" options={{ title: "" }} />
      </Stack>
    </>
  );
}

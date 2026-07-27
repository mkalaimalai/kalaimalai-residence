/**
 * Shared screen primitives: themed container, loading and error states.
 *
 * Every screen fetches from the API on mount, so all three states are real and worth
 * having in one place rather than re-implemented per screen.
 */
import { ActivityIndicator, StyleSheet, Text, View, useColorScheme } from "react-native";
import { palette, spacing } from "../lib/theme";

export function useColors() {
  return palette(useColorScheme());
}

export function Screen({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>{children}</View>
  );
}

export function Loading() {
  const colors = useColors();
  return (
    <View style={[styles.fill, styles.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

export function ErrorState({ message }: { message: string }) {
  const colors = useColors();
  return (
    <View style={[styles.fill, styles.center, { backgroundColor: colors.background }]}>
      <Text style={[styles.errorTitle, { color: colors.foreground }]}>
        Could not load
      </Text>
      <Text style={[styles.errorBody, { color: colors.muted }]}>{message}</Text>
      <Text style={[styles.errorBody, { color: colors.muted }]}>
        Check that the API is reachable — on a device, localhost is the phone, not your
        computer.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", padding: spacing.lg },
  errorTitle: { fontSize: 18, fontWeight: "600", marginBottom: spacing.sm },
  errorBody: { fontSize: 14, textAlign: "center", marginBottom: spacing.sm },
});

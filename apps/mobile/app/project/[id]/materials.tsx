/**
 * Material library for one project, grouped by category — the native counterpart of
 * `MaterialsLibrary` on the web (which is a filterable client component; this is a
 * simpler sectioned list).
 */
import { useEffect, useMemo, useState } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import type { Material } from "@kr/contracts";
import { api, imageUrl } from "../../../lib/api";
import { ErrorState, Loading, Screen, useColors } from "../../../components/Screen";
import { radius, spacing } from "../../../lib/theme";

export default function MaterialsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const [materials, setMaterials] = useState<Material[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.materials(id).then(setMaterials).catch((e: Error) => setError(e.message));
  }, [id]);

  // Group by category — stable order, so the list does not reshuffle between renders.
  const sections = useMemo(() => {
    if (!materials) return [];
    const groups = new Map<string, Material[]>();
    for (const material of materials) {
      const key = material.category || "Other";
      groups.set(key, [...(groups.get(key) ?? []), material]);
    }
    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => ({ title, data }));
  }, [materials]);

  if (error) return <ErrorState message={error} />;
  if (!materials) return <Loading />;

  return (
    <Screen>
      <Stack.Screen options={{ title: "Materials" }} />
      <SectionList
        sections={sections}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionHeader, { color: colors.accent }]}>
            {section.title.toUpperCase()}
          </Text>
        )}
        renderItem={({ item }) => (
          <View
            style={[
              styles.row,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Image
              source={{ uri: imageUrl(item.image) }}
              style={[styles.thumb, { backgroundColor: colors.surface }]}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.body}>
              <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
              {!!item.notes && (
                <Text numberOfLines={2} style={[styles.notes, { color: colors.muted }]}>
                  {item.notes}
                </Text>
              )}
              <Text style={[styles.status, { color: colors.muted }]}>{item.status}</Text>
            </View>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "600",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  thumb: { width: 72, height: 72 },
  body: { flex: 1, padding: spacing.sm + 2, gap: 2 },
  name: { fontSize: 15, fontWeight: "600" },
  notes: { fontSize: 13 },
  status: { fontSize: 12 },
});

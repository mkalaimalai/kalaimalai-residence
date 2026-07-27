/**
 * Project detail — concept statement plus the room list.
 *
 * Every collection fetch passes `projectId`. Omitting it returns EVERY project's rows
 * (constitution §5), which on a portfolio-wide app would silently mix two houses
 * together.
 */
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import type { PublicProject } from "@kr/api-client";
import type { Space } from "@kr/contracts";
import { api, imageUrl } from "../../lib/api";
import { ErrorState, Loading, Screen, useColors } from "../../components/Screen";
import { radius, spacing } from "../../lib/theme";

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const [project, setProject] = useState<PublicProject | null>(null);
  const [spaces, setSpaces] = useState<Space[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([api.publicProjects(), api.spaces(id)])
      .then(([projects, rooms]) => {
        setProject(projects.find((p) => p.id === id) ?? null);
        setSpaces(rooms);
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!spaces || !project) return <Loading />;

  return (
    <Screen>
      <Stack.Screen options={{ title: project.publicTitle }} />
      <FlatList
        data={spaces}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
        ListHeaderComponent={
          <View style={{ gap: spacing.sm, marginBottom: spacing.sm }}>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {project.publicSubtitle}
            </Text>
            <Text style={[styles.concept, { color: colors.foreground }]}>
              {project.conceptStatement}
            </Text>
            <Text style={[styles.sectionLabel, { color: colors.accent }]}>
              {spaces.length} SPACES
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Link href={{ pathname: "/space/[id]", params: { id: item.id } }} asChild>
            <Pressable
              style={[
                styles.row,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Image
                source={{ uri: imageUrl(item.image) }}
                style={styles.thumb}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.rowBody}>
                <Text style={[styles.rowTitle, { color: colors.foreground }]}>
                  {item.name}
                </Text>
                <Text style={[styles.meta, { color: colors.muted }]}>{item.status}</Text>
              </View>
            </Pressable>
          </Link>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 15 },
  concept: { fontSize: 16, lineHeight: 24 },
  sectionLabel: { fontSize: 12, letterSpacing: 1, fontWeight: "600" },
  row: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  thumb: { width: 96, height: 96 },
  rowBody: { flex: 1, padding: spacing.md, gap: spacing.xs },
  rowTitle: { fontSize: 16, fontWeight: "600" },
  meta: { fontSize: 13 },
});

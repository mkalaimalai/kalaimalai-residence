/**
 * Portfolio index — every project in the archive. Mirrors the web's `/` route.
 *
 * Uses `/projects/public`, which omits the portal-only identity fields (villa number,
 * address) per constitution §6. The mobile app is a public viewer; it must never fetch
 * `/projects`.
 */
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import type { PublicProject } from "@kr/api-client";
import { api, imageUrl } from "../lib/api";
import { ErrorState, Loading, Screen, useColors } from "../components/Screen";
import { radius, spacing } from "../lib/theme";

export default function ProjectsScreen() {
  const colors = useColors();
  const [projects, setProjects] = useState<PublicProject[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.publicProjects().then(setProjects).catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!projects) return <Loading />;

  return (
    <Screen>
      <FlatList
        data={projects}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
        renderItem={({ item }) => (
          <Link href={{ pathname: "/project/[id]", params: { id: item.id } }} asChild>
            <Pressable
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Image
                source={{ uri: imageUrl(item.heroImage) }}
                style={styles.hero}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.body}>
                <Text style={[styles.title, { color: colors.foreground }]}>
                  {item.publicTitle}
                </Text>
                <Text style={[styles.meta, { color: colors.muted }]}>
                  {item.city} · {item.status}
                </Text>
                <Text numberOfLines={2} style={[styles.meta, { color: colors.muted }]}>
                  {item.publicSubtitle}
                </Text>
              </View>
            </Pressable>
          </Link>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radius.lg, overflow: "hidden" },
  hero: { width: "100%", aspectRatio: 4 / 3 },
  body: { padding: spacing.md, gap: spacing.xs },
  title: { fontSize: 20, fontWeight: "600" },
  meta: { fontSize: 14 },
});

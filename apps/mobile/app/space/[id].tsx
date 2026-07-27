/**
 * Space detail — the room, its design intent, and its resolved relations.
 *
 * Relations are stored as `*Ids` arrays and resolved client-side against the project's
 * already-fetched collections, exactly like `lib/relations.ts` does on the web. The
 * resolvers stay pure and synchronous; only the fetch is async.
 */
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import type { Domain, Material, Space, Vendor } from "@kr/contracts";
import { api, imageUrl } from "../../lib/api";
import { ErrorState, Loading, Screen, useColors } from "../../components/Screen";
import { radius, spacing } from "../../lib/theme";

interface Loaded {
  space: Space;
  domains: Domain[];
  materials: Material[];
  vendors: Vendor[];
}

export default function SpaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const space = await api.spaceById(id);
        // Scope every follow-up fetch to the space's own project.
        const [domains, materials, vendors] = await Promise.all([
          api.domains(space.projectId),
          api.materials(space.projectId),
          api.vendors(space.projectId),
        ]);
        const byIds = <T extends { id: string }>(all: T[], ids: string[]) =>
          ids.map((wanted) => all.find((row) => row.id === wanted)).filter(Boolean) as T[];
        setData({
          space,
          domains: byIds(domains, space.domainIds),
          materials: byIds(materials, space.materialIds),
          vendors: byIds(vendors, space.vendorIds),
        });
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!data) return <Loading />;

  const { space, domains, materials, vendors } = data;

  return (
    <Screen>
      <Stack.Screen options={{ title: space.name }} />
      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.lg }}>
        <Image
          source={{ uri: imageUrl(space.image) }}
          style={styles.hero}
          contentFit="cover"
          transition={200}
        />

        <View style={{ gap: spacing.sm }}>
          <Text style={[styles.heading, { color: colors.foreground }]}>{space.name}</Text>
          <Text style={[styles.body, { color: colors.muted }]}>{space.description}</Text>
        </View>

        <Section title="Design intent">
          <Text style={[styles.body, { color: colors.muted }]}>{space.designIntent}</Text>
        </Section>

        {domains.length > 0 && (
          <Section title="Domains">
            <Chips labels={domains.map((d) => d.name)} />
          </Section>
        )}
        {materials.length > 0 && (
          <Section title="Materials">
            <Chips labels={materials.map((m) => m.name)} />
          </Section>
        )}
        {vendors.length > 0 && (
          <Section title="Vendors">
            <Chips labels={vendors.map((v) => v.name)} />
          </Section>
        )}
        {space.furniture.length > 0 && (
          <Section title="Furniture">
            <Chips labels={space.furniture} />
          </Section>
        )}
        {space.lighting.length > 0 && (
          <Section title="Lighting">
            <Chips labels={space.lighting} />
          </Section>
        )}
      </ScrollView>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={[styles.sectionLabel, { color: colors.accent }]}>
        {title.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

function Chips({ labels }: { labels: string[] }) {
  const colors = useColors();
  return (
    <View style={styles.chips}>
      {labels.map((label) => (
        <View
          key={label}
          style={[
            styles.chip,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.chipText, { color: colors.foreground }]}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: "100%", aspectRatio: 4 / 3, borderRadius: radius.lg },
  heading: { fontSize: 24, fontWeight: "600" },
  body: { fontSize: 15, lineHeight: 23 },
  sectionLabel: { fontSize: 12, letterSpacing: 1, fontWeight: "600" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
  },
  chipText: { fontSize: 13 },
});

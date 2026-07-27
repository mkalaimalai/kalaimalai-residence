/**
 * Project gallery — the public image grid, two columns.
 *
 * `GalleryItem.image` is a root-relative path like every other image field, so it goes
 * through `imageUrl()` before it can be rendered natively.
 */
import { useEffect, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import type { GalleryItem } from "@kr/contracts";
import { api, imageUrl } from "../../../lib/api";
import { ErrorState, Loading, Screen, useColors } from "../../../components/Screen";
import { radius, spacing } from "../../../lib/theme";

const COLUMNS = 2;
const GUTTER = spacing.md;
const TILE =
  (Dimensions.get("window").width - GUTTER * (COLUMNS + 1)) / COLUMNS;

export default function GalleryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const [items, setItems] = useState<GalleryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.gallery(id).then(setItems).catch((e: Error) => setError(e.message));
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!items) return <Loading />;

  return (
    <Screen>
      <Stack.Screen options={{ title: "Gallery" }} />
      <FlatList
        data={items}
        keyExtractor={(g) => g.id}
        numColumns={COLUMNS}
        columnWrapperStyle={{ gap: GUTTER }}
        contentContainerStyle={{ padding: GUTTER, gap: GUTTER }}
        renderItem={({ item }) => (
          <View style={{ width: TILE, gap: spacing.xs }}>
            <Image
              source={{ uri: imageUrl(item.image) }}
              style={[styles.tile, { backgroundColor: colors.surface }]}
              contentFit="cover"
              transition={200}
            />
            <Text numberOfLines={2} style={[styles.caption, { color: colors.muted }]}>
              {item.caption}
            </Text>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tile: { width: "100%", aspectRatio: 1, borderRadius: radius.md },
  caption: { fontSize: 12 },
});

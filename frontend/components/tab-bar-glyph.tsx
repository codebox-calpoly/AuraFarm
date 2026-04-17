import { tailwindColors } from "@/constants/tailwind-colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

const BASE_WIDTH = 414;

/** Ionicon name pairs: [active, inactive] — same visual language as the rest of the app (green / gray). */
const GLYPHS = {
  home: ["home", "home-outline"] as const,
  ranks: ["trophy", "trophy-outline"] as const,
  aura: ["flash", "flash-outline"] as const,
  friends: ["people", "people-outline"] as const,
  settings: ["settings", "settings-outline"] as const,
} as const;

export type TabGlyphId = keyof typeof GLYPHS;

type Props = {
  tab: TabGlyphId;
  focused: boolean;
  /** Window width from `useWindowDimensions()` — keeps icon size sane on small/large phones. */
  windowWidth: number;
  accessibilityLabel: string;
};

/**
 * Vector tab icons (no raster navbar assets). Active = filled glyph in aura-green,
 * inactive = outline glyph in gray.
 */
export function TabBarGlyph({ tab, focused, windowWidth, accessibilityLabel }: Props) {
  const scale = windowWidth > 0 ? windowWidth / BASE_WIDTH : 1;
  const [activeName, inactiveName] = GLYPHS[tab];
  const name = focused ? activeName : inactiveName;
  const size = Math.min(26, 26 * scale);
  const color = focused
    ? tailwindColors["aura-green"]
    : tailwindColors["aura-gray-400"];

  return (
    <View
      style={styles.wrap}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      accessible
    >
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 28,
    minHeight: 28,
  },
});

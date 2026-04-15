/**
 * Production UI tokens — spacing, radii, shadows, and semantic surfaces.
 * Use with StyleSheet and tailwindColors for consistent polish across screens.
 */

import { Platform, type ViewStyle } from "react-native";

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  full: 9999,
} as const;

/** Soft elevation for cards (iOS + Android) */
export function cardShadow(elevation = 2): ViewStyle {
  return Platform.select({
    ios: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
    },
    default: {
      elevation,
      shadowColor: "#000",
    },
  }) as ViewStyle;
}

export const layout = {
  screenPaddingX: 20,
  maxContentWidth: 560,
} as const;

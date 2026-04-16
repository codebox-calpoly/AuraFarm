import { StyleSheet, View, Text } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { tailwindColors, tailwindFonts } from "@/constants/tailwind-colors";
import { spacing } from "@/constants/design";

export function Header() {
  return (
    <View style={styles.wrap}>
      <ThemedView style={styles.container} lightColor="transparent">
        <Text style={styles.wordmark} accessibilityRole="header">
          Aura Farm
        </Text>
      </ThemedView>
      <View style={styles.hairline} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
  },
  container: {
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: "transparent",
  },
  wordmark: {
    fontFamily: tailwindFonts.bold,
    fontSize: 22,
    letterSpacing: 0.3,
    color: tailwindColors["aura-red"],
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: tailwindColors["aura-border"],
    marginHorizontal: spacing.lg,
    opacity: 0.9,
  },
});

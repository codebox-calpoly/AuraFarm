import { StyleSheet, View, Image } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { tailwindColors } from "@/constants/tailwind-colors";
import { spacing } from "@/constants/design";

export function Header() {
  return (
    <View style={styles.wrap}>
      <ThemedView style={styles.container} lightColor="transparent">
        <Image
          source={require("@/assets/images/aura-farm-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
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
  logo: {
    width: 168,
    height: 34,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: tailwindColors["aura-border"],
    marginHorizontal: spacing.lg,
    opacity: 0.9,
  },
});

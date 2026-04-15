import { StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/themed-view";
import AuraFarmHeader from "@/assets/AuraFarmHeader.svg";
import { tailwindColors } from "@/constants/tailwind-colors";
import { spacing } from "@/constants/design";

export function Header() {
  return (
    <View style={styles.wrap}>
      <ThemedView style={styles.container} lightColor="transparent">
        <AuraFarmHeader width={168} height={30} />
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
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: tailwindColors["aura-border"],
    marginHorizontal: spacing.lg,
    opacity: 0.9,
  },
});

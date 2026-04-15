import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { tailwindColors } from "@/constants/tailwind-colors";
import {
  getNextAuraThreshold,
  getTierAtThreshold,
  getTierForPoints,
} from "@/constants/auraTiers";
import { radius, spacing } from "@/constants/design";

interface AuraProgressBarProps {
  /** Total aura points (same tiers as Aura tab). */
  points: number;
}

export function AuraProgressBar({ points }: AuraProgressBarProps) {
  const currentTier = getTierForPoints(points);
  const nextThreshold = getNextAuraThreshold(points);
  const isMaxed = nextThreshold === null;

  const target = nextThreshold ?? 500;
  const nextTierColor = isMaxed
    ? currentTier.color
    : getTierAtThreshold(nextThreshold).color;

  const percentage = isMaxed
    ? 100
    : Math.min((points / target) * 100, 100);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.barContainer}>
        <Ionicons name="diamond" size={22} color={currentTier.color} />

        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${percentage}%`,
                backgroundColor: currentTier.color,
              },
            ]}
          />
        </View>

        <Ionicons name="diamond" size={22} color={nextTierColor} />
      </View>

      <ThemedText style={styles.pointsText}>
        {isMaxed
          ? `${points} Aura · ${currentTier.label.charAt(0).toUpperCase()}${currentTier.label.slice(1)} tier`
          : `${points} / ${target} Aura`}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: "transparent",
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  track: {
    flex: 1,
    height: 14,
    backgroundColor: tailwindColors["aura-gray-200"],
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.full,
  },
  pointsText: {
    textAlign: "right",
    marginTop: 6,
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: tailwindColors["aura-gray-600"],
    letterSpacing: 0.2,
  },
});

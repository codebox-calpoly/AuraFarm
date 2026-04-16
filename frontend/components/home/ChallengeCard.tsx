import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { tailwindColors } from "@/constants/tailwind-colors";
import { cardShadow, radius, spacing } from "@/constants/design";

export interface ChallengeCardProps {
  type: "incoming" | "completed";
  title: string;
  points: number;
  timeLeft?: string;
  dateCompleted?: string;
  onPress?: () => void;
}

export function ChallengeCard({
  type,
  title,
  points,
  timeLeft,
  dateCompleted,
  onPress,
}: ChallengeCardProps) {
  if (type === "incoming") {
    return (
      <View style={styles.incomingWrap}>
        <ThemedView style={[styles.incomingContent, cardShadow(2)]}>
          <View style={styles.accentBar} />
          <View style={styles.incomingInner}>
            <View style={styles.timerRow}>
              <Ionicons
                name="time-outline"
                size={16}
                color={tailwindColors["aura-red"]}
              />
              <ThemedText style={styles.timerText}>{timeLeft}</ThemedText>
            </View>

            <ThemedText type="subtitle" style={styles.incomingTitle}>
              {title}
            </ThemedText>

            <View style={styles.incomingFooter}>
              <View style={styles.pointsBadge}>
                <ThemedText style={styles.pointsBadgeText}>+{points} pts</ThemedText>
              </View>

              <TouchableOpacity style={styles.viewButton} onPress={onPress} activeOpacity={0.88}>
                <ThemedText style={styles.viewButtonText}>View</ThemedText>
                <Ionicons name="arrow-forward" size={18} color={tailwindColors["aura-white"]} />
              </TouchableOpacity>
            </View>
          </View>
        </ThemedView>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.completedContainer, cardShadow(1)]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.completedContent}>
        <ThemedText style={styles.dateText}>{dateCompleted}</ThemedText>
        <ThemedText type="subtitle" style={styles.completedTitle}>
          {title}
        </ThemedText>
        <ThemedText style={styles.completedPoints}>
          +{points} pts when approved
        </ThemedText>
      </View>
      <View style={styles.chevronCircle}>
        <Ionicons name="chevron-forward" size={20} color={tailwindColors["aura-gray-500"]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  incomingWrap: {
    marginBottom: spacing.lg,
  },
  incomingContent: {
    flexDirection: "row",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: tailwindColors["aura-border"],
    backgroundColor: tailwindColors["aura-surface"],
    overflow: "hidden",
  },
  accentBar: {
    width: 4,
    backgroundColor: tailwindColors["aura-red"],
  },
  incomingInner: {
    flex: 1,
    padding: spacing.md,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.sm,
  },
  timerText: {
    color: tailwindColors["aura-gray-600"],
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  incomingTitle: {
    fontSize: 20,
    marginBottom: spacing.md,
    color: tailwindColors["aura-black"],
    lineHeight: 26,
  },
  incomingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  pointsBadge: {
    backgroundColor: tailwindColors["aura-green-light"],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  pointsBadgeText: {
    color: tailwindColors["aura-green"],
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: tailwindColors["aura-red"],
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  viewButtonText: {
    color: tailwindColors["aura-white"],
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
  },

  completedContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: tailwindColors["aura-surface"],
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: tailwindColors["aura-border"],
  },
  completedContent: {
    flex: 1,
  },
  dateText: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: tailwindColors["aura-gray-400"],
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  completedTitle: {
    fontSize: 17,
    marginBottom: 4,
    color: tailwindColors["aura-black"],
  },
  completedPoints: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: tailwindColors["aura-green"],
  },
  chevronCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tailwindColors["aura-gray-100"],
    alignItems: "center",
    justifyContent: "center",
  },
});

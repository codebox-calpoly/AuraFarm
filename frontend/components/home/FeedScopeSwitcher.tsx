import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { tailwindColors } from "@/constants/tailwind-colors";
import { radius, spacing } from "@/constants/design";

export type FeedScope = "global" | "friends";

interface FeedScopeSwitcherProps {
  scope: FeedScope;
  onScopeChange: (scope: FeedScope) => void;
}

export function FeedScopeSwitcher({
  scope,
  onScopeChange,
}: FeedScopeSwitcherProps) {
  return (
    <View style={styles.outer}>
      <View style={styles.track}>
        <TouchableOpacity
          style={[styles.segment, scope === "global" && styles.segmentActive]}
          onPress={() => onScopeChange("global")}
          activeOpacity={0.88}
        >
          <ThemedText
            style={[styles.tabText, scope === "global" && styles.activeTabText]}
          >
            Global
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, scope === "friends" && styles.segmentActive]}
          onPress={() => onScopeChange("friends")}
          activeOpacity={0.88}
        >
          <ThemedText
            style={[
              styles.tabText,
              scope === "friends" && styles.activeTabText,
            ]}
          >
            Friends
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginBottom: spacing.md,
  },
  track: {
    flexDirection: "row",
    backgroundColor: tailwindColors["aura-gray-100"],
    borderRadius: radius.lg,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: tailwindColors["aura-border"],
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  segmentActive: {
    backgroundColor: tailwindColors["aura-surface"],
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: tailwindColors["aura-gray-500"],
    letterSpacing: 0.12,
  },
  activeTabText: {
    fontFamily: "Poppins_700Bold",
    color: tailwindColors["aura-black"],
  },
});

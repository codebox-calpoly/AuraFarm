import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { tailwindColors } from "@/constants/tailwind-colors";
import { radius, spacing } from "@/constants/design";

interface TabSwitcherProps {
  activeTab: "my-challenges" | "feed";
  onTabChange: (tab: "my-challenges" | "feed") => void;
}

export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <View style={styles.outer}>
      <View style={styles.track}>
        <TouchableOpacity
          style={[
            styles.segment,
            activeTab === "my-challenges" && styles.segmentActive,
          ]}
          onPress={() => onTabChange("my-challenges")}
          activeOpacity={0.88}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "my-challenges" && styles.activeTabText,
            ]}
          >
            My Challenges
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, activeTab === "feed" && styles.segmentActive]}
          onPress={() => onTabChange("feed")}
          activeOpacity={0.88}
        >
          <ThemedText
            style={[styles.tabText, activeTab === "feed" && styles.activeTabText]}
          >
            Feed
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginBottom: spacing.lg,
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
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  segmentActive: {
    backgroundColor: tailwindColors["aura-surface"],
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: tailwindColors["aura-gray-500"],
    letterSpacing: 0.15,
  },
  activeTabText: {
    fontFamily: "Poppins_700Bold",
    color: tailwindColors["aura-black"],
  },
});

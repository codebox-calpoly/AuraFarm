import ProfileImage from "@/assets/ProfileImage.svg";
import { Header } from "@/components/home/Header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { tailwindColors, tailwindFonts } from "@/constants/tailwind-colors";
import { cardShadow, layout, radius, spacing } from "@/constants/design";
import { getLeaderboardFromApi, type LeaderboardEntry } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type LeaderboardSection = {
  id: string;
  label: string;
  color: string;
};

/** Global ranking — all users by total aura (not a tier). */
const ALL_SECTION: LeaderboardSection = {
  id: "all",
  label: "All",
  color: tailwindColors["aura-black"],
};

/** Same point bands as the Aura screen; left → right = lowest tier → highest. */
const TIER_SECTIONS: LeaderboardSection[] = [
  { id: "gray", label: "Gray Aura", color: "#4A4A4A" },
  { id: "purple", label: "Purple Aura", color: "#981CFC" },
  { id: "blue", label: "Blue Aura", color: "#2E2EFA" },
  { id: "green", label: "Green Aura", color: "#4CBF50" },
  { id: "yellow", label: "Yellow Aura", color: "#FFD609" },
  { id: "orange", label: "Orange Aura", color: "#F38E08" },
  { id: "red", label: "Red Aura", color: "#CC0A19" },
];

/** Tabs: All first, then each tier. */
const LEADERBOARD_TABS: LeaderboardSection[] = [ALL_SECTION, ...TIER_SECTIONS];

/** Point range label for each tier (matches Aura tab bands). */
const TIER_RANGE_LABEL: Record<(typeof TIER_SECTIONS)[number]["id"], string> = {
  gray: "0",
  purple: "1–24",
  blue: "25–74",
  green: "75–149",
  yellow: "150–299",
  orange: "300–499",
  red: "500+",
};

/** Which tier a point total belongs to (must match Aura tier bands). */
function sectionIdForAuraPoints(points: number): (typeof TIER_SECTIONS)[number]["id"] {
  if (points >= 500) return "red";
  if (points >= 300) return "orange";
  if (points >= 150) return "yellow";
  if (points >= 75) return "green";
  if (points >= 25) return "blue";
  if (points >= 1) return "purple";
  return "gray";
}

function hexToRgba(hex: string, alpha: number) {
  const cleaned = hex.replace("#", "");
  const value = parseInt(cleaned, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function RanksScreen() {
  const [activeSectionId, setActiveSectionId] = useState(ALL_SECTION.id);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const activeSection =
    LEADERBOARD_TABS.find((section) => section.id === activeSectionId) ?? ALL_SECTION;

  useEffect(() => {
    setFetchError(null);
    getLeaderboardFromApi(500)
      .then((res) => {
        if (res.success) {
          setLeaderboard(res.data);
        } else {
          setLeaderboard([]);
          setFetchError(res.error ?? "Could not load leaderboard");
        }
      })
      .catch(() => {
        setLeaderboard([]);
        setFetchError("Network error. Check your connection and API URL.");
      })
      .finally(() => setLoadingLeaderboard(false));
  }, []);

  const filteredLeaderboard =
    activeSectionId === "all" ?
      leaderboard
    : leaderboard.filter(
        (entry) => sectionIdForAuraPoints(entry.auraPoints) === activeSectionId,
      );

  const leaderboardData = filteredLeaderboard.map((entry, index) => ({
    userId: entry.userId,
    name: entry.userName,
    points: entry.auraPoints,
    /** Global rank from API when viewing All; 1-based position within tier otherwise. */
    displayRank: activeSectionId === "all" ? entry.rank : index + 1,
  }));

  const emptyCopy =
    fetchError ? fetchError
    : leaderboard.length === 0 ?
      "No one on the leaderboard yet. Complete challenges to appear here."
    : "No players in this tier yet. Try “All” or another tier above.";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header />

      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tier picker */}
        <ThemedView
          style={[styles.tierPickerCard, cardShadow(3)]}
          lightColor={tailwindColors["aura-surface"]}
        >
          <ThemedText style={styles.tierPickerLabel}>Leaderboard view</ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tierScrollInner}
          >
            {LEADERBOARD_TABS.map((section) => {
              const isActive = section.id === activeSectionId;
              const isAll = section.id === "all";
              return (
                <Pressable
                  key={section.id}
                  onPress={() => setActiveSectionId(section.id)}
                  style={({ pressed }) => [
                    styles.tierChip,
                    {
                      borderColor: isActive ? section.color : tailwindColors["aura-border"],
                      backgroundColor:
                        isActive ? hexToRgba(section.color, 0.12) : tailwindColors["aura-surface-muted"],
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    },
                  ]}
                >
                  {isAll ?
                    <Ionicons name="globe-outline" size={22} color={section.color} />
                  : <Ionicons name="diamond" size={22} color={section.color} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </ThemedView>

        {/* Leaderboard card */}
        <ThemedView
          style={[styles.leaderboardCard, cardShadow(4)]}
          lightColor={tailwindColors["aura-surface"]}
        >
          <View style={styles.leaderboardHeader}>
            <View style={styles.leaderboardTitleRow}>
              <View style={styles.trophyCircle}>
                <Ionicons
                  name="trophy"
                  size={20}
                  color={activeSection.color}
                />
              </View>
              <View style={styles.leaderboardTitleText}>
                <ThemedText style={styles.leaderboardTitle}>Leaderboard</ThemedText>
                <ThemedText style={styles.leaderboardSubtitle}>
                  {activeSection.id === "all" ?
                    "Everyone ranked by total aura points"
                  : `${activeSection.label.replace(" Aura", "")} · ${TIER_RANGE_LABEL[activeSection.id as keyof typeof TIER_RANGE_LABEL]} aura pts`}
                </ThemedText>
              </View>
            </View>
          </View>

          <View
            style={[styles.leaderboardAccent, { backgroundColor: activeSection.color }]}
          />

          {loadingLeaderboard ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={activeSection.color} />
              <ThemedText style={styles.loadingHint}>Loading ranks…</ThemedText>
            </View>
          ) : leaderboardData.length === 0 ? (
            <View style={styles.emptyBox}>
              <View
                style={[
                  styles.emptyIconWrap,
                  {
                    backgroundColor: fetchError ?
                      hexToRgba(tailwindColors["aura-red"], 0.12)
                    : hexToRgba(activeSection.color, 0.12),
                  },
                ]}
              >
                <Ionicons
                  name={fetchError ? "alert-circle-outline" : "people-outline"}
                  size={36}
                  color={fetchError ? tailwindColors["aura-red"] : activeSection.color}
                />
              </View>
              <ThemedText style={styles.emptyTitle}>
                {fetchError ? "Couldn’t load leaderboard" : "No entries yet"}
              </ThemedText>
              <ThemedText style={[styles.emptyBody, fetchError && styles.emptyBodyError]}>
                {emptyCopy}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.rowsWrap}>
              {leaderboardData.map((entry, index) => (
                <View
                  key={entry.userId}
                  style={[
                    styles.row,
                    index < leaderboardData.length - 1 ? styles.rowBorder : null,
                  ]}
                >
                  <View
                    style={[
                      styles.rankBadge,
                      {
                        borderColor: hexToRgba(activeSection.color, 0.45),
                        backgroundColor: hexToRgba(activeSection.color, 0.1),
                      },
                    ]}
                  >
                    <Text style={[styles.rankNum, { color: activeSection.color }]}>
                      {entry.displayRank}
                    </Text>
                  </View>
                  <View style={styles.nameWrap}>
                    <ProfileImage width={36} height={36} />
                    <Text style={styles.name} numberOfLines={1}>
                      {entry.name}
                    </Text>
                  </View>
                  <View style={styles.pointsPill}>
                    <Text style={styles.points}>{entry.points}</Text>
                    <Text style={styles.pointsSuffix}>pts</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tailwindColors["aura-page"],
  },
  pageScroll: {
    flex: 1,
  },
  pageScrollContent: {
    paddingHorizontal: layout.screenPaddingX,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  tierPickerCard: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tailwindColors["aura-border"],
  },
  tierPickerLabel: {
    fontFamily: tailwindFonts["semibold"],
    fontSize: 13,
    color: tailwindColors["aura-gray-600"],
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  tierScrollInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
  },
  tierChip: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  leaderboardCard: {
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tailwindColors["aura-border"],
  },
  leaderboardHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  leaderboardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  trophyCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: tailwindColors["aura-gray-100"],
    alignItems: "center",
    justifyContent: "center",
  },
  leaderboardTitleText: {
    flex: 1,
    minWidth: 0,
  },
  leaderboardTitle: {
    fontFamily: tailwindFonts["bold"],
    fontSize: 22,
    color: tailwindColors["aura-black"],
    letterSpacing: -0.3,
  },
  leaderboardSubtitle: {
    fontFamily: tailwindFonts["regular"],
    fontSize: 14,
    color: tailwindColors["aura-gray-500"],
    marginTop: 2,
  },
  leaderboardAccent: {
    height: 3,
    width: "100%",
    opacity: 0.85,
  },
  loadingBox: {
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  loadingHint: {
    fontFamily: tailwindFonts["regular"],
    fontSize: 14,
    color: tailwindColors["aura-gray-500"],
  },
  emptyBox: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontFamily: tailwindFonts["semibold"],
    fontSize: 18,
    color: tailwindColors["aura-gray-700"],
    marginBottom: spacing.xs,
  },
  emptyBody: {
    fontFamily: tailwindFonts["regular"],
    fontSize: 15,
    lineHeight: 22,
    color: tailwindColors["aura-gray-500"],
    textAlign: "center",
    maxWidth: 300,
  },
  emptyBodyError: {
    color: tailwindColors["aura-gray-700"],
  },
  rowsWrap: {
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: tailwindColors["aura-border"],
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNum: {
    fontFamily: tailwindFonts["bold"],
    fontSize: 14,
  },
  nameWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minWidth: 0,
  },
  name: {
    flex: 1,
    fontFamily: tailwindFonts["semibold"],
    fontSize: 16,
    color: tailwindColors["aura-black"],
  },
  pointsPill: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
    backgroundColor: tailwindColors["aura-gray-100"],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  points: {
    fontFamily: tailwindFonts["bold"],
    fontSize: 16,
    color: tailwindColors["aura-gray-700"],
  },
  pointsSuffix: {
    fontFamily: tailwindFonts["regular"],
    fontSize: 12,
    color: tailwindColors["aura-gray-500"],
  },
});

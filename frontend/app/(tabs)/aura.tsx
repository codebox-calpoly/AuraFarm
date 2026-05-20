import { AuraDiamondIcon } from "@/components/AuraDiamondIcon";
import { StyleSheet, View, Pressable, Alert, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRef, useEffect, useState } from "react";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { Header } from "@/components/home/Header";
import { tailwindColors, tailwindFonts } from "@/constants/tailwind-colors";
import { ThemedText } from "@/components/themed-text";
import { getValidSession } from "@/lib/auth";
import {
  getLeaderboardFromApi,
  getUserProfileFromApi,
  LeaderboardEntry,
} from "@/lib/api";
import { getTierForPoints } from "@/constants/auraTiers";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { radius, spacing, cardShadow, hexToRgba } from "@/constants/design";

export default function AuraScreen() {
  const auraRef = useRef<ViewShot>(null);
  const [auraPoints, setAuraPoints] = useState<number | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [percentile, setPercentile] = useState<number | null>(null);

  useEffect(() => {
    // Use cached session data first so the screen renders instantly
    getValidSession().then((session) => {
      if (session?.user?.auraPoints != null) {
        setAuraPoints(session.user.auraPoints);
      }
    });
    // Then refresh from API in the background
    getUserProfileFromApi().then((res) => {
      if (res.success) {
        setAuraPoints(res.data.auraPoints);
        //setRank(res.data.rank ?? null);
      }
    });
  }, []);

  const tier = getTierForPoints(auraPoints ?? 0);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

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

  useEffect(() => {
    setRank(
      leaderboard.filter((user) => user.auraPoints > (auraPoints || 0)).length +
        1,
    );
    setPercentile(
      Math.round(
        (leaderboard.filter((user) => user.auraPoints < (auraPoints || 0))
          .length /
          leaderboard.length) *
          100,
      ),
    );
  }, [leaderboard]);

  const handleShare = async () => {
    try {
      if (!auraRef.current) return;

      await new Promise((res) => setTimeout(res, 100));

      const uri = await auraRef.current.capture?.();
      if (!uri) throw new Error("Failed to capture Aura view");

      try {
        await Share.share(
          {
            title: "My Aura",
            message: "Check out my Aura 🔥🔥",
            url: uri,
          },
          {
            dialogTitle: "Share your farmed Aura",
          },
        );
        return;
      } catch {
        // Fall through to file-only sharing path.
      }

      const canUseNativeShareSheet = await Sharing.isAvailableAsync();
      if (canUseNativeShareSheet) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/jpeg",
          dialogTitle: "Share your farmed Aura",
        });
        return;
      }

      throw new Error("No sharing method available on this device");
    } catch (error) {
      console.error("Error sharing screenshot:", error);
      Alert.alert(
        "Share failed",
        "Couldn't open share sheet. Please try again.",
      );
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: hexToRgba(tier.color, 0.3) }]}
      edges={["top"]}
    >
      <Header />

      <View style={styles.container}>
        <ViewShot
          ref={auraRef}
          style={styles.captureContainer}
          options={{ format: "jpg", quality: 0.95, result: "tmpfile" }}
        >
          <AuraDiamondIcon
            color={tier.color}
            points={auraPoints ?? 0}
            width={270}
            height={426}
            style={{ marginTop: 24 }}
          />

          {auraPoints == 0 && (
            <ThemedText
              style={[
                styles.auraSubtext2,
                { color: tailwindColors["aura-gray-700"] },
              ]}
            >
              Complete a challenge to start farming Aura!
            </ThemedText>
          )}
        </ViewShot>

        <View style={styles.bigInfoContainer}>
          <View style={styles.infoContainer}>
            <View style={styles.infoBox}>
              <ThemedText style={[styles.auraText, { color: tier.color }]}>
                #{rank}
              </ThemedText>
              <ThemedText
                style={[
                  styles.auraSubtext,
                  { color: tailwindColors["aura-gray-700"] },
                ]}
              >
                rank
              </ThemedText>
            </View>

            <View style={styles.infoBox}>
              <ThemedText style={[styles.auraText, { color: tier.color }]}>
                {tier.label.charAt(0).toUpperCase() + tier.label.slice(1)}
              </ThemedText>
              <ThemedText
                style={[
                  styles.auraSubtext,
                  { color: tailwindColors["aura-gray-700"] },
                ]}
              >
                Aura
              </ThemedText>
            </View>

            {!loadingLeaderboard && !fetchError && (
              <View style={styles.infoBox}>
                <ThemedText style={[styles.auraText, { color: tier.color }]}>
                  {percentile}
                  {String(percentile).endsWith("1") ?
                    "st"
                  : String(percentile).endsWith("2") ?
                    "nd"
                  : String(percentile).endsWith("3") ?
                    "rd"
                  : "th"}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.auraSubtext,
                    { color: tailwindColors["aura-gray-700"] },
                  ]}
                >
                  percentile
                </ThemedText>
              </View>
            )}
          </View>

          <Pressable
            style={[
              styles.shareBtn,
              cardShadow(2),
              { backgroundColor: tailwindColors["aura-surface"] },
            ]}
            onPress={handleShare}
            accessibilityRole="button"
          >
            <View style={styles.shareBtnLeft}>
              <View
                style={[
                  styles.shareIconBg,
                  { backgroundColor: hexToRgba(tier.color, 0.1) },
                ]}
              >
                <Ionicons name="share-outline" size={24} color={tier.color} />
              </View>
              <View>
                <ThemedText style={styles.shareTitle}>
                  Share your Aura
                </ThemedText>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={tailwindColors["aura-gray-400"]}
            />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  bigInfoContainer: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "absolute",
    bottom: 30,
  },
  infoContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
  infoBox: {
    backgroundColor: hexToRgba(tailwindColors["aura-surface"], 0.5),
    borderRadius: radius.md,
    flex: 1,
    paddingVertical: 8,
  },
  auraText: {
    fontSize: 26,
    fontFamily: tailwindFonts["semibold"],
    textAlign: "center",
  },
  auraSubtext: {
    fontSize: 14,
    fontFamily: tailwindFonts["regular"],
    textAlign: "center",
    marginTop: -6,
  },
  auraSubtext2: {
    fontSize: 18,
    fontFamily: tailwindFonts["regular"],
    marginTop: 16,
    textAlign: "center",
  },
  pointsText: {
    fontSize: 18,
    fontFamily: tailwindFonts["semibold"],
    textAlign: "center",
    marginTop: 4,
  },
  captureContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  shareBtn: {
    borderRadius: radius.lg,
    padding: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tailwindColors["aura-border"],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  shareBtnLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  shareIconBg: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  shareTitle: {
    fontFamily: tailwindFonts["regular"],
    fontSize: 16,
    color: tailwindColors["aura-black"],
    backgroundColor: "transparent",
  },
});

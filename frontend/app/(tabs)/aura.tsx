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
import { getUserProfileFromApi } from "@/lib/api";
import { getTierForPoints } from "@/constants/auraTiers";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { radius, spacing, cardShadow } from "@/constants/design";

function hexToRgba(hex: string, alpha: number) {
  const cleaned = hex.replace("#", "");
  const value = parseInt(cleaned, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function AuraScreen() {
  const auraRef = useRef<ViewShot>(null);
  const [auraPoints, setAuraPoints] = useState<number | null>(null);
  const [rank, setRank] = useState<number | null>(null);

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
        setRank(res.data.rank ?? null);
      }
    });
  }, []);

  const tier = getTierForPoints(auraPoints ?? 0);

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
          <ThemedText
            style={[
              styles.auraSubtext,
              { color: tailwindColors["aura-gray-700"] },
            ]}
          >
            You have
          </ThemedText>
          <ThemedText
            style={[
              styles.auraText,
              { color: tailwindColors["aura-gray-800"] },
            ]}
          >
            {tier.label.charAt(0).toUpperCase() + tier.label.slice(1)} Aura
          </ThemedText>
          {rank !== null && (
            <ThemedText style={[styles.pointsText, { color: tier.color }]}>
              Rank #{rank}
            </ThemedText>
          )}
        </ViewShot>

        <Pressable
          style={[
            styles.card,
            cardShadow(2),
            { backgroundColor: tailwindColors["aura-surface"] },
          ]}
          onPress={handleShare}
          accessibilityRole="button"
        >
          <View style={styles.securityLeft}>
            <View
              style={[
                styles.securityIconBg,
                { backgroundColor: hexToRgba(tier.color, 0.1) },
              ]}
            >
              <Ionicons name="share-outline" size={24} color={tier.color} />
            </View>
            <View>
              <ThemedText style={styles.securityTitle}>
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
  auraSubtext: {
    fontSize: 24,
    fontFamily: tailwindFonts["regular"],
    marginTop: 16,
    textAlign: "center",
  },
  auraText: {
    fontSize: 32,
    fontFamily: tailwindFonts["semibold"],
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

  card: {
    position: "absolute",
    bottom: 24,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tailwindColors["aura-border"],
    marginTop: 32,
    width: "80%",
    maxWidth: 400,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  securityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  securityIconBg: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  securityTitle: {
    fontFamily: tailwindFonts["regular"],
    fontSize: 16,
    color: tailwindColors["aura-black"],
    backgroundColor: "transparent",
  },
});

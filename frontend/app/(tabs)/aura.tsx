import ShareButton from "@/assets/ShareButton.svg";
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
      if (!uri) throw new Error("Failed to capture aura view");

      try {
        await Share.share(
          {
            title: "My AuraFarm creation",
            message: "Check out my Aura 🔥🔥",
            url: uri,
          },
          {
            dialogTitle: "Share your AuraFarm creation",
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
          dialogTitle: "Share your AuraFarm creation",
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
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header />

      <View style={styles.container}>
        <ViewShot
          ref={auraRef}
          style={styles.captureContainer}
          options={{ format: "jpg", quality: 0.95, result: "tmpfile" }}
        >
          <AuraDiamondIcon color={tier.color} points={auraPoints ?? 0} width={270} height={426} style={{ marginTop: 24 }} />
          <ThemedText style={[styles.auraText, { color: tier.color }]}>
            You have {tier.label} aura
          </ThemedText>
          {rank !== null && (
            <ThemedText style={[styles.pointsText, { color: tier.color }]}>
              Rank #{rank}
            </ThemedText>
          )}
        </ViewShot>

        <Pressable
          onPress={handleShare}
          hitSlop={12}
          accessibilityRole="button"
          style={styles.shareButton}
        >
          <ShareButton width={32} height={37} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tailwindColors["aura-page"],
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  auraText: {
    fontSize: 32,
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
  shareButton: {
    marginTop: 24,
  },
});

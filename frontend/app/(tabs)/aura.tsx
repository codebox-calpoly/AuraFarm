import AuraDiamond from "@/assets/AuraDiamond.svg";
import ShareButton from "@/assets/ShareButton.svg";
import { StyleSheet, View, Pressable, Alert, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRef } from "react";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { Header } from "@/components/home/Header";
import { tailwindColors } from "@/constants/tailwind-colors";
import { ThemedText } from "@/components/themed-text";

export default function AuraScreen() {
  const auraRef = useRef<ViewShot>(null);

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
      {/* Header */}
      <Header />

      <View style={styles.container}>
        {/* Only this container is captured */}
        <ViewShot
          ref={auraRef}
          style={styles.captureContainer}
          options={{ format: "jpg", quality: 0.95, result: "tmpfile" }}
        >
          <AuraDiamond width={270} height={426} style={{ marginTop: 24 }} />
          <ThemedText style={styles.auraText}>You have red aura</ThemedText>
          <ThemedText style={styles.rarityText}>99.99% rarity</ThemedText>
        </ViewShot>

        {/* Share button outside the capture view */}
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
    backgroundColor: tailwindColors["aura-red-tint"],
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  auraText: {
    fontSize: 32,
    fontFamily: "Poppins_400Regular",
    color: tailwindColors["aura-black"],
    marginTop: 16,
    textAlign: "center",
  },
  rarityText: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: tailwindColors["aura-red"],
    textAlign: "center",
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

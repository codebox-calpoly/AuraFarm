import AuraDiamond from "@/assets/AuraDiamond.svg";
import AuraFarmHeader from "@/assets/AuraFarmHeader.svg";
import Auratext from "@/assets/Auratext.svg";
import ShareButton from "@/assets/ShareButton.svg";
import { SafeAreaView, StyleSheet, View, Pressable, Alert, Share } from "react-native";
import { useRef } from "react";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";

export default function AuraScreen() {
  const auraRef = useRef<ViewShot>(null);

  const handleShare = async () => {
    try {
      if (!auraRef.current) return;

      await new Promise(res => setTimeout(res, 100));

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
      Alert.alert("Share failed", "Couldn't open share sheet. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Only this container is captured */}
        <ViewShot
          ref={auraRef}
          style={styles.captureContainer}
          options={{ format: "jpg", quality: 0.95, result: "tmpfile" }}
        >
          <AuraFarmHeader width={153} height={27} />
          <AuraDiamond width={270} height={426} style={{ marginTop: 24 }} />
          <Auratext width={194} height={49} />
        </ViewShot>

        {/* Share button outside the capture view */}
        <Pressable onPress={handleShare} hitSlop={12} accessibilityRole="button">
          <ShareButton width={32} height={37} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#e7cfd5",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 46,
  },
  captureContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e7cfd5",
    width: "100%",
    paddingVertical: 24,
  },
});

import { View, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { tailwindColors } from "@/constants/tailwind-colors";
import { isAuthenticated } from "@/lib/auth";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkAndNavigate = async () => {
      try {
        const [hasCompletedOnboarding, loggedIn] = await Promise.all([
          AsyncStorage.getItem("hasCompletedOnboarding"),
          isAuthenticated(),
        ]);

        setTimeout(() => {
          if (hasCompletedOnboarding !== "true") {
            router.replace("/onboarding");
          } else if (!loggedIn) {
            router.replace("/onboarding");
          } else {
            router.replace("/(tabs)");
          }
        }, 1500);
      } catch (error) {
        console.error("Error checking auth state:", error);
        router.replace("/onboarding");
      }
    };

    checkAndNavigate();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.View entering={FadeIn.duration(800)}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tailwindColors["aura-red"],
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 256,
    height: 256,
  },
});

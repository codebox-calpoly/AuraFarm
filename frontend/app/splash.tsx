import { View, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { tailwindColors } from "@/constants/tailwind-colors";
import {
  clearSession,
  hasCompletedExplicitAuth,
  isAuthenticated,
} from "@/lib/auth";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const checkAndNavigate = async () => {
      try {
        const startedAt = Date.now();
        const [hasCompletedOnboarding, hasCompletedAuth, loggedIn] = await Promise.all([
          AsyncStorage.getItem("hasCompletedOnboarding"),
          hasCompletedExplicitAuth(),
          Promise.race<boolean>([
            isAuthenticated(),
            new Promise((resolve) => setTimeout(() => resolve(false), 900)),
          ]),
        ]);

        if (cancelled) return;

        // Keep the branded splash visible briefly, but don't block on slow auth refresh.
        const remainingDelay = Math.max(0, 250 - (Date.now() - startedAt));
        timer = setTimeout(async () => {
          if (cancelled) return;
          if (hasCompletedOnboarding !== "true") {
            router.replace("/onboarding");
          } else if (!hasCompletedAuth) {
            await clearSession();
            if (!cancelled) router.replace("/login");
          } else if (!loggedIn) {
            router.replace("/login");
          } else {
            router.replace("/(tabs)");
          }
        }, remainingDelay);
      } catch (error) {
        console.error("Error checking auth state:", error);
        if (!cancelled) router.replace("/onboarding");
      }
    };

    checkAndNavigate();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ActivityIndicator size="small" color={tailwindColors["aura-white"]} />
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
});

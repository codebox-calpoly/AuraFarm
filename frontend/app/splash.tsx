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

        // Run onboarding + explicit-auth checks immediately (local storage only).
        // Give the token validation / refresh up to 5 seconds — enough for a real
        // network token-refresh round trip — before falling back gracefully.
        const [hasCompletedOnboarding, hasCompletedAuth] = await Promise.all([
          AsyncStorage.getItem("hasCompletedOnboarding"),
          hasCompletedExplicitAuth(),
        ]);

        // Fast-path: user hasn't finished onboarding or never explicitly logged in.
        // No need to wait on the network for these cases.
        if (hasCompletedOnboarding !== "true") {
          if (!cancelled) router.replace("/onboarding");
          return;
        }
        if (!hasCompletedAuth) {
          await clearSession();
          if (!cancelled) router.replace("/login");
          return;
        }

        // User has previously logged in — give the session check (including a
        // possible refresh-token network call) up to 5 s before deciding.
        const loggedIn = await Promise.race<boolean>([
          isAuthenticated(),
          new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5000)),
        ]);

        if (cancelled) return;

        // Keep the branded splash visible briefly.
        const remainingDelay = Math.max(0, 250 - (Date.now() - startedAt));
        timer = setTimeout(() => {
          if (cancelled) return;
          if (loggedIn) {
            router.replace("/(tabs)");
          } else {
            router.replace("/login");
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

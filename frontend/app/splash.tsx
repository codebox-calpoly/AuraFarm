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
        // Give the token validation / refresh time to complete before falling back.
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

        let handledAuthResult = false;
        let authNavTimer: ReturnType<typeof setTimeout> | null = null;
        let pendingAuthTimer: ReturnType<typeof setTimeout> | null = null;

        const scheduleNavigation = (loggedIn: boolean) => {
          if (cancelled || handledAuthResult) return;
          handledAuthResult = true;
          if (pendingAuthTimer) {
            clearTimeout(pendingAuthTimer);
            pendingAuthTimer = null;
          }

          const remainingDelay = Math.max(0, 250 - (Date.now() - startedAt));
          authNavTimer = setTimeout(() => {
            if (cancelled) return;
            router.replace(loggedIn ? "/(tabs)" : "/login");
          }, remainingDelay);
        };

        void isAuthenticated()
          .then(async (loggedIn) => {
            if (!loggedIn) {
              try {
                await clearSession();
              } catch (clearError) {
                console.error("Error clearing session after auth failure:", clearError);
              }
            }
            scheduleNavigation(loggedIn);
          })
          .catch(async (error) => {
            console.error("Error checking auth state:", error);
            try {
              await clearSession();
            } catch (clearError) {
              console.error("Error clearing session after auth check error:", clearError);
            }
            scheduleNavigation(false);
          });

        pendingAuthTimer = setTimeout(() => {
          if (cancelled || handledAuthResult) return;
          console.warn("Auth check still pending after 5 seconds");
        }, 5000);
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

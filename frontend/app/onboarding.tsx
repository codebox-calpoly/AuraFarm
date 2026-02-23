import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { tailwindColors } from "@/constants/tailwind-colors";

const { width } = Dimensions.get("window");

const onboardingData = [
  {
    id: 1,
    title: "Welcome to Aura Farm",
    description: "Discover challenges, earn points, and grow your sustainable journey on campus.",
  },
  {
    id: 2,
    title: "Complete Challenges",
    description: "Find challenges near you, complete them, and earn Aura points to climb the leaderboard.",
  },
  {
    id: 3,
    title: "Get Started",
    description: "Create an account to start your journey and track your progress.",
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  const handleContinue = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSignUp = async () => {
    try {
      await AsyncStorage.setItem("hasCompletedOnboarding", "true");
      router.replace("/signup");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      router.replace("/signup");
    }
  };

  const handleLogIn = async () => {
    try {
      await AsyncStorage.setItem("hasCompletedOnboarding", "true");
      router.replace("/login");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      router.replace("/login");
    }
  };

  const isLastScreen = currentIndex === onboardingData.length - 1;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Aura Farm</Text>
      </View>

      {/* Content Area */}
      <Animated.View
        key={currentIndex}
        entering={FadeInRight.duration(400)}
        exiting={FadeOutLeft.duration(400)}
        style={styles.contentContainer}
      >
        {/* Image Placeholder */}
        <View style={styles.imagePlaceholder} />

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{onboardingData[currentIndex].title}</Text>
          <Text style={styles.description}>
            {onboardingData[currentIndex].description}
          </Text>
        </View>
      </Animated.View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        {isLastScreen ? (
          <View style={styles.lastScreenButtons}>
            <TouchableOpacity
              onPress={handleSignUp}
              style={[styles.button, styles.buttonPrimary]}
            >
              <Text style={styles.buttonTextPrimary}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogIn}
              style={[styles.button, styles.buttonSecondary]}
            >
              <Text style={styles.buttonTextSecondary}>Log In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleContinue}
            style={[styles.button, styles.buttonSecondary]}
          >
            <Text style={styles.buttonTextSecondary}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    width: "100%",
    alignItems: "center",
    paddingTop: 32,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: tailwindColors['aura-red'],
    textShadowColor: "rgba(220, 38, 38, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholder: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#000000",
    borderRadius: 16,
    marginBottom: 32,
    maxWidth: 384,
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
  },
  pagination: {
    flexDirection: "row",
    marginBottom: 32,
    gap: 8,
  },
  lastScreenButtons: {
    width: "100%",
    gap: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 32,
    backgroundColor: "#000000",
  },
  dotInactive: {
    width: 8,
    backgroundColor: "#D1D5DB",
  },
  button: {
    width: "100%",
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  buttonSecondary: {
    backgroundColor: "#ffffff",
    borderColor: "#030303",
  },
  buttonPrimary: {
    backgroundColor: tailwindColors['aura-green'],
  },
  buttonTextSecondary: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#030303",
  },
  buttonTextPrimary: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
});

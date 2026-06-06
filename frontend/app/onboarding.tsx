import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { tailwindColors, tailwindFonts } from "@/constants/tailwind-colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

const onboardingData = [
  {
    id: 1,
    title: "Touch Grass",
    description: "Leave your dorm and explore campus with new people.",
    image: require("../assets/images/onboarding/waldo-planking.png"),
  },
  {
    id: 2,
    title: "Earn Aura",
    description:
      "Complete challenges to earn Aura and climb the leaderboard.",
    image: require("../assets/images/onboarding/mountain-looking-out.png"),
  },
  {
    id: 3,
    title: "Start Farming",
    description: "Create an account to start farming Aura.",
    image: require("../assets/images/onboarding/sitting-near-the-p.png"),
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

  const isLastScreen = currentIndex === onboardingData.length - 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Content Area */}
        <Animated.View
          key={currentIndex}
          entering={FadeInRight.duration(400)}
          exiting={FadeOutLeft.duration(400)}
          style={styles.contentContainer}
        >
          <View style={styles.imageContainer}>
            {/* Image Placeholder */}
            <Image
              style={styles.image}
              source={onboardingData[currentIndex].image}
              contentFit="cover"
              transition={1000}
              autoplay
            />
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {onboardingData[currentIndex].title}
            </Text>
            <Text style={styles.description}>
              {onboardingData[currentIndex].description}
            </Text>
          </View>
        </Animated.View>

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

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Buttons */}
          {isLastScreen ?
            <View style={styles.lastScreenButtons}>
              <TouchableOpacity
                onPress={handleSignUp}
                style={[styles.button, styles.buttonPrimary]}
              >
                <Ionicons
                  name="sparkles"
                  size={24}
                  color={tailwindColors["aura-white"]}
                />
                <Text style={styles.buttonTextPrimary}>Sign up</Text>
              </TouchableOpacity>
            </View>
          : <TouchableOpacity
              onPress={handleContinue}
              style={[styles.button, styles.buttonSecondary]}
            >
              <Text style={styles.buttonTextSecondary}>Continue</Text>
              <Ionicons
                name="arrow-forward"
                size={24}
                color={tailwindColors["aura-gray-700"]}
              />
            </TouchableOpacity>
          }
        </View>
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
    paddingBottom: 32,
  },
  header: {
    width: "100%",
    alignItems: "center",
    paddingTop: 32,
  },
  headerText: {
    fontSize: 30,
    fontFamily: tailwindFonts["bold"],
    color: tailwindColors["aura-red"],
    textShadowColor: "rgba(220, 38, 38, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  contentContainer: {
    width: "100%",
    flex: 1,
    marginBottom: 48,
  },
  imageContainer: {
    height: "100%",
    width: "100%",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    borderColor: tailwindColors["aura-border"],
    borderBottomWidth: 2,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 32,
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: tailwindFonts["semibold"],
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 6,
  },
  description: {
    fontSize: 17,
    fontFamily: tailwindFonts["regular"],
    color: "#6B7280",
    textAlign: "center",
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 24,
    gap: 8,
    paddingHorizontal: 24,
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
    backgroundColor: tailwindColors["aura-red"],
  },
  dotInactive: {
    width: 8,
    backgroundColor: tailwindColors["aura-gray-300"],
  },
  button: {
    width: "100%",
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonSecondary: {
    backgroundColor: tailwindColors["aura-white"],
    borderColor: tailwindColors["aura-gray-200"],
  },
  buttonPrimary: {
    backgroundColor: tailwindColors["aura-red"],
  },
  buttonTextSecondary: {
    textAlign: "center",
    fontSize: 18,
    fontFamily: tailwindFonts["semibold"],
    color: "#030303",
  },
  buttonTextPrimary: {
    textAlign: "center",
    fontSize: 18,
    fontFamily: tailwindFonts["semibold"],
    color: tailwindColors["aura-white"],
  },
});

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function VerificationScreen() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const onChangeCode = (text: string) => {
    if (text.length <= 4) setCode(text);
  };

  const handleResendCode = async () => {
    // logic for resending code
  };

  const handleSignup = async () => {
    router.replace("/verification");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.replace("/signup")}>
          <IconSymbol name="chevron.left" size={35} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <Animated.View
        entering={FadeInRight.duration(400)}
        exiting={FadeOutLeft.duration(400)}
        style={styles.contentContainer}
      >
        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Enter 4-digit code sent to{" "}
            <Text style={styles.bold}>mmustang@calpoly.edu</Text>
          </Text>
        </View>

        {/* Code Input */}
        <View style={styles.credentialsContainer}>
          <Text style={styles.inputLabel}>Code</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              onChangeText={onChangeCode}
              value={code}
              placeholder="- - - -"
              placeholderTextColor="#c2c2c2"
              keyboardType="numeric"
            />
          </View>
        </View>
      </Animated.View>

      {/* Bottom Section */}
      <KeyboardAvoidingView style={styles.bottomSection} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableOpacity onPress={handleResendCode}>
          <Text style={[styles.bottomText, styles.bottomButtonText]}>
            Resend Code
          </Text>
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity
          onPress={handleSignup}
          style={[styles.buttonCircle, styles.buttonPrimary]}
        >
          <IconSymbol
            size={35}
            name="chevron.right"
            color="#4FB948"
            style={styles.continueIcon}
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
    alignItems: "flex-start",
    paddingTop: 32,
    marginBottom: 24,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#DC2626",
    textShadowColor: "rgba(220, 38, 38, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
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
    paddingHorizontal: 16,
    display: "flex",
    flexDirection: "row",
  },
  title: {
    fontSize: 24,
    fontWeight: 400,
    color: "#1F2937",
    textAlign: "left",
    marginBottom: 12,
  },
  bold: {
    fontWeight: "600",
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "left",
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    width: "100%",
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  buttonPrimary: {
    backgroundColor: "#4FB948",
  },
  buttonCircle: {
    width: 64,
    height: 64,
    borderRadius: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTextPrimary: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  credentialsContainer: {
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 36,
  },
  bottomText: {
    marginTop: 24,
    fontSize: 18,
  },
  bottomButtonText: {
    color: "#4FB948",
  },
  inputLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "600",
  },
  inputContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    borderColor: "#e1e2e3",
    borderBottomWidth: 1.5,
    gap: 12,
  },
  input: {
    width: "100%",
    fontSize: 16,
    height: 48,
  },
  passwordToggle: {},
  passwordToggleIcon: {},
  continueIcon: {
    color: "#ffffff",
  },
  invalidEmailText: {
    marginTop: 4,
    fontSize: 12,
    color: "#D8143A",
  },
});

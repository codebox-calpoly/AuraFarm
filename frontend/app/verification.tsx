import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { tailwindColors } from "@/constants/tailwind-colors";
import { storeSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export default function VerificationScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const onChangeCode = (text: string) => {
    if (text.length <= 6) {
      setCode(text);
      setServerError(null);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    setResendLoading(true);
    setResendMessage(null);
    setServerError(null);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        setServerError("Could not resend code. Please try again.");
      } else {
        setResendMessage("A new code has been sent to your email.");
      }
    } catch {
      setServerError("Network error. Please check your connection.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!email) {
      setServerError("Missing email. Please try signing up again.");
      return;
    }

    if (code.length < 4) {
      setServerError("Please enter the full verification code.");
      return;
    }

    setLoading(true);
    setServerError(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "signup", // use "email" if using magic link login
      });
      console.log("Verification session:", data?.session);
      console.log("User ID:", data?.session?.user?.id);
      console.log("User ID type:", typeof data?.session?.user?.id);
      if (error) {
        setServerError(error.message ?? "Invalid or expired code.");
        return;
      }

      if (!data.session) {
        setServerError("Verification failed. No session returned.");
        return;
      }

      // Store Supabase session
      await storeSession({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        userId: data.session.user.id,
      });

      router.replace("/(tabs)");
    } catch (err) {
      console.error("Verification error:", err);
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
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
              <Text style={styles.bold}>{email ?? "your email"}</Text>
            </Text>
          </View>

          {/* Server Error */}
          {serverError ? (
            <View style={styles.messageContainer}>
              <Text style={styles.errorText}>{serverError}</Text>
            </View>
          ) : null}

          {/* Resend success */}
          {resendMessage ? (
            <View style={[styles.messageContainer, styles.successContainer]}>
              <Text style={styles.successText}>{resendMessage}</Text>
            </View>
          ) : null}

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
                maxLength={6}
                editable={!loading}
              />
            </View>
          </View>
        </Animated.View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <TouchableOpacity onPress={handleResendCode} disabled={resendLoading || loading}>
            {resendLoading ? (
              <ActivityIndicator color={tailwindColors['aura-green']} />
            ) : (
              <Text style={[styles.bottomText, styles.bottomButtonText]}>
                Resend Code
              </Text>
            )}
          </TouchableOpacity>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleContinue}
            style={[styles.buttonCircle, styles.buttonPrimary, loading && styles.buttonDisabled]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <IconSymbol
                size={35}
                name="chevron.right"
                color="#ffffff"
                style={styles.continueIcon}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  contentContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  textContainer: {
    width: "100%",
    paddingHorizontal: 16,
    display: "flex",
    flexDirection: "row",
  },
  title: {
    fontSize: 24,
    fontWeight: "400",
    color: "#1F2937",
    textAlign: "left",
    marginBottom: 12,
    flexShrink: 1,
  },
  bold: {
    fontWeight: "600",
  },
  messageContainer: {
    width: "100%",
    marginHorizontal: 0,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tailwindColors['aura-red'],
  },
  successContainer: {
    backgroundColor: "#F0FDF4",
    borderColor: tailwindColors['aura-green'],
  },
  errorText: {
    fontSize: 13,
    color: tailwindColors['aura-red'],
    textAlign: "center",
  },
  successText: {
    fontSize: 13,
    color: tailwindColors['aura-green'],
    textAlign: "center",
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonPrimary: {
    backgroundColor: tailwindColors['aura-green'],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonCircle: {
    width: 64,
    height: 64,
    borderRadius: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    color: tailwindColors['aura-green'],
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
  continueIcon: {
    color: "#ffffff",
  },
});

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { tailwindColors, tailwindFonts } from "@/constants/tailwind-colors";
import {
  apiResendOtp,
  apiVerifyOtp,
  verifyOtpRequiresLogin,
} from "@/lib/api";
import { markExplicitAuthCompleted, storeSession } from "@/lib/auth";
import {
  clearPendingSignup,
  getPendingSignupPassword,
} from "@/lib/pendingSignup";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

export default function VerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = useMemo(
    () => (params.email ? String(params.email).trim().toLowerCase() : ""),
    [params.email],
  );

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const onChangeCode = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setCode(digits);
    setServerError(null);
    setInfo(null);
  };

  const handleVerify = async () => {
    if (!email) {
      setServerError("Missing email. Please sign up again.");
      return;
    }
    if (code.length !== OTP_LENGTH) {
      setServerError(`Enter the ${OTP_LENGTH}-digit code from your email.`);
      return;
    }

    setLoading(true);
    setServerError(null);
    setInfo(null);

    try {
      const password = getPendingSignupPassword(email) ?? undefined;
      const res = await apiVerifyOtp({ email, code, password });

      if (!res.success) {
        setServerError(res.error ?? "Verification failed");
        return;
      }

      if (verifyOtpRequiresLogin(res.data)) {
        clearPendingSignup();
        setInfo("Email verified! Please log in to continue.");
        setTimeout(() => router.replace("/login"), 600);
        return;
      }

      await storeSession({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
        userId: res.data.user.id,
        user: res.data.user,
      });
      await markExplicitAuthCompleted();
      clearPendingSignup();
      router.replace("/(tabs)");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0 || resending) return;
    setResending(true);
    setServerError(null);
    setInfo(null);
    try {
      const res = await apiResendOtp(email);
      if (!res.success) {
        setServerError(res.error ?? "Could not resend code.");
        return;
      }
      setInfo("New code sent. Check your email.");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } finally {
      setResending(false);
    }
  };

  const goBackToSignup = () => router.replace("/signup");

  const obscured = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a: string, b: string, c: string) =>
        `${a}${"•".repeat(Math.max(b.length, 1))}${c}`,
      )
    : "your email";

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 48 : 0}
        style={styles.container}
      >
        <View style={styles.header}>
          <Image
            style={styles.logo}
            source={require("../assets/images/red-logo.png")}
            resizeMode="contain"
          />
        </View>

        {serverError ? (
          <View style={styles.serverErrorContainer}>
            <Text style={styles.serverErrorText}>{serverError}</Text>
          </View>
        ) : null}
        {info ? (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>{info}</Text>
          </View>
        ) : null}

        <ScrollView
          style={styles.contentContainer}
          contentContainerStyle={{ paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.textContainer}>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.description}>
              We sent a {OTP_LENGTH}-digit code to{" "}
              <Text style={styles.emailEmph}>{obscured}</Text>. Enter it below
              to finish creating your account.
            </Text>
          </View>

          <View style={styles.credentialsContainer}>
            <Text style={styles.inputLabel}>Verification code</Text>

            <TouchableOpacity
              activeOpacity={1}
              style={styles.otpRow}
              onPress={() => inputRef.current?.focus()}
            >
              {Array.from({ length: OTP_LENGTH }).map((_, i) => {
                const char = code[i] ?? "";
                const isActive = i === code.length;
                return (
                  <View
                    key={i}
                    style={[
                      styles.otpBox,
                      isActive && styles.otpBoxActive,
                      char ? styles.otpBoxFilled : null,
                    ]}
                  >
                    <Text style={styles.otpChar}>{char}</Text>
                  </View>
                );
              })}
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={code}
              onChangeText={onChangeCode}
              keyboardType="number-pad"
              inputMode="numeric"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              maxLength={OTP_LENGTH}
              editable={!loading}
              autoFocus
            />
          </View>

          <View style={styles.bottomSection}>
            <TouchableOpacity
              onPress={handleVerify}
              style={[
                styles.button,
                styles.buttonPrimary,
                (loading || code.length !== OTP_LENGTH) && styles.buttonDisabled,
              ]}
              disabled={loading || code.length !== OTP_LENGTH}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonTextPrimary}>Verify</Text>
              )}
            </TouchableOpacity>

            <View style={styles.resendRow}>
              <Text style={styles.bottomText}>Didn&apos;t get a code? </Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={resendCooldown > 0 || resending}
              >
                <Text
                  style={[
                    styles.bottomText,
                    styles.bottomTextButton,
                    (resendCooldown > 0 || resending) && styles.disabledLink,
                  ]}
                >
                  {resending
                    ? "Sending..."
                    : resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend code"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={goBackToSignup} style={styles.backRow}>
              <Text style={styles.backText}>Wrong email? Sign up again</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
  },
  header: {
    width: "100%",
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 0,
  },
  logo: {
    marginTop: -52,
    width: 225,
    height: 225,
  },
  contentContainer: {
    flex: 1,
    width: "100%",
  },
  textContainer: {
    width: "100%",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    textAlign: "left",
    fontFamily: tailwindFonts["semibold"],
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "left",
    fontFamily: tailwindFonts["regular"],
    marginTop: 4,
  },
  emailEmph: {
    color: tailwindColors["aura-black"] ?? "#0f0f0f",
    fontFamily: tailwindFonts["semibold"],
  },
  serverErrorContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tailwindColors["aura-red"],
  },
  serverErrorText: {
    fontSize: 13,
    color: tailwindColors["aura-red"],
    textAlign: "center",
  },
  infoContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tailwindColors["aura-green"],
  },
  infoText: {
    fontSize: 13,
    color: tailwindColors["aura-green"],
    textAlign: "center",
    fontFamily: tailwindFonts["semibold"],
  },
  credentialsContainer: {
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 36,
  },
  inputLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
    fontFamily: tailwindFonts["semibold"],
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e1e2e3",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxActive: {
    borderColor: tailwindColors["aura-green"],
    borderWidth: 2,
  },
  otpBoxFilled: {
    borderColor: "#cbd5e1",
  },
  otpChar: {
    fontSize: 22,
    fontFamily: tailwindFonts["semibold"],
    color: "#0f0f0f",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 1,
    width: 1,
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    marginTop: 36,
    paddingHorizontal: 16,
  },
  button: {
    width: "100%",
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  buttonPrimary: {
    backgroundColor: tailwindColors["aura-green"],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonTextPrimary: {
    textAlign: "center",
    fontSize: 18,
    fontFamily: tailwindFonts["semibold"],
    color: "#ffffff",
  },
  resendRow: {
    flexDirection: "row",
    marginTop: 24,
  },
  bottomText: {
    fontSize: 16,
    fontFamily: tailwindFonts["semibold"],
  },
  bottomTextButton: {
    color: tailwindColors["aura-green"],
  },
  disabledLink: {
    opacity: 0.5,
  },
  backRow: {
    marginTop: 16,
  },
  backText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: tailwindFonts["regular"],
  },
});

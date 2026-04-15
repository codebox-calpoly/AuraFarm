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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { tailwindColors, tailwindFonts } from "@/constants/tailwind-colors";
import { apiLogin, apiForgotPassword } from "@/lib/api";
import { storeSession } from "@/lib/auth";

export default function LogInScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showInputErrors, setShowInputErrors] = useState(false);

  const [email, setEmail] = useState("");
  const onChangeEmail = (text: string) => {
    setEmail(text);
    setShowInputErrors(false);
    setServerError(null);
  };

  const [password, setPassword] = useState("");
  const [passwordHidden, setPasswordHidden] = useState(true);
  const onChangePassword = (text: string) => {
    setPassword(text);
    setShowInputErrors(false);
    setServerError(null);
  };

  const handleSignup = async () => {
    router.replace("/signup");
  };

  const handleLogin = async () => {
    if (email === "" || password === "") {
      setShowInputErrors(true);
      return;
    }

    setLoading(true);
    setServerError(null);

    try {
      const res = await apiLogin({ email, password });

      if (!res.success) {
        setServerError(res.error ?? "Log in failed");
        return;
      }

      if (res.success && res.data) {
        await storeSession({
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
          userId: res.data.user.id,
          user: res.data.user,
        });
      }

      router.replace("/(tabs)");
    } finally {
      setLoading(false);
    }
  };

  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleForgotPassword = () => {
    setForgotEmail(email); // pre-fill with login email if already entered
    setForgotError(null);
    setForgotSuccess(false);
    setForgotModalVisible(true);
  };

  const handleForgotSubmit = async () => {
    if (!forgotEmail) {
      setForgotError("Please enter your email.");
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    try {
      const res = await apiForgotPassword(forgotEmail);
      if (!res.success) {
        setForgotError(res.error ?? "Could not send reset email.");
      } else {
        setForgotSuccess(true);
      }
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 48 : 0}
        style={styles.container}
      >
        {/* Logo */}
        <View style={styles.header}>
          <Image
            style={styles.logo}
            source={require("../assets/images/red-logo.png")}
            resizeMode="contain"
          />
        </View>

        {/* Server Error */}
        {serverError ? (
          <View style={styles.serverErrorContainer}>
            <Text style={styles.serverErrorText}>{serverError}</Text>
          </View>
        ) : null}

        {/* Content Area */}
        <ScrollView
          style={styles.contentContainer}
          contentContainerStyle={{
            paddingBottom: 48,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Log In</Text>
            <Text style={styles.description}>
              Enter your email and password
            </Text>
          </View>

          {/* Email Input */}
          <View style={styles.credentialsContainer}>
            <Text style={styles.inputLabel}>Email</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                onChangeText={onChangeEmail}
                value={email}
                placeholder="mmustang@calpoly.edu"
                placeholderTextColor="#c2c2c2"
                textContentType="emailAddress"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
            {
              showInputErrors && email === "" ?
                <Text style={styles.invalidEmailText}>Invalid email</Text>
                : null
            }
          </View>
          {/* Password Input */}
          <View style={styles.credentialsContainer}>
            <Text style={styles.inputLabel}>Password</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                onChangeText={onChangePassword}
                value={password}
                placeholder="••••••••••••••"
                placeholderTextColor="#c2c2c2"
                secureTextEntry={passwordHidden}
                textContentType="password"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setPasswordHidden(!passwordHidden)}
                style={styles.passwordToggle}
              >
                <IconSymbol
                  size={25}
                  name={passwordHidden ? "eye.slash" : "eye"}
                  color="#8c8c8c"
                  style={styles.passwordToggleIcon}
                />
              </TouchableOpacity>
            </View>
            {showInputErrors && password === "" ?
              <Text style={styles.invalidPasswordText}>Password is required</Text>
              : null}

            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            {/* Log In Button */}
            <TouchableOpacity
              onPress={handleLogin}
              style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonTextPrimary}>Log In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.bottomTextContainer}>
              <Text style={styles.bottomText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignup} disabled={loading}>
                <Text style={[styles.bottomText, styles.bottomTextButton]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* Forgot Password Modal */}
      <Modal
        visible={forgotModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setForgotModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <TouchableOpacity onPress={() => setForgotModalVisible(false)}>
                <IconSymbol name="xmark" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {forgotSuccess ? (
              <>
                <View style={styles.successContainer}>
                  <Text style={styles.successText}>
                    Check your email for a password reset link. Follow the link to set a new password, then log in here.
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={() => setForgotModalVisible(false)}
                >
                  <Text style={styles.buttonTextPrimary}>Done</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalDescription}>
                  Enter your @calpoly.edu email and we'll send you a reset link.
                </Text>

                {forgotError ? (
                  <View style={styles.serverErrorContainer}>
                    <Text style={styles.serverErrorText}>{forgotError}</Text>
                  </View>
                ) : null}

                <View style={styles.credentialsContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={forgotEmail}
                      onChangeText={(t) => { setForgotEmail(t); setForgotError(null); }}
                      placeholder="mmustang@calpoly.edu"
                      placeholderTextColor="#c2c2c2"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      textContentType="emailAddress"
                      editable={!forgotLoading}
                    />
                  </View>
                </View>

                <View style={styles.modalBottomSection}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonPrimary, forgotLoading && styles.buttonDisabled]}
                    onPress={handleForgotSubmit}
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.buttonTextPrimary}>Send Reset Link</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView >
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
  },
  serverErrorContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tailwindColors['aura-red'],
  },
  serverErrorText: {
    fontSize: 13,
    color: tailwindColors['aura-red'],
    textAlign: "center",
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    marginTop: 48,
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
  logo: {
    marginTop: -52,
    width: 225,
    height: 225,
  },
  credentialsContainer: {
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 36,
  },
  bottomTextContainer: {
    display: "flex",
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
  inputLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    fontFamily: tailwindFonts["semibold"],
  },
  inputContainer: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#e1e2e3",
    borderBottomWidth: 1.5,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    height: 48,
    fontFamily: tailwindFonts["regular"],
  },
  passwordToggle: {},
  passwordToggleIcon: {},
  forgotPasswordText: {
    marginTop: 12,
    fontSize: 14,
    color: "#181725",
    textAlign: "right",
    fontFamily: tailwindFonts["regular"],
  },
  invalidEmailText: {
    marginTop: 4,
    fontSize: 12,
    color: tailwindColors["aura-red"],
    fontFamily: tailwindFonts["regular"],
  },
  invalidPasswordText: {
    marginTop: 4,
    fontSize: 12,
    color: tailwindColors["aura-red"],
    fontFamily: tailwindFonts["regular"],
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: tailwindFonts["semibold"],
    color: "#1F2937",
  },
  modalDescription: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: tailwindFonts["regular"],
    marginBottom: 8,
  },
  modalBottomSection: {
    marginTop: 32,
  },
  successContainer: {
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tailwindColors["aura-green"],
    padding: 16,
    marginBottom: 24,
  },
  successText: {
    fontSize: 14,
    color: tailwindColors["aura-green"],
    fontFamily: tailwindFonts["regular"],
    textAlign: "center",
  },
});

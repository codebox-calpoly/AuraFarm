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
import { useState } from "react";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { tailwindColors, tailwindFonts } from "@/constants/tailwind-colors";
import { apiSignUp, isPendingVerification } from "@/lib/api";
import { markExplicitAuthCompleted, storeSession } from "@/lib/auth";
import { setPendingSignup } from "@/lib/pendingSignup";

export default function SignUpScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showInputErrors, setShowInputErrors] = useState(false);

  const [username, setUsername] = useState("");
  const [validUsername, setValidUsername] = useState(false);
  const onChangeUsername = (text: string) => {
    setUsername(text);
    setShowInputErrors(false);
    setServerError(null);

    const validUsernameRegex = /^[A-Za-z0-9._-]+$/;
    setValidUsername(
      text.length >= 2 && text.length <= 30 && validUsernameRegex.test(text),
    );
  };

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const onChangeEmail = (text: string) => {
    setEmail(text);
    setShowInputErrors(false);
    setServerError(null);

    const normalizedEmail = text.trim().toLowerCase();
    setValidEmail(normalizedEmail.endsWith("@calpoly.edu"));
  };

  const [password, setPassword] = useState("");
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [validPassword, setValidPassword] = useState(false);
  const onChangePassword = (text: string) => {
    setPassword(text);
    setShowInputErrors(false);
    setServerError(null);

    const validPasswordRegex = /[a-zA-Z0-9!@#$%^&*()_+\-={}|;':",./.<>?~]+/;
    setValidPassword(
      text.length >= 8 && text.length <= 30 && validPasswordRegex.test(text),
    );
  };

  const handleLogin = async () => {
    router.replace("/login");
  };

  const handleSignup = async () => {
    if (!validUsername || !validEmail || !validPassword) {
      setShowInputErrors(true);
      return;
    }

    setLoading(true);
    setServerError(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await apiSignUp({
        email: normalizedEmail,
        password,
        username: username.trim(),
      });

      if (!res.success) {
        setServerError(res.error ?? "Sign up failed");
        return;
      }

      if (res.data && isPendingVerification(res.data)) {
        setPendingSignup(normalizedEmail, password);
        router.replace(
          `/verification?email=${encodeURIComponent(res.data.email)}` as never,
        );
        return;
      }

      if (res.data) {
        await storeSession({
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
          userId: res.data.user.id,
          user: res.data.user,
        });
        await markExplicitAuthCompleted();
      }

      router.replace("/(tabs)");
    } finally {
      setLoading(false);
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
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.description}>
              Enter your credentials to continue
            </Text>
          </View>

          {/* Username Input */}
          <View style={styles.credentialsContainer}>
            <Text style={styles.inputLabel}>Username</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                onChangeText={onChangeUsername}
                value={username}
                placeholder="musty_mustang"
                placeholderTextColor="#c2c2c2"
                maxLength={30}
                textContentType="username"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
            {showInputErrors && !validUsername ?
              <Text style={styles.invalidUsernameText}>
                Username must be 2-30 characters and contain only letters,
                numbers, dots, underscores, or hyphens
              </Text>
              : null}
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
              {validEmail ?
                <IconSymbol
                  size={25}
                  name="checkmark"
                  color={tailwindColors["aura-green"]}
                  style={styles.validEmailIcon}
                />
                : null}
            </View>
            {showInputErrors && !validEmail ?
              <Text style={styles.invalidEmailText}>
                Email must be @calpoly.edu
              </Text>
              : null}
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

            {showInputErrors && !validPassword ?
              <Text style={styles.invalidPasswordText}>
                Password must be 8-30 characters and contain only letters,
                numbers, and special characters
              </Text>
              : null}
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignup}
              style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonTextPrimary}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <View style={styles.bottomTextContainer}>
              <Text style={styles.bottomText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLogin} disabled={loading}>
                <Text style={[styles.bottomText, styles.bottomTextButton]}>
                  Log In
                </Text>
              </TouchableOpacity>
            </View>
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
    fontSize: 16,
    height: 48,
    fontFamily: tailwindFonts["regular"],
  },
  passwordToggle: {},
  passwordToggleIcon: {},
  validEmailIcon: {},
  invalidEmailText: {
    marginTop: 4,
    fontSize: 12,
    color: tailwindColors["aura-red"],
    fontFamily: tailwindFonts["regular"],
  },
  invalidUsernameText: {
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
});

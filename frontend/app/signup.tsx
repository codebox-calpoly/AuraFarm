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
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { tailwindColors } from "@/constants/tailwind-colors";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

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

    const validEmailRegex = /.+(@calpoly\.edu)$/;
    setValidEmail(text.length >= 13 && validEmailRegex.test(text));
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
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      const json = await response.json();

      if (!response.ok) {
        setServerError(json.error ?? json.message ?? "Sign up failed. Please try again.");
        return;
      }

      // Navigate to verification – pass the email so that screen can use it
      router.replace({
        pathname: "/verification",
        params: { email },
      });
    } catch (err) {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
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

      {/* Content Area */}
      <Animated.ScrollView
        entering={FadeInRight.duration(400)}
        exiting={FadeOutLeft.duration(400)}
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

        {/* Server Error */}
        {serverError ? (
          <View style={styles.serverErrorContainer}>
            <Text style={styles.serverErrorText}>{serverError}</Text>
          </View>
        ) : null}

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
                color={tailwindColors['aura-green']}
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
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    width: "100%",
    alignItems: "center",
    paddingTop: 32,
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
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "left",
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
    backgroundColor: tailwindColors['aura-green'],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonTextPrimary: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
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
    fontSize: 14,
    fontWeight: "600",
  },
  bottomTextButton: {
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
  },
  passwordToggle: {},
  passwordToggleIcon: {},
  validEmailIcon: {},
  invalidEmailText: {
    marginTop: 4,
    fontSize: 12,
    color: tailwindColors['aura-red'],
  },
  invalidUsernameText: {
    marginTop: 4,
    fontSize: 12,
    color: tailwindColors['aura-red'],
  },
  invalidPasswordText: {
    marginTop: 4,
    fontSize: 12,
    color: tailwindColors['aura-red'],
  },
});

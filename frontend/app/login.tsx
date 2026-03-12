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
import { supabase } from "@/lib/supabase";

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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setServerError(error.message);
      setLoading(false);
      return;
    }

    router.replace("/(tabs)");
  };

  const handleForgotPassword = async () => {
    // logic to handle forgot password
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
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
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
});

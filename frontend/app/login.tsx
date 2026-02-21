import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { tailwindColors } from "@/constants/tailwind-colors";

export default function LogInScreen() {
  const router = useRouter();

  const [showInputErrors, setShowInputErrors] = useState(false);

  const [email, setEmail] = useState("");
  const onChangeEmail = (text: string) => {
    setEmail(text);
    setShowInputErrors(false);
  };

  const [password, setPassword] = useState("");
  const [passwordHidden, setPasswordHidden] = useState(true);
  const onChangePassword = (text: string) => {
    setPassword(text);
    setShowInputErrors(false);
  };

  const handleSignup = async () => {
    router.replace("/signup");
  };

  const handleLogin = async () => {
    if (email === "" || password === "") {
      setShowInputErrors(true);
      return;
    }

    // logic to handle login
  };

  const handleForgotPassword = async () => {
    // logic to handle forgot password
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
          <Text style={styles.title}>Log In</Text>
          <Text style={styles.description}>Enter your email and password</Text>
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
            />
          </View>
          {showInputErrors && email === "" ?
            <Text style={styles.invalidEmailText}>Invalid email</Text>
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
            <Text style={styles.invalidPasswordText}>Invalid password</Text>
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
            style={[styles.button, styles.buttonPrimary]}
          >
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>

          <View style={styles.bottomTextContainer}>
            <Text style={styles.bottomText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignup}>
              <Text style={[styles.bottomText, styles.bottomTextButton]}>
                Sign Up
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
  buttonTextPrimary: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  buttonText: {
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
    fontSize: 18,
    height: 48,
  },
  passwordToggle: {},
  passwordToggleIcon: {},
  forgotPasswordText: {
    marginTop: 12,
    fontSize: 14,
    color: "#181725",
    textAlign: "right",
  },
  invalidEmailText: {
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

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

export default function SignUpScreen() {
  const router = useRouter();

  const [showInputErrors, setShowInputErrors] = useState(false);

  const [username, setUsername] = useState("");
  const [validUsername, setValidUsername] = useState(false);
  const onChangeUsername = (text: string) => {
    setUsername(text);
    setShowInputErrors(false);

    const validUsernameRegex = /[A-Za-z0-9._-]+/;
    setValidUsername(
      text.length >= 2 && text.length <= 30 && validUsernameRegex.test(text),
    );
  };

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const onChangeEmail = (text: string) => {
    setEmail(text);
    setShowInputErrors(false);

    const validEmailRegex = /.+(@calpoly\.edu)/;
    setValidEmail(text.length >= 13 && validEmailRegex.test(text));
  };

  const [password, setPassword] = useState("");
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [validPassword, setValidPassword] = useState(false);
  const onChangePassword = (text: string) => {
    setPassword(text);
    setShowInputErrors(false);

    const validPasswordRegex = /[a-zA-Z0-9!@#$%^&*()_+\-={}|;':",./<>?~]+/;
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

    router.replace("/verification");
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
            />
            {validEmail ?
              <IconSymbol
                size={25}
                name="checkmark"
                color="#4FB948"
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
            style={[styles.button, styles.buttonPrimary]}
          >
            <Text style={styles.buttonTextPrimary}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.bottomTextContainer}>
            <Text style={styles.bottomText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLogin}>
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
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
    backgroundColor: "#4FB948",
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
    color: "#D8143A",
  },
  invalidUsernameText: {
    marginTop: 4,
    fontSize: 12,
    color: "#D8143A",
  },
  invalidPasswordText: {
    marginTop: 4,
    fontSize: 12,
    color: "#D8143A",
  },
});

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { IconSymbol } from "@/components/ui/icon-symbol";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignUpScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const onChangeUsername = (text: string) => {
    setUsername(text);
  };

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const onChangeEmail = (text: string) => {
    setEmail(text);

    const validEmailRegex = /.+(@calpoly\.edu)/;
    setValidEmail(validEmailRegex.test(text));
  };

  const [password, setPassword] = useState("");
  const [passwordHidden, setPasswordHidden] = useState(true);
  const onChangePassword = (text: string) => {
    setPassword(text);
  };

  const handleLogin = async () => {
    router.replace("/login");
  };

  const handleSignup = async () => {
    router.replace("/verification");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          style={styles.logo}
          source={require("../assets/images/red-logo.png")}
          resizeMode="contain"
        />
      </View>

      {/* Content Area */}
      <Animated.View
        entering={FadeInRight.duration(400)}
        exiting={FadeOutLeft.duration(400)}
        style={styles.contentContainer}
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
            />
          </View>
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
          {!validEmail && email !== "" ?
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
        </View>
      </Animated.View>

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
  },
  pagination: {
    flexDirection: "row",
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 32,
    backgroundColor: "#000000",
  },
  dotInactive: {
    width: 8,
    backgroundColor: "#D1D5DB",
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
});

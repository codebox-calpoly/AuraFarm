import EditIcon from "@/assets/EditIcon.svg";
import ProfileImage from "@/assets/ProfileImage.svg";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { setAuthenticated } from "@/lib/auth";
import { Header } from "@/components/home/Header";
import { tailwindColors, tailwindFonts } from "@/constants/tailwind-colors";

const BASE_WIDTH = 414;

export default function SettingsScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("jeffbob");
  const [email, setEmail] = useState("bob@calpoly.edu");

  // Password editing state
  const [showPasswordEditor, setShowPasswordEditor] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const usernameInputRef = useRef<TextInput>(null);
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const scale = width / BASE_WIDTH;

  const handleLogOut = async () => {
    await setAuthenticated(false);
    router.replace("/login");
  };

  const handleChangePassword = async () => {
    setError("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      Alert.alert("Success", "Password updated successfully");

      setShowPasswordEditor(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Failed to update password");
    }
  };

  const handleCancelPasswordEdit = () => {
    setShowPasswordEditor(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <Header />

      <View style={[styles.container, { paddingHorizontal: 30 * scale }]}>
        {/* Title */}
        <Text
          style={[
            styles.title,
            {
              marginTop: 44 * scale,
              fontSize: 28 * scale,
              lineHeight: 36 * scale,
            },
          ]}
        >
          Settings
        </Text>

        <View
          style={[
            styles.profileWrap,
            { marginTop: 66 * scale, marginBottom: 58 * scale },
          ]}
        >
          <ProfileImage width={72 * scale} height={72 * scale} />
        </View>

        <View style={[styles.fieldsBlock, { gap: 30 * scale }]}>
          <View style={styles.fieldRow}>
            <View style={styles.fieldTextWrap}>
              <Text
                style={[
                  styles.label,
                  { fontSize: 22 * scale, lineHeight: 30 * scale },
                ]}
              >
                Username:
              </Text>
              <TextInput
                ref={usernameInputRef}
                value={username}
                onChangeText={setUsername}
                style={[styles.valueInput, { fontSize: 24 * scale }]}
              />
            </View>
            <Pressable
              onPress={() => usernameInputRef.current?.focus()}
              hitSlop={8}
            >
              <EditIcon width={26 * scale} height={26 * scale} />
            </Pressable>
          </View>

          {/* Email */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldTextWrap}>
              <Text
                style={[
                  styles.label,
                  { fontSize: 22 * scale, lineHeight: 30 * scale },
                ]}
              >
                Email:
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={[
                  styles.valueInput,
                  { fontSize: 24 * scale, lineHeight: 30 * scale },
                ]}
                placeholder="email"
                placeholderTextColor="#70707f"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Section */}
          {!showPasswordEditor ?
            <View style={styles.fieldRow}>
              <View style={styles.fieldTextWrap}>
                <Text style={[styles.label, { fontSize: 22 * scale }]}>
                  Password:
                </Text>
                <Text style={[styles.valueInput, { fontSize: 24 * scale }]}>
                  ••••••••
                </Text>
              </View>
              <Pressable onPress={() => setShowPasswordEditor(true)}>
                <EditIcon width={26 * scale} height={26 * scale} />
              </Pressable>
            </View>
          : <View style={{ gap: 12 }}>
              <TextInput
                placeholder="Current password"
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
                style={styles.passwordInput}
              />
              <TextInput
                placeholder="New password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.passwordInput}
              />
              <TextInput
                placeholder="Confirm new password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.passwordInput}
              />

              {error ?
                <Text style={{ color: "red", fontSize: 14 }}>{error}</Text>
              : null}

              <View style={{ flexDirection: "row", gap: 12 }}>
                <Pressable
                  style={[styles.saveButton, { flex: 1 }]}
                  onPress={handleChangePassword}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </Pressable>

                <Pressable
                  style={[styles.cancelButton, { flex: 1 }]}
                  onPress={handleCancelPasswordEdit}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          }
        </View>

        {/* Logout (hidden while editing password) */}
        {!showPasswordEditor && (
          <View
            style={[
              styles.footer,
              { paddingBottom: tabBarHeight + 18 * scale },
            ]}
          >
            <Pressable
              style={[styles.logoutButton, { borderRadius: 18 * scale }]}
              onPress={handleLogOut}
            >
              <Text style={styles.buttonText}>Log Out</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tailwindColors["aura-white"],
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    textAlign: "center",
    fontFamily: tailwindFonts["semibold"],
  },
  profileWrap: {
    alignItems: "center",
  },
  fieldsBlock: {
    width: "100%",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldTextWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 6,
  },
  label: {
    fontFamily: tailwindFonts["semibold"],
  },
  valueInput: {
    flex: 1,
    fontFamily: tailwindFonts["regular"],
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    fontFamily: tailwindFonts["regular"],
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ddd",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#d60218",
    padding: 18,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 20,
    color: "#fff",
    fontFamily: tailwindFonts["semibold"],
  },
  cancelText: {
    color: "#333",
    fontFamily: tailwindFonts["semibold"],
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
  },
});

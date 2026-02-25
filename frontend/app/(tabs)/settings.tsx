import AuraFarmHeader from "@/assets/AuraFarmHeader.svg";
import EditIcon from "@/assets/EditIcon.svg";
import ProfileImage from "@/assets/ProfileImage.svg";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRef, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { setAuthenticated } from "@/lib/auth";

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
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingHorizontal: 30 * scale }]}>
        {/* Header */}
        <View style={styles.headerWrap}>
  <AuraFarmHeader width={153} height={27} />
</View>

        {/* Title */}
        <Text
          style={[
            styles.title,
            {
              marginTop: 44 * scale,
              fontSize: 24 * scale,
              lineHeight: 30 * scale,
            },
          ]}
        >
          Settings
        </Text>

        <View style={[styles.profileWrap, { marginTop: 66 * scale, marginBottom: 58 * scale }]}>
          <ProfileImage width={72 * scale} height={72 * scale} />
        </View>

        <View style={[styles.fieldsBlock, { gap: 30 * scale }]}>
          <View style={styles.fieldRow}>
            <View style={styles.fieldTextWrap}>
              <Text style={[styles.label, { fontSize: 24 * scale, lineHeight: 30 * scale }]}>
                username:
              </Text>
              <TextInput
                ref={usernameInputRef}
                value={username}
                onChangeText={setUsername}
                style={[styles.valueInput, { fontSize: 24 * scale }]}
              />
            </View>
            <Pressable onPress={() => usernameInputRef.current?.focus()} hitSlop={8}>
              <EditIcon width={26 * scale} height={26 * scale} />
            </Pressable>
          </View>

          {/* Email */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldTextWrap}>
              <Text style={[styles.label, { fontSize: 24 * scale, lineHeight: 30 * scale }]}>
                email:
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={[styles.valueInput, { fontSize: 24 * scale, lineHeight: 30 * scale }]}
                placeholder="email"
                placeholderTextColor="#70707f"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Section */}
          {!showPasswordEditor ? (
            <View style={styles.fieldRow}>
              <View style={styles.fieldTextWrap}>
                <Text style={[styles.label, { fontSize: 24 * scale }]}>
                  password:
                </Text>
                <Text style={[styles.valueInput, { fontSize: 24 * scale }]}>
                  ••••••••
                </Text>
              </View>
              <Pressable onPress={() => setShowPasswordEditor(true)}>
                <EditIcon width={26 * scale} height={26 * scale} />
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
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

              {error ? (
                <Text style={{ color: "red", fontSize: 14 }}>{error}</Text>
              ) : null}

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
          )}
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
              <Text style={styles.buttonText}>Log out</Text>
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
    backgroundColor: "#e8e8e8",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24, 
    paddingTop: 28, 
  },
  headerWrap: {
    alignItems: "center",
    marginTop: 8,
  },
  title: {
    textAlign: "center",
    fontWeight: "600",
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
    fontWeight: "600",
  },
  valueInput: {
    flex: 1,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
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
    color: "#fff",
    fontWeight: "600",
  },
  cancelText: {
    color: "#333",
    fontWeight: "600",
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
  },
});

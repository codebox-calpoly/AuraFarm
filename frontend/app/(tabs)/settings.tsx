import EditIcon from "@/assets/EditIcon.svg";
import ProfileImage from "@/assets/ProfileImage.svg";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { apiBaseUrl, changePassword as apiChangePassword } from "@/lib/api";
import { getSession, clearSession } from "@/lib/auth";
import { Header } from "@/components/home/Header";
import { tailwindColors, tailwindFonts } from "@/constants/tailwind-colors";

const BASE_WIDTH = 414;
const API_URL = apiBaseUrl();

export default function SettingsScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [email, setEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");

  const [showPasswordEditor, setShowPasswordEditor] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const usernameInputRef = useRef<TextInput>(null);
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const scale = width / BASE_WIDTH;

  const getToken = async (): Promise<string | null> => {
    const session = await getSession();
    return session?.accessToken ?? null;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getToken();
        if (!token) {
          router.replace("/login");
          return;
        }
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success && json.data) {
          setUsername(json.data.name ?? "");
          setOriginalUsername(json.data.name ?? "");
          setEmail(json.data.email ?? "");
          setOriginalEmail((json.data.email ?? "").toLowerCase());
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveUsername = async () => {
    if (username === originalUsername) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/users/me`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: username }),
      });
      const json = await res.json();
      if (json.success) {
        setOriginalUsername(username);
        Alert.alert("Success", "Username updated!");
      } else {
        Alert.alert("Error", json.message ?? "Failed to update username.");
      }
    } catch {
      Alert.alert("Error", "Network error. Please try again.");
    }
  };

  const handleLogOut = async () => {
    try {
      await clearSession();
      router.replace("/login");
    } catch (err) {
      console.error("Error signing out:", err);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
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
    if (newPassword === oldPassword) {
      setError("New password must be different from current password");
      return;
    }
    try {
      const res = await apiChangePassword(oldPassword, newPassword);
      if (!res.success) {
        setError(res.error ?? "Failed to update password");
        return;
      }
      Alert.alert("Success", "Password updated successfully");
      setShowPasswordEditor(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  const handleCancelPasswordEdit = () => {
    setShowPasswordEditor(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header />

      <View style={[styles.container, { paddingHorizontal: 24 * scale }]}>
        <Text style={[styles.settingsTitle, { fontSize: 28 * scale, marginTop: 16 * scale }]}>
          Settings
        </Text>

        <View style={[styles.avatarWrap, { marginTop: 32 * scale }]}>
          <ProfileImage width={80 * scale} height={80 * scale} />
        </View>

        <View style={[styles.fieldsBlock, { marginTop: 40 * scale, gap: 24 * scale }]}>
          {/* Username */}
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { fontSize: 18 * scale }]}>username: </Text>
            <TextInput
              ref={usernameInputRef}
              value={username}
              onChangeText={setUsername}
              style={[styles.fieldValueInput, { fontSize: 18 * scale }]}
            />
            <Pressable
              onPress={() => usernameInputRef.current?.focus()}
              hitSlop={8}
              style={styles.pencilWrap}
            >
              <EditIcon width={22 * scale} height={22 * scale} />
            </Pressable>
          </View>
          {username !== originalUsername && (
            <View style={styles.editActions}>
              <Pressable style={styles.saveBtn} onPress={handleSaveUsername}>
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
              <Pressable style={styles.cancelBtn} onPress={() => setUsername(originalUsername)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
            </View>
          )}

          {/* Email - read only */}
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { fontSize: 18 * scale }]}>email: </Text>
            <Text style={[styles.fieldValue, { fontSize: 18 * scale }]} numberOfLines={1}>
              {email}
            </Text>
          </View>

          {/* Password */}
          {!showPasswordEditor ? (
            <View style={styles.fieldRow}>
              <Text style={[styles.fieldLabel, { fontSize: 18 * scale }]}>password: </Text>
              <Text style={[styles.fieldValue, { fontSize: 18 * scale }]}>**********</Text>
              <Pressable onPress={() => setShowPasswordEditor(true)} hitSlop={8} style={styles.pencilWrap}>
                <EditIcon width={22 * scale} height={22 * scale} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.passwordEditor}>
              <TextInput
                placeholder="Current password"
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
                style={styles.passwordInput}
                placeholderTextColor="#9CA3AF"
              />
              <TextInput
                placeholder="New password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.passwordInput}
                placeholderTextColor="#9CA3AF"
              />
              <TextInput
                placeholder="Confirm new password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.passwordInput}
                placeholderTextColor="#9CA3AF"
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <View style={styles.editActions}>
                <Pressable style={styles.saveBtn} onPress={handleChangePassword}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </Pressable>
                <Pressable style={styles.cancelBtn} onPress={handleCancelPasswordEdit}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {!showPasswordEditor && (
          <View style={[styles.footer, { paddingBottom: tabBarHeight + 24 * scale }]}>
            <Pressable style={[styles.logoutButton, { borderRadius: 18 * scale }]} onPress={handleLogOut}>
              <Text style={styles.logoutText}>Log out</Text>
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
    backgroundColor: tailwindColors["aura-page"],
  },
  container: {
    flex: 1,
  },
  settingsTitle: {
    textAlign: "center",
    fontFamily: tailwindFonts["bold"],
    color: tailwindColors["aura-black"],
  },
  avatarWrap: {
    alignItems: "center",
  },
  fieldsBlock: {
    width: "100%",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  fieldLabel: {
    fontFamily: tailwindFonts["semibold"],
    color: tailwindColors["aura-black"],
  },
  fieldValue: {
    flex: 1,
    fontFamily: tailwindFonts["regular"],
    color: tailwindColors["aura-black"],
  },
  fieldValueInput: {
    flex: 1,
    fontFamily: tailwindFonts["regular"],
    color: tailwindColors["aura-black"],
    padding: 0,
    margin: 0,
  },
  pencilWrap: {
    marginLeft: 8,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  saveBtn: {
    backgroundColor: tailwindColors["aura-green"],
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  saveBtnText: {
    color: "#fff",
    fontFamily: tailwindFonts["semibold"],
    fontSize: 16,
  },
  cancelBtn: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  cancelBtnText: {
    color: tailwindColors["aura-black"],
    fontFamily: tailwindFonts["semibold"],
    fontSize: 16,
  },
  passwordEditor: {
    gap: 12,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 14,
    borderRadius: 10,
    fontFamily: tailwindFonts["regular"],
    fontSize: 16,
  },
  errorText: {
    color: tailwindColors["aura-red"],
    fontSize: 14,
    fontFamily: tailwindFonts["regular"],
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  logoutButton: {
    backgroundColor: tailwindColors["aura-red"],
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  logoutText: {
    fontSize: 18,
    fontFamily: tailwindFonts["semibold"],
    color: "#fff",
  },
});

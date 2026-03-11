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
import { supabase } from "@/lib/supabase";
import Constants from "expo-constants";
import { Header } from "@/components/home/Header";
import { tailwindColors, tailwindFonts } from "@/constants/tailwind-colors";

const BASE_WIDTH = 414;
const API_URL = Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:3000";

export default function SettingsScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [email, setEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");

  // Password editing state
  const [showPasswordEditor, setShowPasswordEditor] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const usernameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const scale = width / BASE_WIDTH;

  // Helper: get Bearer token from current Supabase session
  const getToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  // Load user profile on mount
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
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  const handleSaveEmail = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (normalizedEmail === originalEmail) return;

    if (!emailRegex.test(normalizedEmail)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    const { error: supabaseError } = await supabase.auth.updateUser({
      email: normalizedEmail,
    });

    if (supabaseError) {
      Alert.alert("Error", supabaseError.message);
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "You are not authenticated.");
        return;
      }

      const res = await fetch(`${API_URL}/api/users/me`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const json = await res.json();
      if (!json.success) {
        Alert.alert("Error", json.message ?? "Failed to update email in app profile.");
        return;
      }

      setEmail(normalizedEmail);
      setOriginalEmail(normalizedEmail);
      await supabase.auth.signOut();
      Alert.alert("Success", "Email updated. Check your inbox if confirmation is required, then log in again.", [
        {
          text: "OK",
          onPress: () => router.replace("/login"),
        },
      ]);
    } catch {
      Alert.alert("Error", "Network error. Please try again.");
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

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      setError("Unable to verify current user");
      return;
    }

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });
    if (reauthError) {
      setError("Current password is incorrect");
      return;
    }

    const { error: supabaseError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (supabaseError) {
      setError(supabaseError.message);
      return;
    }

    Alert.alert("Success", "Password updated successfully");
    setShowPasswordEditor(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
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
          {/* Username */}
          <View>
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
            {username !== originalUsername && (
              <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                <Pressable
                  style={[styles.saveButton, { flex: 1 }]}
                  onPress={handleSaveUsername}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </Pressable>
                <Pressable
                  style={[styles.cancelButton, { flex: 1 }]}
                  onPress={() => setUsername(originalUsername)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Email */}
          <View>
            <View style={styles.fieldRow}>
              <View style={styles.fieldTextWrap}>
                <Text style={[styles.label, { fontSize: 24 * scale, lineHeight: 30 * scale }]}>
                  email:
                </Text>
                <TextInput
                  ref={emailInputRef}
                  value={email}
                  onChangeText={setEmail}
                  style={[styles.valueInput, { fontSize: 24 * scale, lineHeight: 30 * scale }]}
                  placeholder="email"
                  placeholderTextColor="#70707f"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <Pressable onPress={() => emailInputRef.current?.focus()} hitSlop={8}>
                <EditIcon width={26 * scale} height={26 * scale} />
              </Pressable>
            </View>
            {email.trim().toLowerCase() !== originalEmail && (
              <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                <Pressable
                  style={[styles.saveButton, { flex: 1 }]}
                  onPress={handleSaveEmail}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </Pressable>
                <Pressable
                  style={[styles.cancelButton, { flex: 1 }]}
                  onPress={() => setEmail(originalEmail)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            )}
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

import EditIcon from "@/assets/EditIcon.svg";
import ProfileImage from "@/assets/ProfileImage.svg";
import { Header } from "@/components/home/Header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { cardShadow, layout, radius, spacing } from "@/constants/design";
import { tailwindColors, tailwindFonts } from "@/constants/tailwind-colors";
import {
  changePassword as apiChangePassword,
  getCurrentUserFromApi,
  updateCurrentUserProfile,
} from "@/lib/api";
import { clearSession, getValidSession, storeSession } from "@/lib/auth";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BASE_WIDTH = 414;

export default function SettingsScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [email, setEmail] = useState("");

  const [showPasswordEditor, setShowPasswordEditor] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const usernameInputRef = useRef<TextInput>(null);
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const scale = width / BASE_WIDTH;

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      try {
        const session = await getValidSession();
        if (!session) {
          router.replace("/login");
          return;
        }
        // Show cached identity immediately (login/verify store user on device)
        if (session.user?.name || session.user?.email) {
          setUsername(session.user.name ?? "");
          setOriginalUsername(session.user.name ?? "");
          setEmail(session.user.email ?? "");
        }
        const json = await getCurrentUserFromApi();
        if (cancelled) return;
        if (json.success && json.data) {
          const d = json.data;
          setUsername(d.name ?? "");
          setOriginalUsername(d.name ?? "");
          setEmail(d.email ?? "");
          const fresh = await getValidSession();
          if (fresh) {
            await storeSession({
              ...fresh,
              user: {
                id: d.id,
                email: d.email,
                name: d.name,
                auraPoints: d.auraPoints,
                streak: d.streak,
              },
            });
          }
        } else if (!session.user?.email) {
          console.warn("Settings: profile fetch failed", json.error);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSaveUsername = async () => {
    if (username === originalUsername) return;
    try {
      const json = await updateCurrentUserProfile({ name: username });
      if (json.success && json.data) {
        setOriginalUsername(username);
        const s = await getValidSession();
        if (s) {
          await storeSession({
            ...s,
            user: {
              id: json.data.id,
              name: json.data.name,
              email: json.data.email,
              auraPoints: s.user?.auraPoints,
              streak: s.user?.streak,
            },
          });
        }
        Alert.alert("Saved", "Your display name was updated.");
      } else {
        Alert.alert("Error", json.error ?? "Could not update name.");
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
      Alert.alert("Error", "Could not sign out. Try again.");
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
      setError("New password must be different from your current password");
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
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    // Defer collapse so the touch release does not hit the Logout row that appears below.
    setTimeout(() => setShowPasswordEditor(false), 400);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingWrap]}>
        <Header />
        <ActivityIndicator size="large" color={tailwindColors["aura-green"]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: tabBarHeight + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ThemedText style={styles.pageTitle}>Settings</ThemedText>
          <ThemedText style={styles.pageSubtitle}>
            Manage your profile and account security
          </ThemedText>

          {/* Profile hero — soft disc behind icon so the glyph stays inside (no ring through shoulders) */}
          <ThemedView
            style={[styles.profileCard, cardShadow(3)]}
            lightColor={tailwindColors["aura-surface"]}
          >
            <View
              style={[
                styles.avatarDisc,
                {
                  width: Math.min(104, 104 * scale),
                  height: Math.min(104, 104 * scale),
                  borderRadius: Math.min(52, 52 * scale),
                },
              ]}
            >
              <ProfileImage width={Math.min(72, 72 * scale)} height={Math.min(72, 72 * scale)} />
            </View>
            <ThemedText style={styles.profileName} numberOfLines={1}>
              {username || "Your profile"}
            </ThemedText>
            <View style={styles.emailRow}>
              <Ionicons
                name="mail-outline"
                size={16}
                color={tailwindColors["aura-gray-500"]}
              />
              <ThemedText style={styles.profileEmail} numberOfLines={1}>
                {email || "—"}
              </ThemedText>
            </View>
          </ThemedView>

          {/* Account */}
          <ThemedText style={styles.sectionLabel}>Account</ThemedText>
          <ThemedView
            style={[styles.card, cardShadow(2)]}
            lightColor={tailwindColors["aura-surface"]}
          >
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Display name</ThemedText>
              <View style={styles.inputRow}>
                <TextInput
                  ref={usernameInputRef}
                  value={username}
                  onChangeText={setUsername}
                  style={styles.textInput}
                  placeholder="Your name"
                  placeholderTextColor={tailwindColors["aura-gray-400"]}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={() => usernameInputRef.current?.focus()}
                  hitSlop={10}
                  style={styles.iconBtn}
                >
                  <EditIcon width={22} height={22} />
                </Pressable>
              </View>
              {username !== originalUsername ? (
                <View style={styles.inlineActions}>
                  <Pressable style={styles.primaryBtn} onPress={handleSaveUsername}>
                    <Text style={styles.primaryBtnText}>Save name</Text>
                  </Pressable>
                  <Pressable
                    style={styles.secondaryBtn}
                    onPress={() => setUsername(originalUsername)}
                  >
                    <Text style={styles.secondaryBtnText}>Cancel</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>

            <View style={styles.divider} />

            <View style={styles.readOnlyBlock}>
              <ThemedText style={styles.inputLabel}>Email</ThemedText>
              <View style={styles.readOnlyRow}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={tailwindColors["aura-gray-400"]}
                />
                <Text style={styles.readOnlyText} numberOfLines={1}>
                  {email}
                </Text>
              </View>
              <ThemedText style={styles.hint}>Email cannot be changed here</ThemedText>
            </View>
          </ThemedView>

          {/* Security */}
          <ThemedText style={styles.sectionLabel}>Security</ThemedText>
          <ThemedView
            style={[styles.card, cardShadow(2)]}
            lightColor={tailwindColors["aura-surface"]}
          >
            {!showPasswordEditor ? (
              <Pressable
                style={styles.securityRow}
                onPress={() => setShowPasswordEditor(true)}
              >
                <View style={styles.securityLeft}>
                  <View style={styles.securityIconBg}>
                    <Ionicons
                      name="key-outline"
                      size={20}
                      color={tailwindColors["aura-green"]}
                    />
                  </View>
                  <View>
                    <ThemedText style={styles.securityTitle}>Password</ThemedText>
                    <ThemedText style={styles.securitySubtitle}>
                      Update your sign-in password
                    </ThemedText>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={tailwindColors["aura-gray-400"]}
                />
              </Pressable>
            ) : (
              <View style={styles.passwordBlock}>
                <ThemedText style={styles.inputLabel}>Change password</ThemedText>
                <TextInput
                  placeholder="Current password"
                  secureTextEntry
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  style={styles.passwordField}
                  placeholderTextColor={tailwindColors["aura-gray-400"]}
                />
                <TextInput
                  placeholder="New password (8+ characters)"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={styles.passwordField}
                  placeholderTextColor={tailwindColors["aura-gray-400"]}
                />
                <TextInput
                  placeholder="Confirm new password"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={styles.passwordField}
                  placeholderTextColor={tailwindColors["aura-gray-400"]}
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <View style={styles.inlineActions}>
                  <Pressable style={styles.primaryBtn} onPress={handleChangePassword}>
                    <Text style={styles.primaryBtnText}>Update password</Text>
                  </Pressable>
                  <Pressable
                    style={styles.secondaryBtn}
                    onPress={handleCancelPasswordEdit}
                    hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                  >
                    <Text style={styles.secondaryBtnText}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ThemedView>

          {/* Sign out — always mounted; disabled while password editor open to avoid accidental tap after Cancel */}
          <Pressable
            style={[
              styles.logoutCard,
              cardShadow(2),
              showPasswordEditor && styles.logoutCardHidden,
            ]}
            onPress={handleLogOut}
            disabled={showPasswordEditor}
          >
            <Ionicons name="log-out-outline" size={22} color={tailwindColors["aura-red"]} />
            <Text style={styles.logoutLabel}>Log out</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: {
    flex: 1,
    backgroundColor: tailwindColors["aura-page"],
  },
  loadingWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.sm,
  },
  pageTitle: {
    fontFamily: tailwindFonts["bold"],
    fontSize: 28,
    color: tailwindColors["aura-black"],
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  pageSubtitle: {
    fontFamily: tailwindFonts["regular"],
    fontSize: 15,
    color: tailwindColors["aura-gray-500"],
    marginBottom: spacing.lg,
  },
  profileCard: {
    alignItems: "center",
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tailwindColors["aura-border"],
  },
  avatarDisc: {
    backgroundColor: tailwindColors["aura-green-light"],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(45, 138, 94, 0.22)",
  },
  profileName: {
    fontFamily: tailwindFonts["semibold"],
    fontSize: 22,
    color: tailwindColors["aura-black"],
    textAlign: "center",
    maxWidth: "100%",
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  profileEmail: {
    fontFamily: tailwindFonts["regular"],
    fontSize: 14,
    color: tailwindColors["aura-gray-600"],
    flex: 1,
  },
  sectionLabel: {
    fontFamily: tailwindFonts["semibold"],
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: tailwindColors["aura-gray-500"],
    marginBottom: spacing.sm,
    marginLeft: 2,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tailwindColors["aura-border"],
  },
  inputGroup: { marginBottom: 0 },
  inputLabel: {
    fontFamily: tailwindFonts["semibold"],
    fontSize: 13,
    color: tailwindColors["aura-gray-600"],
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tailwindColors["aura-gray-100"],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontFamily: tailwindFonts["regular"],
    fontSize: 16,
    color: tailwindColors["aura-black"],
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },
  iconBtn: { padding: 4 },
  inlineActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  primaryBtn: {
    backgroundColor: tailwindColors["aura-green"],
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.md,
  },
  primaryBtnText: {
    color: "#fff",
    fontFamily: tailwindFonts["semibold"],
    fontSize: 15,
  },
  secondaryBtn: {
    backgroundColor: tailwindColors["aura-gray-200"],
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.md,
  },
  secondaryBtnText: {
    color: tailwindColors["aura-gray-700"],
    fontFamily: tailwindFonts["semibold"],
    fontSize: 15,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: tailwindColors["aura-border"],
    marginVertical: spacing.md,
  },
  readOnlyBlock: {},
  readOnlyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: tailwindColors["aura-surface-muted"],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  readOnlyText: {
    flex: 1,
    fontFamily: tailwindFonts["regular"],
    fontSize: 16,
    color: tailwindColors["aura-gray-600"],
  },
  hint: {
    fontFamily: tailwindFonts["regular"],
    fontSize: 12,
    color: tailwindColors["aura-gray-400"],
    marginTop: spacing.sm,
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  securityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  securityIconBg: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: tailwindColors["aura-green-light"],
    alignItems: "center",
    justifyContent: "center",
  },
  securityTitle: {
    fontFamily: tailwindFonts["semibold"],
    fontSize: 16,
    color: tailwindColors["aura-black"],
  },
  securitySubtitle: {
    fontFamily: tailwindFonts["regular"],
    fontSize: 13,
    color: tailwindColors["aura-gray-500"],
    marginTop: 2,
  },
  passwordBlock: { gap: spacing.sm },
  passwordField: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tailwindColors["aura-border-strong"],
    backgroundColor: tailwindColors["aura-gray-50"],
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    borderRadius: radius.md,
    fontFamily: tailwindFonts["regular"],
    fontSize: 16,
    color: tailwindColors["aura-black"],
  },
  errorText: {
    color: tailwindColors["aura-red"],
    fontSize: 14,
    fontFamily: tailwindFonts["regular"],
    marginTop: spacing.xs,
  },
  logoutCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: tailwindColors["aura-surface"],
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tailwindColors["aura-border"],
  },
  logoutCardHidden: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
    paddingVertical: 0,
    overflow: "hidden",
    borderWidth: 0,
  },
  logoutLabel: {
    fontFamily: tailwindFonts["semibold"],
    fontSize: 16,
    color: tailwindColors["aura-red"],
  },
});

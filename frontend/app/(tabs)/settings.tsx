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
} from "react-native";

const BASE_WIDTH = 414;

export default function SettingsScreen() {
  const [username, setUsername] = useState("jeffbob");
  const [email, setEmail] = useState("bob@calpoly.edu");
  const [password, setPassword] = useState("password123");

  const usernameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const scale = width / BASE_WIDTH;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingHorizontal: 30 * scale }]}>
        <View style={[styles.headerWrap, { marginTop: 22 * scale }]}>
          <AuraFarmHeader width={153 * scale} height={27 * scale} />
        </View>

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
                style={[styles.valueInput, { fontSize: 24 * scale, lineHeight: 30 * scale }]}
                placeholder="username"
                placeholderTextColor="#70707f"
              />
            </View>
            <Pressable onPress={() => usernameInputRef.current?.focus()} hitSlop={8}>
              <EditIcon width={26 * scale} height={26 * scale} />
            </Pressable>
          </View>

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

          <View style={styles.fieldRow}>
            <View style={styles.fieldTextWrap}>
              <Text style={[styles.label, { fontSize: 24 * scale, lineHeight: 30 * scale }]}>
                password:
              </Text>
              <TextInput
                ref={passwordInputRef}
                value={password}
                onChangeText={setPassword}
                style={[styles.valueInput, { fontSize: 24 * scale, lineHeight: 30 * scale }]}
                placeholder="password"
                placeholderTextColor="#70707f"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            <Pressable onPress={() => passwordInputRef.current?.focus()} hitSlop={8}>
              <EditIcon width={26 * scale} height={26 * scale} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: tabBarHeight + 18 * scale }]}>
          <Pressable style={[styles.logoutButton, { height: 63 * scale, borderRadius: 18 * scale }]}>
            <Text style={[styles.logoutText, { fontSize: 24 * scale, lineHeight: 30 * scale }]}>
              Log out
            </Text>
          </Pressable>
        </View>
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
  },
  headerWrap: {
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    fontWeight: "600",
    color: "#030303",
  },
  profileWrap: {
    alignItems: "center",
  },
  fieldsBlock: {
    paddingHorizontal: 4,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 32,
  },
  fieldTextWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  label: {
    fontWeight: "600",
    color: "#1e1e30",
    letterSpacing: 0.1,
  },
  valueInput: {
    flex: 1,
    minWidth: 0,
    fontWeight: "400",
    color: "#1e1e30",
    letterSpacing: 0.1,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  logoutButton: {
    width: "100%",
    backgroundColor: "#d60218",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: 0.1,
  },
});

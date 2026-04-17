import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { TabBarGlyph } from "@/components/tab-bar-glyph";
import { tailwindColors, tailwindFonts } from "@/constants/tailwind-colors";
import { isAuthenticated } from "@/lib/auth";

export default function TabLayout() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    isAuthenticated().then((loggedIn) => {
      setChecking(false);
      if (!loggedIn) {
        router.replace("/login");
      }
    });
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: false,
        tabBarActiveTintColor: tailwindColors["aura-green"],
        tabBarInactiveTintColor: tailwindColors["aura-gray-400"],
        tabBarLabelStyle: {
          fontFamily: tailwindFonts["semibold"],
          fontSize: 10,
          marginTop: 2,
        },
        tabBarItemStyle: styles.tabBarItem,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: "#E7E5E4",
          minHeight: 56 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarAccessibilityLabel: "Home",
          tabBarIcon: ({ focused }) => (
            <TabBarGlyph
              tab="home"
              focused={focused}
              windowWidth={width}
              accessibilityLabel="Home"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ranks"
        options={{
          title: "Ranks",
          tabBarAccessibilityLabel: "Ranks",
          tabBarIcon: ({ focused }) => (
            <TabBarGlyph
              tab="ranks"
              focused={focused}
              windowWidth={width}
              accessibilityLabel="Ranks"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="aura"
        options={{
          title: "Aura",
          tabBarAccessibilityLabel: "Aura",
          tabBarIcon: ({ focused }) => (
            <TabBarGlyph
              tab="aura"
              focused={focused}
              windowWidth={width}
              accessibilityLabel="Aura"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          tabBarAccessibilityLabel: "Friends",
          tabBarIcon: ({ focused }) => (
            <TabBarGlyph
              tab="friends"
              focused={focused}
              windowWidth={width}
              accessibilityLabel="Friends"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarAccessibilityLabel: "Settings",
          tabBarIcon: ({ focused }) => (
            <TabBarGlyph
              tab="settings"
              focused={focused}
              windowWidth={width}
              accessibilityLabel="Settings"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarItem: {
    flex: 1,
  },
});

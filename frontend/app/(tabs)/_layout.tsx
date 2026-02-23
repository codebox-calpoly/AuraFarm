import { Tabs } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tabIconSelected,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#EBEBEB',
          height: 75,
          paddingBottom: 12,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? require('@/assets/images/home tab.png') : require('@/assets/images/home tab_grey.png')}
              style={{ width: 38, height: 38 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ranks"
        options={{
          title: 'Ranks',
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? require('@/assets/images/ranks tab.png') : require('@/assets/images/ranks tab_grey.png')}
              style={{ width: 60, height: 60 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="aura"
        options={{
          title: 'Aura',
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? require('@/assets/images/aura tab.png') : require('@/assets/images/aura tab_grey.png')}
              style={{ width: 60, height: 60 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? require('@/assets/images/settings tab.png') : require('@/assets/images/settings tab_grey.png')}
              style={{ width: 38, height: 38 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide explore tab as requested by the footer design
        }}
      />
    </Tabs>
  );
}

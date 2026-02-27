import AuraFarmHeader from "@/assets/AuraFarmHeader.svg";
import ProfileImage from "@/assets/ProfileImage.svg";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

type LeaderboardSection = {
  id: string;
  label: string;
  color: string;
};

const SECTIONS: LeaderboardSection[] = [
  { id: "red", label: "Red Aura", color: "#CC0A19" },
  { id: "orange", label: "Orange Aura", color: "#F38E08" },
  { id: "yellow", label: "Yellow Aura", color: "#FFD609" },
  { id: "green", label: "Green Aura", color: "#4CBF50" },
  { id: "blue", label: "Blue Aura", color: "#2E2EFA" },
  { id: "purple", label: "Purple Aura", color: "#981CFC" },
  { id: "gray", label: "Gray Aura", color: "#4A4A4A" },
];

function hexToRgba(hex: string, alpha: number) {
  const cleaned = hex.replace("#", "");
  const value = parseInt(cleaned, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function AuraIcon({ color }: { color: string }) {
  return (
    <Svg width={34} height={34} viewBox="0 0 34 34" fill="none">
      <Path
        d="M17 3.5C19.2 11.1 22.4 14.3 30 17C22.4 19.7 19.2 22.9 17 30.5C14.8 22.9 11.6 19.7 4 17C11.6 14.3 14.8 11.1 17 3.5Z"
        fill="#FFFFFF"
        stroke={color}
        strokeWidth={2.8}
      />
    </Svg>
  );
}

function AuraShadowIcon() {
  return (
    <Svg width={34} height={34} viewBox="0 0 34 34" fill="none">
      <Path
        d="M17 3.5C19.2 11.1 22.4 14.3 30 17C22.4 19.7 19.2 22.9 17 30.5C14.8 22.9 11.6 19.7 4 17C11.6 14.3 14.8 11.1 17 3.5Z"
        fill="rgba(0,0,0,0.18)"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth={2.8}
      />
    </Svg>
  );
}

export default function RanksScreen() {
  const [activeSectionId, setActiveSectionId] = useState("red");

  const activeSection = SECTIONS.find((section) => section.id === activeSectionId) ?? SECTIONS[0];

  const leaderboardData = useMemo(() => {
    const baseNames = [
      "jeffbob",
      "kai",
      "ava",
      "liam",
      "nora",
      "noah",
      "zoe",
      "mia",
      "ethan",
      "alex",
      "leo",
      "luna",
      "maya",
      "ryan",
      "sam",
      "ella",
      "sofia",
      "aria",
      "jules",
      "max",
      "ivy",
      "adam",
    ];
    const names = baseNames.map((name, index) => `${name}${index + 1}`);
    return names.map((name, index) => ({
      name,
      points: Math.max(0, 200 - index),
    }));
  }, [activeSection.id]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerWrap}>
          <AuraFarmHeader width={153} height={27} />
        </View>

        <View style={styles.diamondsWrap}>
          {SECTIONS.map((section) => {
            const isActive = section.id === activeSectionId;
            return (
              <View key={section.id} style={styles.iconOuter}>
                {/* Shape-following shadow */}
                <View style={styles.iconShadow}>
                  <AuraShadowIcon />
                </View>
                <Pressable
                  onPress={() => setActiveSectionId(section.id)}
                  style={[
                    styles.iconPressable,
                    isActive ? { backgroundColor: hexToRgba(section.color, 0.2) } : null,
                  ]}
                >
                  <AuraIcon color={section.color} />
                </Pressable>
              </View>
            );
          })}
        </View>

        <Text style={[styles.title, { color: activeSection.color }]}>Leaderboard</Text>

        <ScrollView
          style={styles.listScroll}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.topLine, { borderTopColor: activeSection.color }]} />
          {leaderboardData.map((entry) => (
            <View key={entry.name}>
              <View style={styles.row}>
                <View style={styles.nameWrap}>
                  <ProfileImage width={24} height={24} />
                  <Text style={styles.name}>{entry.name}</Text>
                </View>
                <View style={styles.pointsWrap}>
                  <Text style={styles.points}>{entry.points} pts</Text>
                </View>
              </View>
              <View style={[styles.separator, { borderTopColor: activeSection.color }]} />
            </View>
          ))}
        </ScrollView>
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
  diamondsWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 38,
    marginBottom: 22,
  },
  iconOuter: {
    position: 'relative',
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconShadow: {
    position: 'absolute',
    bottom: -7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPressable: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 52 / 2,
    lineHeight: 60 / 2,
    fontWeight: "800",
    marginBottom: 8,
  },
  listScroll: {
    flex: 1,
  },
  list: {
    paddingBottom: 24,
  },
  topLine: {
    borderTopWidth: 3,
  },
  row: {
    minHeight: 102,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  nameWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  name: {
    flexShrink: 1,
    fontSize: 56 / 2,
    lineHeight: 62 / 2,
    fontWeight: "400",
    color: "#1e1e30",
  },
  pointsWrap: {
    width: 112,
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 8,
  },
  points: {
    textAlign: "right",
    fontSize: 52 / 2,
    lineHeight: 58 / 2,
    fontWeight: "700",
    color: "#1e1e30",
  },
  separator: {
    borderTopWidth: 3,
  },
});

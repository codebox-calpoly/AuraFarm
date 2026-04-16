import { StyleSheet, View, TouchableOpacity, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { tailwindColors } from "@/constants/tailwind-colors";
import { useState } from "react";
import { cardShadow, radius, spacing } from "@/constants/design";

export interface FeedCardProps {
  challengeTitle: string;
  points: number;
  userName: string;
  userImage?: string;
  postImage?: string;
  caption?: string;
  date: string;
  likes: number;
  isLiked?: boolean;
  onPress?: () => void;
  onOptionsPress?: () => void;
  onLikePress?: (liked: boolean) => void;
}

export function FeedCard({
  challengeTitle,
  points,
  userName,
  userImage,
  postImage,
  caption,
  date,
  likes,
  isLiked: initialIsLiked = false,
  onPress,
  onOptionsPress,
  onLikePress,
}: FeedCardProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesState, setLikesState] = useState(likes);
  const { width } = useWindowDimensions();
  const imageSize = width - 48;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      style={styles.touchableContainer}
    >
      <ThemedView style={[styles.container, cardShadow(3)]}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <ThemedText style={styles.challengeTitle} numberOfLines={2}>
              {challengeTitle}
            </ThemedText>
            <View style={styles.pointsPill}>
              <ThemedText style={styles.pointsPillText}>+{points}</ThemedText>
            </View>
          </View>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onOptionsPress?.();
            }}
            style={styles.flagBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="flag-outline"
              size={20}
              color={tailwindColors["aura-gray-500"]}
            />
          </TouchableOpacity>
        </View>

        {(postImage?.trim() || userImage?.trim()) ? (
          <Image
            source={{ uri: (postImage ?? userImage)!.trim() }}
            style={[styles.image, { width: imageSize, height: imageSize * 0.92 }]}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              { width: imageSize, height: imageSize * 0.55 },
            ]}
          >
            <Ionicons
              name="image-outline"
              size={40}
              color={tailwindColors["aura-gray-300"]}
            />
          </View>
        )}

        <View style={styles.contentSection}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarLetter}>
                {(userName || "?").charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText style={styles.userName}>{userName}</ThemedText>
          </View>
          {caption ? (
            <ThemedText style={styles.caption}>{caption}</ThemedText>
          ) : null}
          <ThemedText style={styles.dateText}>{date}</ThemedText>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              const newIsLiked = !isLiked;
              if (newIsLiked) {
                setLikesState((prev) => prev + 1);
              } else {
                setLikesState((prev) => Math.max(0, prev - 1));
              }
              setIsLiked(newIsLiked);
              onLikePress?.(newIsLiked);
            }}
            style={styles.likeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={22}
              color={
                isLiked ? tailwindColors["aura-red"] : tailwindColors["aura-gray-500"]
              }
            />
            <ThemedText style={styles.likesText}>{likesState}</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchableContainer: {
    marginBottom: spacing.lg,
  },
  container: {
    backgroundColor: tailwindColors["aura-surface"],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: tailwindColors["aura-border"],
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  challengeTitle: {
    flex: 1,
    fontSize: 17,
    fontFamily: "Poppins_700Bold",
    color: tailwindColors["aura-black"],
    lineHeight: 22,
  },
  pointsPill: {
    backgroundColor: tailwindColors["aura-green-light"],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: tailwindColors["aura-green-tint"],
  },
  pointsPillText: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: tailwindColors["aura-green"],
  },
  flagBtn: {
    padding: 4,
    marginTop: 2,
  },
  image: {
    alignSelf: "center",
    backgroundColor: tailwindColors["aura-gray-100"],
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
  },
  imagePlaceholder: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: tailwindColors["aura-gray-50"],
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: tailwindColors["aura-border"],
    borderStyle: "dashed",
  },
  contentSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 6,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: tailwindColors["aura-red-tint"],
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: tailwindColors["aura-red"],
  },
  userName: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: tailwindColors["aura-black"],
  },
  caption: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: tailwindColors["aura-gray-700"],
    marginBottom: 6,
    lineHeight: 22,
  },
  dateText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: tailwindColors["aura-gray-400"],
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: tailwindColors["aura-border"],
    backgroundColor: tailwindColors["aura-surface-muted"],
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  likesText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: tailwindColors["aura-gray-700"],
  },
});

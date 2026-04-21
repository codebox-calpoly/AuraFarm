import { StyleSheet, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PostMedia } from "@/components/home/PostMedia";
import { useState, useCallback } from 'react';
import { useFocusEffect } from "expo-router";

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { tailwindColors, tailwindFonts } from '@/constants/tailwind-colors';
import { Header } from '@/components/home/Header';
import { useCompletion, useLikeCompletion } from '@/hooks/useCompletion';
import { postStore } from "@/stores/postStore";

export default function PostDetailScreen() {
  const {
    id,
    imageUri: paramImageUri,
    caption: paramCaption,
    likes: paramLikes,
    title: paramTitle,
    points: paramPoints,
    isOwnPost: paramIsOwnPost,
    userName: paramUserName,
  } = useLocalSearchParams<{
    id: string;
    imageUri?: string;
    caption?: string;
    likes?: string;
    title?: string;
    points?: string;
    isOwnPost?: string;
    userName?: string;
  }>();

  const router = useRouter();

  // Prefer backend data if ID > 0
  const completionId = Number(id);
  const { data: completion, isLoading, refetch } = useCompletion(completionId > 0 ? completionId : 0);
  const likeMutation = useLikeCompletion(completionId > 0 ? completionId : 0);

  const [isLiked, setIsLiked] = useState(false);
  const [caption, setCaption] = useState(paramCaption ?? "");
  const [likes, setLikes] = useState(Number(paramLikes ?? 0));

  // Sync state if backend data arrives
  useFocusEffect(
    useCallback(() => {
      if (completionId > 0) {
        refetch();
      }

      const updated = postStore.getCaption(String(id));
      if (updated !== undefined) {
        setCaption(updated);
        postStore.clear(String(id));
      }
    }, [id, completionId, refetch]),
  );

  const handleBack = () => router.back();

  const handleEdit = () => {
    if (paramIsOwnPost === 'true') {
      const currentImage = completion?.imageUri || completion?.imageUrl || paramImageUri || "";
      const currentCaption = completion?.caption || caption || "";
      const currentPoints = completion?.challenge?.pointsReward || Number(paramPoints || 0);
      const currentTitle = completion?.challenge?.title || paramTitle || "Challenge";

      router.push(
        `/post/edit/${id}?imageUri=${encodeURIComponent(currentImage)}&caption=${encodeURIComponent(currentCaption)}&points=${currentPoints}&title=${encodeURIComponent(currentTitle)}`
      );
    }
  };

  const handleLike = () => {
    if (completionId <= 0) {
      // Fallback for non-backend posts
      if (isLiked) {
        setLikes((prev) => prev - 1);
      } else {
        setLikes((prev) => prev + 1);
      }
      setIsLiked((prev) => !prev);
      return;
    }

    const nowLiked = !isLiked;
    setIsLiked(nowLiked);
    // Optimistically update likes count to match the UI
    setLikes((prev) => (nowLiked ? prev + 1 : prev - 1));

    likeMutation.mutate(nowLiked, {
      onError: () => {
        // Revert on error
        setIsLiked(!nowLiked);
        setLikes((prev) => (!nowLiked ? prev + 1 : prev - 1));
      }
    });
  };

  if (completionId > 0 && isLoading && !completion) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Header />
        <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={tailwindColors['aura-green']} />
        </ThemedView>
      </SafeAreaView>
    );
  }

  // Final data derived from backend or parameters
  const post = {
    challengeTitle: completion?.challenge.title || paramTitle || "Challenge",
    points: completion?.challenge.pointsReward || Number(paramPoints || 0),
    postImage: completion?.imageUri || completion?.imageUrl || paramImageUri || null,
    caption: completion?.caption || caption || "",
    likes: completion?.likes ?? (likeMutation.data?.likes ?? likes),
    isOwnPost: paramIsOwnPost === 'true',
    userName: completion?.user?.name || paramUserName || "Auranaut",
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <Header />

      <ThemedView style={styles.container}>
        {/* Nav bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={tailwindColors["aura-black"]}
            />
          </TouchableOpacity>

          <View style={styles.titleSection}>
            <ThemedText style={styles.challengeTitle}>
              {post.challengeTitle}
            </ThemedText>
            <ThemedText style={styles.pointsText}>
              +{post.points} Aura
            </ThemedText>
            <ThemedText style={styles.userNameText}>
              by {post.userName}
            </ThemedText>
          </View>

          {post.isOwnPost ? (
            <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
              <Ionicons
                name="pencil"
                size={20}
                color={tailwindColors["aura-black"]}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.editButton} />
          )}
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Post Image */}
          <View style={styles.imageContainer}>
            {post.postImage ? (
              <PostMedia
                uri={post.postImage}
                frameStyle={styles.image}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons
                  name="image-outline"
                  size={80}
                  color={tailwindColors["aura-gray-400"]}
                />
              </View>
            )}
          </View>

          {/* Likes */}
          <View style={styles.likesSection}>
            <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={28}
                color={
                  isLiked ?
                    tailwindColors["aura-red"]
                    : tailwindColors["aura-black"]
                }
              />
              <ThemedText style={styles.likesCount}>{post.likes}</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Caption */}
          {post.caption ? (
            <View style={styles.captionSection}>
              <ThemedText style={styles.captionLabel}>Caption</ThemedText>
              <ThemedText style={styles.captionText}>{post.caption}</ThemedText>
            </View>
          ) : null}
        </ScrollView>
      </ThemedView>
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
    backgroundColor: tailwindColors["aura-white"],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: tailwindColors["aura-gray-200"],
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  titleSection: {
    flex: 1,
    alignItems: "center",
  },
  challengeTitle: {
    fontSize: 20,
    fontFamily: tailwindFonts["bold"],
    color: tailwindColors["aura-black"],
    marginBottom: 4,
  },
  pointsText: {
    fontSize: 14,
    fontFamily: tailwindFonts["semibold"],
    color: tailwindColors["aura-orange"],
  },
  userNameText: {
    fontSize: 12,
    fontFamily: tailwindFonts["regular"],
    color: tailwindColors["aura-gray-500"],
    marginTop: 2,
  },
  editButton: {
    padding: 4,
    width: 40,
    alignItems: "flex-end",
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: "80%",
    aspectRatio: 1,
    alignSelf: "center",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: tailwindColors["aura-gray-100"],
    marginTop: 16,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: tailwindColors["aura-gray-100"],
  },
  likesSection: {
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  likesCount: {
    fontSize: 20,
    fontFamily: tailwindFonts["semibold"],
    color: tailwindColors["aura-black"],
  },
  captionSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  captionLabel: {
    fontSize: 16,
    fontFamily: tailwindFonts["semibold"],
    color: tailwindColors["aura-black"],
    marginBottom: 12,
  },
  captionText: {
    fontSize: 14,
    fontFamily: tailwindFonts["regular"],
    color: tailwindColors["aura-black"],
    lineHeight: 20,
  },
});

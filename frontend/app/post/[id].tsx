import { StyleSheet, View, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { tailwindColors } from "@/constants/tailwind-colors";
import { Header } from "@/components/home/Header";
import { postStore } from "@/stores/postStore";

export default function PostDetailScreen() {
  const {
    id,
    imageUri,
    caption: captionParam,
    likes: likesParam,
    title,
    points,
    isOwnPost,
  } = useLocalSearchParams<{
    id: string;
    imageUri?: string;
    caption?: string;
    likes?: string;
    title?: string;
    points?: string;
    isOwnPost?: string;
  }>();
  const router = useRouter();

  // TODO: When backend is ready, replace params with:
  // const { data: post } = await fetch(`/api/posts/${id}`).then(r => r.json());
  // All field names below match the expected API response shape.
  const post = {
    id: Number(id),
    challengeTitle: title ?? "Challenge",
    points: Number(points ?? 0),
    postImage: imageUri ?? null,
    isOwnPost: isOwnPost === "true",
  };

  const [likes, setLikes] = useState(Number(likesParam ?? 0));
  const [isLiked, setIsLiked] = useState(false);
  const [caption, setCaption] = useState(captionParam ?? "");

  // On focus, check if the edit page wrote a new caption to the store.
  // TODO: Replace with re-fetch from API when backend is ready.
  useFocusEffect(
    useCallback(() => {
      const updated = postStore.getCaption(String(id));
      if (updated !== undefined) {
        setCaption(updated);
        postStore.clear(String(id));
      }
    }, [id]),
  );

  const handleBack = () => router.back();

  const handleEdit = () => {
    if (post.isOwnPost) {
      router.push(
        `/post/edit/${id}?imageUri=${encodeURIComponent(post.postImage ?? "")}&caption=${encodeURIComponent(caption)}&points=${post.points}&title=${encodeURIComponent(post.challengeTitle)}`,
      );
    }
  };

  const handleLike = () => {
    // TODO: When backend is ready, call POST /api/posts/:id/like or DELETE /api/posts/:id/like
    if (isLiked) {
      setLikes((prev) => prev - 1);
    } else {
      setLikes((prev) => prev + 1);
    }
    setIsLiked((prev) => !prev);
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
              +{post.points} points
            </ThemedText>
          </View>

          {post.isOwnPost ?
            <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
              <Ionicons
                name="pencil"
                size={20}
                color={tailwindColors["aura-black"]}
              />
            </TouchableOpacity>
          : <View style={styles.editButton} />}
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Post Image */}
          <View style={styles.imageContainer}>
            {post.postImage ?
              <Image
                source={{ uri: post.postImage }}
                style={styles.image}
                contentFit="cover"
              />
            : <View style={styles.imagePlaceholder}>
                <Ionicons
                  name="image-outline"
                  size={80}
                  color={tailwindColors["aura-gray-400"]}
                />
              </View>
            }
          </View>

          {/* Likes */}
          <View style={styles.likesSection}>
            <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
              <ThemedText style={styles.likesCount}>{likes}</ThemedText>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={28}
                color={
                  isLiked ?
                    tailwindColors["aura-red"]
                  : tailwindColors["aura-black"]
                }
              />
            </TouchableOpacity>
          </View>

          {/* Caption */}
          <View style={styles.captionSection}>
            <ThemedText style={styles.captionLabel}>Caption</ThemedText>
            <ThemedText style={styles.captionText}>{caption}</ThemedText>
          </View>
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
    fontFamily: "Poppins_700Bold",
    color: tailwindColors["aura-black"],
    marginBottom: 4,
  },
  pointsText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: tailwindColors["aura-orange"],
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
    fontFamily: "Poppins_600SemiBold",
    color: tailwindColors["aura-black"],
  },
  captionSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  captionLabel: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: tailwindColors["aura-black"],
    marginBottom: 12,
  },
  captionText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: tailwindColors["aura-black"],
    lineHeight: 20,
  },
});

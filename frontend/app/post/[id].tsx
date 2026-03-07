import { StyleSheet, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { tailwindColors } from '@/constants/tailwind-colors';
import { Header } from '@/components/home/Header';
import { useCompletion, useLikeCompletion } from '@/hooks/useCompletion';

export default function PostDetailScreen() {
  const { id, isOwnPost } = useLocalSearchParams<{
    id: string;
    isOwnPost?: string;
  }>();
  const router = useRouter();

  const { data: completion, isLoading } = useCompletion(Number(id));
  const likeMutation = useLikeCompletion(Number(id));
  const [isLiked, setIsLiked] = useState(false);

  const handleBack = () => router.back();

  const handleEdit = () => {
    if (isOwnPost === 'true' && completion) {
      router.push(
        `/post/edit/${id}?imageUri=${encodeURIComponent(completion.imageUri)}&caption=${encodeURIComponent(completion.caption ?? '')}&points=${completion.challenge.pointsReward}&title=${encodeURIComponent(completion.challenge.title)}`
      );
    }
  };

  const handleLike = () => {
    const nowLiked = !isLiked;
    setIsLiked(nowLiked);
    likeMutation.mutate(nowLiked);
  };

  if (isLoading || !completion) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={tailwindColors['aura-green']} />
        </ThemedView>
      </SafeAreaView>
    );
  }

  const post = {
    challengeTitle: completion.challenge.title,
    points: completion.challenge.pointsReward,
    postImage: completion.imageUri,
    caption: completion.caption,
    likes: completion.likes,
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        <Header />
        {/* Nav bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={tailwindColors['aura-black']} />
          </TouchableOpacity>

          <View style={styles.titleSection}>
            <ThemedText style={styles.challengeTitle}>{post.challengeTitle}</ThemedText>
            <ThemedText style={styles.pointsText}>+{post.points} points</ThemedText>
          </View>

          {isOwnPost === 'true' ? (
            <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
              <Ionicons name="pencil" size={20} color={tailwindColors['aura-black']} />
            </TouchableOpacity>
          ) : (
            <View style={styles.editButton} />
          )}
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Post Image */}
          <View style={styles.imageContainer}>
            {post.postImage ? (
              <Image
                source={{ uri: post.postImage }}
                style={styles.image}
                contentFit="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={80} color={tailwindColors['aura-gray-400']} />
              </View>
            )}
          </View>

          {/* Likes */}
          <View style={styles.likesSection}>
            <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
              <ThemedText style={styles.likesCount}>{likeMutation.data?.likes ?? post.likes}</ThemedText>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={28}
                color={isLiked ? tailwindColors['aura-red'] : tailwindColors['aura-black']}
              />
            </TouchableOpacity>
          </View>

          {/* Caption */}
          <View style={styles.captionSection}>
            <ThemedText style={styles.captionLabel}>Caption</ThemedText>
            <ThemedText style={styles.captionText}>{post.caption ?? ''}</ThemedText>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tailwindColors['aura-white'],
  },
  container: {
    flex: 1,
    backgroundColor: tailwindColors['aura-white'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: tailwindColors['aura-gray-200'],
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  titleSection: {
    flex: 1,
    alignItems: 'center',
  },
  challengeTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: tailwindColors['aura-black'],
    marginBottom: 4,
  },
  pointsText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: tailwindColors['aura-orange'],
  },
  editButton: {
    padding: 4,
    width: 40,
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '80%',
    aspectRatio: 1,
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: tailwindColors['aura-gray-100'],
    marginTop: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tailwindColors['aura-gray-100'],
  },
  likesSection: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  likesCount: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: tailwindColors['aura-black'],
  },
  captionSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  captionLabel: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: tailwindColors['aura-black'],
    marginBottom: 12,
  },
  captionText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: tailwindColors['aura-black'],
    lineHeight: 20,
  },
});

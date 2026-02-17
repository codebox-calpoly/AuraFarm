import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { tailwindColors } from '@/constants/tailwind-colors';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Mock data lookup - in production, this would fetch from the API based on the id
  const mockPosts: Record<string, any> = {
    '1': {
      id: 1,
      challengeTitle: 'Hike the P',
      points: 300,
      userName: 'Marc Rober',
      userImage: undefined,
      postImage: undefined,
      caption: 'I DID IT!!!!!!!',
      date: 'Jan 9th, 2026',
      likes: 123,
      isLiked: false,
      isOwnPost: true,
    },
    '2': {
      id: 2,
      challengeTitle: 'Find a cool rock',
      points: 30,
      userName: 'Marc Rober',
      userImage: undefined,
      postImage: undefined,
      caption: 'Found this awesome rock on my hike!',
      date: 'Jan 8th, 2026',
      likes: 45,
      isLiked: false,
      isOwnPost: false,
    },
  };

  const post = mockPosts[String(id)] || mockPosts['1'];

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    if (post.isOwnPost) {
      router.push(`/post/edit/${id}`);
    }
  };

  const handleLike = () => {
    console.log('Toggle like for post', id);
    // In production, this would call the API to toggle the like
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={tailwindColors['aura-black']} />
          </TouchableOpacity>
          
          <View style={styles.titleSection}>
            <ThemedText style={styles.challengeTitle}>
              {post.challengeTitle}
            </ThemedText>
            <ThemedText style={styles.pointsText}>
              +{post.points} points
            </ThemedText>
          </View>

          {post.isOwnPost ? (
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
              <ThemedText style={styles.likesCount}>{post.likes}</ThemedText>
              <Ionicons 
                name={post.isLiked ? "heart" : "heart-outline"} 
                size={28} 
                color={tailwindColors['aura-black']} 
              />
            </TouchableOpacity>
          </View>

          {/* Caption Section */}
          <View style={styles.captionSection}>
            <ThemedText style={styles.captionLabel}>Caption</ThemedText>
            <ThemedText style={styles.captionText}>{post.caption}</ThemedText>
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
    color: tailwindColors['aura-yellow'],
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
    width: '100%',
    aspectRatio: 1,
    backgroundColor: tailwindColors['aura-gray-100'],
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

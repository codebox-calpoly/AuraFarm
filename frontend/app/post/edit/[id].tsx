import { StyleSheet, View, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { tailwindColors } from '@/constants/tailwind-colors';

export default function EditPostScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Mock data lookup - in production, this would fetch from the API based on the id
  const mockPosts: Record<string, any> = {
    '1': {
      id: 1,
      challengeTitle: 'Hike the P',
      points: 300,
      postImage: undefined,
      caption: 'I DID IT!!!!!!!',
    },
    '2': {
      id: 2,
      challengeTitle: 'Find a cool rock',
      points: 30,
      postImage: undefined,
      caption: 'Found this awesome rock on my hike!',
    },
  };

  const post = mockPosts[String(id)] || mockPosts['1'];

  const [caption, setCaption] = useState(post.caption);

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    console.log('Saving post with caption:', caption);
    // In production, this would call the API to update the caption
    // Then navigate back to the post detail view
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
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

            <View style={styles.backButton} />
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

            {/* Edit Caption Section */}
            <View style={styles.editSection}>
              <ThemedText style={styles.label}>Edit caption</ThemedText>
              <TextInput
                style={styles.input}
                value={caption}
                onChangeText={setCaption}
                placeholder="Enter caption..."
                placeholderTextColor={tailwindColors['aura-gray-400']}
                multiline
                maxLength={500}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.saveButtonText}>Save</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tailwindColors['aura-white'],
  },
  keyboardView: {
    flex: 1,
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
  editSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: tailwindColors['aura-black'],
    marginBottom: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: tailwindColors['aura-black'],
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: tailwindColors['aura-black'],
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: tailwindColors['aura-white'],
  },
  saveButton: {
    backgroundColor: tailwindColors['aura-green'],
    borderRadius: 100,
    paddingVertical: 16,
    marginHorizontal: 24,
    marginTop: 32,
    marginBottom: 32,
    alignItems: 'center',
    shadowColor: tailwindColors['aura-black'],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: tailwindColors['aura-white'],
  },
});

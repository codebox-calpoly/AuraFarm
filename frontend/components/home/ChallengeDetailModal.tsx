import { useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, Pressable, Image, TextInput, Keyboard, TouchableWithoutFeedback, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { tailwindColors } from '@/constants/tailwind-colors';

export interface ChallengeDetailModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  points: number;
  timeLeft: string;
  onSubmit: () => void;
}

export function ChallengeDetailModal({
  visible,
  onClose,
  title,
  description,
  points,
  timeLeft,
  onSubmit,
}: ChallengeDetailModalProps) {
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [showActionSheet, setShowActionSheet] = useState(false);

  // Reset state when modal closes
  const handleClose = () => {
    setShowUploadOptions(false);
    setImage(null);
    setCaption('');
    setShowActionSheet(false);
    onClose();
  };

  const handleInitialSubmit = () => {
    setShowUploadOptions(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setShowActionSheet(false);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setShowActionSheet(false);
    }
  };

  const handlePost = () => {
    console.log('Submitting post:', { image, caption });
    onSubmit();
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={!showUploadOptions}
      animationType={showUploadOptions ? "slide" : "fade"}
      onRequestClose={handleClose}
    >
      {!showUploadOptions ? (
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
            <ThemedView style={styles.modalContent}>
              {/* Close button */}
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={24} color={tailwindColors['aura-gray-500']} />
              </TouchableOpacity>

              {/* Timer */}
              <View style={styles.timerRow}>
                <Ionicons name="time-outline" size={16} color={tailwindColors['aura-red']} />
                <ThemedText style={styles.timerText}>{timeLeft}</ThemedText>
              </View>

              {/* Title */}
              <ThemedText type="subtitle" style={styles.title}>
                {title}
              </ThemedText>

              {/* Description */}
              <ThemedText style={styles.description}>{description}</ThemedText>

              {/* Initial Submit Button */}
              <TouchableOpacity style={styles.submitButton} onPress={handleInitialSubmit}>
                <Ionicons name="camera" size={20} color={tailwindColors['aura-white']} />
                <ThemedText style={styles.submitButtonText}>Submit</ThemedText>
              </TouchableOpacity>

              {/* Points */}
              <ThemedText style={styles.pointsText}>+{points} Aura</ThemedText>
            </ThemedView>
          </Pressable>
        </Pressable>
      ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.fullScreenContainer}>
            <View style={styles.postContainer}>
              {/* Header */}
              <View style={styles.postHeader}>
                <TouchableOpacity onPress={() => setShowUploadOptions(false)}>
                  <Ionicons name="chevron-back" size={24} color={tailwindColors['aura-black']} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                  <ThemedText style={styles.headerTitle}>Your post</ThemedText>
                  <ThemedText style={styles.headerSubtitle}>+{points} points</ThemedText>
                </View>
                <View style={{ width: 24 }} />
              </View>

              {/* Image Area */}
              <TouchableOpacity 
                style={styles.imagePlaceholder} 
                onPress={() => setShowActionSheet(true)}
              >
                {image ? (
                  <Image source={{ uri: image }} style={styles.uploadedImage} />
                ) : (
                  <View style={styles.placeholderContent}>
                    <Ionicons name="camera" size={48} color={tailwindColors['aura-gray-300']} />
                    <ThemedText style={styles.placeholderText}>Upload Photo</ThemedText>
                  </View>
                )}
              </TouchableOpacity>

              {/* Change Photo Button */}
              {image && (
                <TouchableOpacity 
                  style={styles.changePhotoButton}
                  onPress={() => setShowActionSheet(true)}
                >
                  <ThemedText style={styles.changePhotoText}>Change Photo</ThemedText>
                </TouchableOpacity>
              )}

              {/* Caption Input */}
              <View style={styles.captionContainer}>
                <ThemedText style={styles.inputLabel}>Add a caption</ThemedText>
                <TextInput
                  style={styles.captionInput}
                  placeholder="Start typing..."
                  placeholderTextColor={tailwindColors['aura-gray-400']}
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                  blurOnSubmit={true}
                />
              </View>

              {/* Post Button */}
              <TouchableOpacity 
                style={[styles.postButton, !image && styles.disabledButton]} 
                onPress={handlePost}
                disabled={!image}
              >
                <ThemedText style={styles.postButtonText}>Post</ThemedText>
              </TouchableOpacity>

              {!image && (
                <ThemedText style={styles.warningText}>
                  You cannot post until you upload a picture
                </ThemedText>
              )}
            </View>

            {/* Action Sheet Overlay */}
            {showActionSheet && (
              <Pressable style={styles.actionSheetOverlay} onPress={() => setShowActionSheet(false)}>
                <View style={styles.actionSheet}>
                  <TouchableOpacity style={styles.actionSheetButton} onPress={pickImage}>
                    <ThemedText style={styles.actionSheetText}>Photo Gallery</ThemedText>
                  </TouchableOpacity>
                  <View style={styles.separator} />
                  <TouchableOpacity style={styles.actionSheetButton} onPress={takePhoto}>
                    <ThemedText style={styles.actionSheetText}>Camera</ThemedText>
                  </TouchableOpacity>
                  <View style={styles.separator} />
                  <TouchableOpacity style={[styles.actionSheetButton, styles.cancelButton]} onPress={() => setShowActionSheet(false)}>
                    <ThemedText style={[styles.actionSheetText, styles.cancelText]}>Cancel</ThemedText>
                  </TouchableOpacity>
                </View>
              </Pressable>
            )}
          </SafeAreaView>
        </TouchableWithoutFeedback>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: tailwindColors['aura-white'],
    borderRadius: 16,
    borderWidth: 0,
    padding: 24,
    position: 'relative',
    shadowColor: tailwindColors['aura-black'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  timerText: {
    color: tailwindColors['aura-red'],
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 16,
    color: tailwindColors['aura-black'],
  },
  description: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 24,
    color: tailwindColors['aura-gray-700'],
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: tailwindColors['aura-green'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 12,
    width: '100%',
  },
  submitButtonText: {
    color: tailwindColors['aura-white'],
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  pointsText: {
    color: tailwindColors['aura-green'],
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
  // New Styles for Post Flow
  fullScreenContainer: {
    flex: 1,
    backgroundColor: tailwindColors['aura-white'],
  },
  postContainer: {
    flex: 1,
    padding: 24,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: tailwindColors['aura-black'],
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFB800', // Gold color for points
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: tailwindColors['aura-gray-200'],
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  placeholderContent: {
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    color: tailwindColors['aura-gray-400'],
    fontFamily: 'Poppins_600SemiBold',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  changePhotoButton: {
    alignSelf: 'center',
    backgroundColor: tailwindColors['aura-red-tint'],
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  changePhotoText: {
    color: tailwindColors['aura-red'],
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },
  captionContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: tailwindColors['aura-black'],
    marginBottom: 8,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: tailwindColors['aura-gray-200'],
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Poppins_400Regular',
    minHeight: 40,
    textAlignVertical: 'top',
  },
  postButton: {
    backgroundColor: tailwindColors['aura-green'],
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  postButtonText: {
    color: tailwindColors['aura-white'],
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: tailwindColors['aura-gray-300'],
  },
  warningText: {
    color: tailwindColors['aura-red'],
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
  // Action Sheet Styles
  actionSheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    zIndex: 10,
  },
  actionSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  actionSheetButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSheetText: {
    color: '#007AFF',
    fontSize: 18,
    fontFamily: 'Poppins_500Medium',
  },
  separator: {
    height: 1,
    backgroundColor: tailwindColors['aura-gray-100'],
  },
  cancelButton: {
    marginTop: 8,
  },
  cancelText: {
    color: tailwindColors['aura-red'],
    fontWeight: 'bold',
  },
});

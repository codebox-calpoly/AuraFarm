import { useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

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
  const [selectedPhoto, setSelectedPhoto] = useState<'library' | 'camera' | null>(null);

  // Reset state when modal closes
  const handleClose = () => {
    setShowUploadOptions(false);
    setSelectedPhoto(null);
    onClose();
  };

  const handleInitialSubmit = () => {
    setShowUploadOptions(true);
  };

  const handleBack = () => {
    setShowUploadOptions(false);
    setSelectedPhoto(null);
  };

  const handleSelectPhoto = (type: 'library' | 'camera') => {
    setSelectedPhoto(type);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      {/* Semi-transparent overlay */}
      <Pressable style={styles.overlay} onPress={handleClose}>
        {/* Modal content - prevent clicks from closing */}
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <ThemedView style={styles.modalContent}>
            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>

            {!showUploadOptions ? (
              <>
                {/* Timer */}
                <View style={styles.timerRow}>
                  <Ionicons name="time-outline" size={16} color="#FF0000" />
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
                  <Ionicons name="camera" size={20} color="white" />
                  <ThemedText style={styles.submitButtonText}>Submit</ThemedText>
                </TouchableOpacity>

                {/* Points */}
                <ThemedText style={styles.pointsText}>+{points} Aura</ThemedText>
              </>
            ) : (
              <>
                {/* Back button */}
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                  <Ionicons name="arrow-back" size={20} color="#666" />
                  <ThemedText style={styles.backButtonText}>Back</ThemedText>
                </TouchableOpacity>

                {/* Upload Title */}
                <ThemedText type="subtitle" style={styles.uploadTitle}>
                  Upload Proof
                </ThemedText>
                
                <ThemedText style={styles.uploadDescription}>
                  Upload a photo to complete the challenge and earn your aura points!
                </ThemedText>

                {/* Placeholder Options */}
                <View style={styles.uploadOptionsContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.uploadOption, 
                      selectedPhoto === 'library' && styles.selectedOption
                    ]}
                    onPress={() => handleSelectPhoto('library')}
                  >
                    <View style={styles.iconCircle}>
                      <Ionicons name="image-outline" size={32} color="#C40000" />
                    </View>
                    <ThemedText style={styles.uploadOptionText}>Browse Photo Library</ThemedText>
                    {selectedPhoto === 'library' && (
                      <View style={styles.checkmarkBadge}>
                        <Ionicons name="checkmark-circle" size={24} color="#4ADE80" />
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      styles.uploadOption, 
                      selectedPhoto === 'camera' && styles.selectedOption
                    ]}
                    onPress={() => handleSelectPhoto('camera')}
                  >
                    <View style={styles.iconCircle}>
                      <Ionicons name="camera-outline" size={32} color="#C40000" />
                    </View>
                    <ThemedText style={styles.uploadOptionText}>Take Photo</ThemedText>
                    {selectedPhoto === 'camera' && (
                      <View style={styles.checkmarkBadge}>
                        <Ionicons name="checkmark-circle" size={24} color="#4ADE80" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Final Confirm Button */}
                <TouchableOpacity 
                  style={[
                    styles.submitButton, 
                    { marginTop: 20 },
                    !selectedPhoto && styles.disabledButton
                  ]} 
                  onPress={onSubmit}
                  disabled={!selectedPhoto}
                >
                  <ThemedText style={styles.submitButtonText}>Confirm Submission</ThemedText>
                </TouchableOpacity>
              </>
            )}
          </ThemedView>
        </Pressable>
      </Pressable>
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
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#C40000',
    padding: 24,
    position: 'relative',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Shadow for Android
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  backButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  timerText: {
    color: '#FF0000',
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000',
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#000',
    textAlign: 'center',
  },
  uploadDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 24,
  },
  uploadOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  uploadOption: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    borderStyle: 'dashed',
    position: 'relative',
  },
  selectedOption: {
    borderColor: '#4ADE80',
    backgroundColor: '#F0FFF4',
    borderStyle: 'solid',
    borderWidth: 2,
  },
  checkmarkBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF1F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#4ADE80',
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
  disabledButton: {
    backgroundColor: '#A7F3D0',
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  pointsText: {
    color: '#4ADE80',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

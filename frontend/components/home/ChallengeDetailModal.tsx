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
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Semi-transparent overlay */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Modal content - prevent clicks from closing */}
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <ThemedView style={styles.modalContent}>
            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>

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

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
              <Ionicons name="camera" size={20} color="white" />
              <ThemedText style={styles.submitButtonText}>Submit</ThemedText>
            </TouchableOpacity>

            {/* Points */}
            <ThemedText style={styles.pointsText}>+{points} Aura</ThemedText>
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
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 24,
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

import { useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { tailwindColors } from '@/constants/tailwind-colors';

export interface ReportPostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export function ReportPostModal({
  visible,
  onClose,
  onSubmit,
}: ReportPostModalProps) {
  const [reportReason, setReportReason] = useState('');

  const handleClose = () => {
    setReportReason('');
    onClose();
  };

  const handleSubmit = () => {
    onSubmit(reportReason);
    setReportReason('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <ThemedView style={styles.modalContent}>
            {/* Header with title and close button */}
            <View style={styles.header}>
              <ThemedText style={styles.title}>
                Report this post?
              </ThemedText>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={24} color={tailwindColors['aura-gray-500']} />
              </TouchableOpacity>
            </View>

            {/* Explanatory text */}
            <View style={styles.explanationContainer}>
              <ThemedText style={styles.explanationText}>
                Reporting this post will hide it for you.
              </ThemedText>
              <ThemedText style={styles.explanationText}>
                We will review all submissions to determine next steps.
              </ThemedText>
            </View>

            {/* Text input field */}
            <TextInput
              style={styles.textInput}
              placeholder="Start typing..."
              placeholderTextColor={tailwindColors['aura-gray-400']}
              value={reportReason}
              onChangeText={setReportReason}
              multiline
              textAlignVertical="top"
            />

            {/* Submit button */}
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit}
            >
              <ThemedText style={styles.submitButtonText}>
                Submit
              </ThemedText>
            </TouchableOpacity>
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
    backgroundColor: tailwindColors['aura-white'],
    borderRadius: 16,
    padding: 24,
    paddingTop: 28,
    position: 'relative',
    overflow: 'visible',
    shadowColor: tailwindColors['aura-black'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingTop: 4,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: tailwindColors['aura-gray-700'],
    flex: 1,
    paddingRight: 8,
    lineHeight: 32,
  },
  closeButton: {
    padding: 4,
  },
  explanationContainer: {
    marginBottom: 20,
  },
  explanationText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: tailwindColors['aura-gray-700'],
    lineHeight: 20,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: tailwindColors['aura-gray-300'],
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: tailwindColors['aura-gray-700'],
    backgroundColor: tailwindColors['aura-gray-50'],
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: tailwindColors['aura-red'],
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: tailwindColors['aura-white'],
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
  },
});

import { useState, useEffect } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, Pressable, TextInput, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { tailwindColors } from '@/constants/tailwind-colors';

export interface ReportPostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  alreadyReported?: boolean;
}

export function ReportPostModal({
  visible,
  onClose,
  onSubmit,
  alreadyReported = false,
}: ReportPostModalProps) {
  const [reportReason, setReportReason] = useState('');
  const [isConfirming, setIsConfirming] = useState(alreadyReported);

  // Sync confirmation state when modal opens
  useEffect(() => {
    if (visible) {
      setIsConfirming(alreadyReported);
    }
  }, [visible, alreadyReported]);

  const handleClose = () => {
    setReportReason('');
    // Don't reset isConfirming here to avoid flash - useEffect will handle it on next open
    onClose();
  };

  const handleSubmit = () => {
    onSubmit(reportReason);
    setReportReason('');
    setTimeout(() => {
      setIsConfirming(true);
    }, 100);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ width: '100%', maxWidth: 400 }}
        >
        <Pressable 
          style={styles.modalContainer} 
          onPress={(e) => {
            e.stopPropagation();
            Keyboard.dismiss();
          }}
        >
          <ThemedView style={styles.modalContent}>
            {!isConfirming ? (
              <>
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
                  onPress={(e) => e.stopPropagation()}
                />

                {/* Submit button */}
                <TouchableOpacity 
                  style={styles.submitButton} 
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    handleSubmit();
                  }}
                >
                  <ThemedText style={styles.submitButtonText}>
                    Submit
                  </ThemedText>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* TODO: Add confirmation view here */}
                <View style={styles.confirmHeader}>
                  <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <Ionicons name="close" size={24} color={tailwindColors['aura-gray-500']} />
                  </TouchableOpacity>
                </View>
                <ThemedText style={styles.confirmTitle}>
                  We have received your report
                </ThemedText>
                <ThemedText style={styles.confirmMessage}>
                  Thank you for your report. Our team will review your submission as soon as possible.
                </ThemedText>
                <TouchableOpacity 
                  style={styles.dismissButton} 
                  onPress={handleClose}
                >
                  <ThemedText style={styles.dismissButtonText}>
                    Dismiss
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}
          </ThemedView>
        </Pressable>
        </KeyboardAvoidingView>
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
  confirmHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
    paddingTop: 4,
  },
  confirmTitle: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: tailwindColors['aura-gray-700'],
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 20,
    lineHeight: 32,
    paddingTop: 4,
  },
  confirmMessage: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: tailwindColors['aura-gray-700'],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8, // Add some breathing room
  },
  dismissButton: {
    backgroundColor: tailwindColors['aura-green'],
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButtonText: {
    color: tailwindColors['aura-white'],
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
  },
});

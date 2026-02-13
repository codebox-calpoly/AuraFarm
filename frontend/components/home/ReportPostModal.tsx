import { useState } from 'react';
import { View, Modal, TouchableOpacity, Pressable, TextInput } from 'react-native';
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
      {/* Semi-transparent overlay */}
      <Pressable 
        className="flex-1 justify-center items-center p-5" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onPress={handleClose}
      >
        {/* Modal content - prevent clicks from closing */}
        <Pressable className="w-full max-w-md" onPress={(e) => e.stopPropagation()}>
          <ThemedView 
            className="bg-white rounded-2xl p-6 pt-7 overflow-visible"
            style={{
              shadowColor: '#383737',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            {/* Header with title and close button */}
            <View className="flex-row justify-between items-start mb-4 pt-1">
              <ThemedText className="text-gray-700 text-2xl font-bold flex-1 pr-2 leading-8">
                Report this post?
              </ThemedText>
              <TouchableOpacity className="p-1" onPress={handleClose}>
                <Ionicons name="close" size={24} color="#6B7280" /> 
              </TouchableOpacity>
            </View>

            {/* Explanatory text */}
            <View className="mb-5">
              <ThemedText className="text-gray-700 text-sm font-sans leading-5 mb-1">
                Reporting this post will hide it for you.
              </ThemedText>
              <ThemedText className="text-gray-700 text-sm font-sans leading-5 mb-1">
                We will review all submissions to determine next steps.
              </ThemedText>
            </View>

            {/* Text input field */}
            <TextInput
              className="border border-gray-300 rounded-lg p-3 min-h-[100px] text-sm font-sans text-gray-700 bg-gray-50 mb-6"
              placeholder="Start typing..."
              placeholderTextColor="#9CA3AF"
              value={reportReason}
              onChangeText={setReportReason}
              multiline
              textAlignVertical="top"
            />

            {/* Submit button */}
            <TouchableOpacity 
              className="bg-aura-red py-3.5 px-8 rounded-xl items-center justify-center" 
              onPress={handleSubmit}
            >
              <ThemedText className="text-white text-base font-bold">
                Submit
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

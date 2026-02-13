import { useState } from 'react';
import { View, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      <Pressable 
        className="flex-1 justify-center items-center p-5" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onPress={handleClose}
      >
        {/* Modal content - prevent clicks from closing */}
        <Pressable className="w-full max-w-md" onPress={(e) => e.stopPropagation()}>
          <ThemedView 
            className="bg-white rounded-2xl border-2 border-aura-red p-6 relative"
            style={{
              shadowColor: '#383737',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            {/* Close button */}
            <TouchableOpacity className="absolute top-4 right-4 z-10 p-1" onPress={handleClose}>
              <Ionicons name="close" size={24} color="#6B7280" /> 
            </TouchableOpacity>

            {!showUploadOptions ? (
              <>
                {/* Timer */}
                <View className="flex-row items-center gap-1 mb-3">
                  <Ionicons name="time-outline" size={16} color={tailwindColors['aura-red']} />
                  <ThemedText className="text-aura-red text-sm font-sans">{timeLeft}</ThemedText>
                </View>

                {/* Title */}
                <ThemedText type="subtitle" className="text-aura-black text-3xl font-bold mb-4">
                  {title}
                </ThemedText>

                {/* Description */}
                <ThemedText className="text-gray-700 text-base font-sans leading-6 mb-6">{description}</ThemedText>

                {/* Initial Submit Button */}
                <TouchableOpacity className="bg-aura-green flex-row items-center justify-center gap-2 py-3.5 px-8 rounded-xl self-center mb-3 w-full" onPress={handleInitialSubmit}>
                  <Ionicons name="camera" size={20} color="white" />
                  <ThemedText className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>Submit</ThemedText>
                </TouchableOpacity>

                {/* Points */}
                <ThemedText className="text-lg font-semibold text-center" style={{ color: tailwindColors['aura-green'] }}>+{points} Aura</ThemedText>
              </>
            ) : (
              <>
                {/* Back button */}
                <TouchableOpacity className="flex-row items-center mb-4 gap-1" onPress={handleBack}>
                  <Ionicons name="arrow-back" size={20} color="#6B7280" /> 
                  <ThemedText className="text-gray-500 text-sm font-sans">Back</ThemedText>
                </TouchableOpacity>

                {/* Upload Title */}
                <ThemedText type="subtitle" className="text-aura-black text-2xl font-bold mb-2 text-center">
                  Upload Proof
                </ThemedText>
                
                <ThemedText className="text-gray-500 text-sm font-sans text-center mb-6 leading-5">
                  Upload a photo to complete the challenge and earn your Aura!
                </ThemedText>

                {/* Upload Options */}
                <View className="flex-row justify-between gap-4 mb-4">
                  <TouchableOpacity 
                    className={`flex-1 rounded-xl p-4 items-center border relative ${
                      selectedPhoto === 'library' 
                        ? 'bg-green-50 border-2 border-aura-green border-solid' 
                        : 'bg-gray-50 border border-gray-200 border-dashed'
                    }`}
                    onPress={() => handleSelectPhoto('library')}
                  >
                    <View className="w-15 h-15 rounded-full justify-center items-center mb-3" style={{ backgroundColor: '#FFF1F1' }}>
                      <Ionicons name="image-outline" size={32} color={tailwindColors['aura-red']} />
                    </View>
                    <ThemedText className="text-gray-700 text-xs font-semibold text-center">Browse Photo Library</ThemedText>
                    {selectedPhoto === 'library' && (
                      <View className="absolute -top-2 -right-2 bg-white rounded-xl">
                        <Ionicons name="checkmark-circle" size={24} color={tailwindColors['aura-green']} />
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className={`flex-1 rounded-xl p-4 items-center border relative ${
                      selectedPhoto === 'camera' 
                        ? 'bg-green-50 border-2 border-aura-green border-solid' 
                        : 'bg-gray-50 border border-gray-200 border-dashed'
                    }`}
                    onPress={() => handleSelectPhoto('camera')}
                  >
                    <View className="w-15 h-15 rounded-full justify-center items-center mb-3" style={{ backgroundColor: '#FFF1F1' }}>
                      <Ionicons name="camera-outline" size={32} color={tailwindColors['aura-red']} />
                    </View>
                    <ThemedText className="text-gray-700 text-xs font-semibold text-center">Take Photo</ThemedText>
                    {selectedPhoto === 'camera' && (
                      <View className="absolute -top-2 -right-2 bg-white rounded-xl">
                        <Ionicons name="checkmark-circle" size={24} color={tailwindColors['aura-green']} />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Final Confirm Button */}
                <TouchableOpacity 
                  className={`bg-aura-green py-3.5 px-8 rounded-xl self-center w-full mt-5 ${
                    !selectedPhoto ? 'opacity-60' : ''
                  }`}
                  style={{ backgroundColor: !selectedPhoto ? '#A7F3D0' : tailwindColors['aura-green'] }}
                  onPress={onSubmit}
                  disabled={!selectedPhoto}
                >
                  <ThemedText className="text-lg font-semibold text-center" style={{ color: '#FFFFFF' }}>Confirm Submission</ThemedText>
                </TouchableOpacity>
              </>
            )}
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

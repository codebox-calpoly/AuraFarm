import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { tailwindColors } from '@/constants/tailwind-colors';

export interface ChallengeCardProps {
  type: 'incoming' | 'completed';
  title: string;
  points: number;
  timeLeft?: string; // For incoming
  dateCompleted?: string; // For completed
  onPress?: () => void;
}

export function ChallengeCard({ type, title, points, timeLeft, dateCompleted, onPress }: ChallengeCardProps) {
  if (type === 'incoming') {
    return (
      <View className="mb-6">
        <ThemedView className="border-2 border-aura-red rounded-2xl p-4" style={{ backgroundColor: '#FFF5F5' }}>
          <View className="flex-row items-center gap-1 mb-2">
            <Ionicons name="time-outline" size={16} color={tailwindColors['aura-red']} />
            <ThemedText className="text-aura-red text-sm font-sans">{timeLeft}</ThemedText>
          </View>

          <ThemedText type="subtitle" className="text-aura-black text-2xl mb-4">{title}</ThemedText>
          
          <View className="flex-row justify-between items-center">
            <ThemedText className="text-base font-semibold" style={{ color: tailwindColors['aura-green'] }}>+{points} Aura</ThemedText>
            
            <TouchableOpacity className="bg-aura-red px-6 py-2 rounded-full" onPress={onPress}>
              <ThemedText className="font-semibold" style={{ color: '#FFFFFF' }}>View</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    );
  }

  // Completed Variant
  return (
    <TouchableOpacity 
      className="flex-row items-center p-4 bg-gray-100 rounded-xl mb-3 border-2 border-gray-200 shadow-sm" 
      onPress={onPress}
      style={{
        shadowColor: '#383737',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View className="flex-1">
        <ThemedText className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>{dateCompleted}</ThemedText>
        <ThemedText type="subtitle" className="text-lg mb-1" style={{ color: tailwindColors['aura-black'] }}>{title}</ThemedText>
        <ThemedText className="text-base font-semibold" style={{ color: tailwindColors['aura-green'] }}>+{points} Aura</ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={24} color={tailwindColors['aura-black']} />
    </TouchableOpacity>
  );
}

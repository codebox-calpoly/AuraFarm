import { View, Image } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { tailwindColors } from '@/constants/tailwind-colors';

interface AuraProgressBarProps {
  current: number;
  max: number;
}

export function AuraProgressBar({ current, max }: AuraProgressBarProps) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <ThemedView className="w-full px-5 mb-6 bg-transparent">
      <View className="flex-row items-center gap-3">
        <Image 
          source={require('@/assets/images/red-star.png')} 
          className="w-5 h-6"
          resizeMode="contain"
        />
        
        <View className="flex-1 h-3 bg-gray-200 rounded-md overflow-hidden">
          <View 
            className="h-full bg-aura-red rounded-md" 
            style={{ width: `${percentage}%` }}
          />
        </View>
        
        <Image 
          source={require('@/assets/images/gold-star.png')} 
          className="w-5 h-6"
          resizeMode="contain"
        />
      </View>
      
      <ThemedText className="text-right mt-1 text-xs font-sans" style={{ color: tailwindColors['aura-red'] }}>
        {current}/{max} Aura
      </ThemedText>
    </ThemedView>
  );
}

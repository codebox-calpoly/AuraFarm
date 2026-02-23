import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
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
    <ThemedView style={styles.container}>
      <View style={styles.barContainer}>
        <Image 
          source={require('@/assets/images/red-star.png')} 
          style={styles.iconLeft}
          contentFit="contain"
          cachePolicy="memory-disk"
          priority="high"
        />
        
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${percentage}%` }]} />
        </View>
        
        <Image 
          source={require('@/assets/images/gold-star.png')} 
          style={styles.iconRight}
          contentFit="contain"
          cachePolicy="memory-disk"
          priority="high"
        />
      </View>
      
      <ThemedText style={styles.pointsText}>
        {current}/{max} Aura
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  track: {
    flex: 1,
    height: 12,
    backgroundColor: tailwindColors['aura-gray-200'],
    borderRadius: 6,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: tailwindColors['aura-red'],
    borderRadius: 6,
  },
  iconLeft: {
    width: 20,
    height: 25,
  },
  iconRight: {
    width: 20,
    height: 25,
  },
  pointsText: {
    textAlign: 'right',
    marginTop: 4,
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: tailwindColors['aura-red'],
  },
});

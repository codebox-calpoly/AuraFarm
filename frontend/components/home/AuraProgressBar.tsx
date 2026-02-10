import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface AuraProgressBarProps {
  current: number;
  max: number;
}

export function AuraProgressBar({ current, max }: AuraProgressBarProps) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.barContainer}>
        <Ionicons name="sparkles" size={20} color="#FF0000" style={styles.iconLeft} />
        
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${percentage}%` }]} />
        </View>
        
        <Ionicons name="sparkles" size={20} color="#FFD700" style={styles.iconRight} />
      </View>
      
      <ThemedText style={styles.pointsText} lightColor="#FF6B6B">
        {current}/{max} pts
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
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#FF0000',
    borderRadius: 6,
  },
  iconLeft: {
     // Red sparkle
  },
  iconRight: {
     // Gold sparkle
  },
  pointsText: {
    textAlign: 'right',
    marginTop: 4,
    fontSize: 12,
    color: '#FF6B6B',
  },
});

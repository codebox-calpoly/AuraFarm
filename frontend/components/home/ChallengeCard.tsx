import { StyleSheet, View, TouchableOpacity } from 'react-native';
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
      <View style={styles.incomingContainer}>
        <ThemedView style={styles.incomingContent}>
          <View style={styles.timerRow}>
            <Ionicons name="time-outline" size={16} color={tailwindColors['aura-red']} />
            <ThemedText style={styles.timerText}>{timeLeft}</ThemedText>
          </View>

          <ThemedText type="subtitle" style={styles.incomingTitle}>{title}</ThemedText>
          
          <View style={styles.incomingFooter}>
            <ThemedText style={styles.pointsText}>+{points} Aura</ThemedText>
            
            <TouchableOpacity style={styles.viewButton} onPress={onPress}>
              <ThemedText style={styles.viewButtonText}>View</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    );
  }

  // Completed Variant
  return (
    <TouchableOpacity style={styles.completedContainer} onPress={onPress}>
      <View style={styles.completedContent}>
        <ThemedText style={styles.dateText}>{dateCompleted}</ThemedText>
        <ThemedText type="subtitle" style={styles.completedTitle}>{title}</ThemedText>
        <ThemedText style={styles.pointsText}>+{points} Aura</ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={24} color={tailwindColors['aura-black']} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Incoming Styles
  incomingContainer: {
    marginBottom: 24,
  },
  incomingContent: {
    borderWidth: 2,
    borderColor: tailwindColors['aura-red'],
    borderRadius: 16,
    padding: 16,
    backgroundColor: tailwindColors['aura-red-light'],
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  timerText: {
    color: tailwindColors['aura-red'],
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  incomingTitle: {
    fontSize: 24,
    marginBottom: 16,
    color: tailwindColors['aura-black'],
  },
  incomingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsText: {
    color: tailwindColors['aura-green'],
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  viewButton: {
    backgroundColor: tailwindColors['aura-red'],
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewButtonText: {
    color: tailwindColors['aura-white'],
    fontFamily: 'Poppins_600SemiBold',
  },

  // Completed Styles
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: tailwindColors['aura-gray-100'],
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: tailwindColors['aura-gray-200'],
    shadowColor: tailwindColors['aura-black'],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedContent: {
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: tailwindColors['aura-gray-500'],
    marginBottom: 4,
  },
  completedTitle: {
    fontSize: 18,
    marginBottom: 4,
    color: tailwindColors['aura-black'],
  },
});

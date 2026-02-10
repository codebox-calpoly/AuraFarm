import { StyleSheet, View, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

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
        <ThemedView style={styles.incomingContent} lightColor="#FFF5F5">
          <View style={styles.timerRow}>
            <Ionicons name="time-outline" size={16} color="#FF0000" />
            <ThemedText style={styles.timerText} lightColor="#FF0000">{timeLeft}</ThemedText>
          </View>

          <ThemedText type="subtitle" style={styles.incomingTitle} lightColor="#000">{title}</ThemedText>
          
          <View style={styles.incomingFooter}>
            <ThemedText style={styles.pointsText} lightColor="#4ADE80">+{points} Aura</ThemedText>
            
            <TouchableOpacity style={styles.viewButton} onPress={onPress}>
              <ThemedText style={styles.viewButtonText} lightColor="white">View</ThemedText>
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
        <ThemedText style={styles.dateText} lightColor="#6B7280">{dateCompleted}</ThemedText>
        <ThemedText type="subtitle" style={styles.completedTitle} lightColor="#000">{title}</ThemedText>
        <ThemedText style={styles.pointsText} lightColor="#4ADE80">+{points} Aura</ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#000" />
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
    borderColor: '#FF0000',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFF5F5', // Light pinkish background
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  timerText: {
    color: '#FF0000',
    fontSize: 14,
    fontWeight: '500',
  },
  incomingTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  incomingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsText: {
    color: '#4ADE80', // Green
    fontSize: 16,
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: '#C40000', // Darker red
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewButtonText: {
    color: 'white',
    fontWeight: '600',
  },

  // Completed Styles
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6', // Light gray
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    // Shadow for depth
    shadowColor: '#000',
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
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
  },
  completedTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
});

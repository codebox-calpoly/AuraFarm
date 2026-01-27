import { StyleSheet, ScrollView, Platform } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Header } from '@/components/home/Header';
import { TabSwitcher } from '@/components/home/TabSwitcher';
import { AuraProgressBar } from '@/components/home/AuraProgressBar';
import { ChallengeCard } from '@/components/home/ChallengeCard';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'my-challenges' | 'feed'>('my-challenges');

  // Mock Data
  const incomingChallenge = {
    title: 'Hike the P',
    points: 300,
    timeLeft: '3 days 2 hrs 3 min',
  };

  const completedChallenges = [
    { id: 1, title: 'Hike the P', points: 300, date: 'Jan 24th, 2026' },
    { id: 2, title: 'Hike the P', points: 300, date: 'Jan 24th, 2026' },
    // Duplicate for demo as per design screenshot showing same item
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        <Header />
        
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {activeTab === 'my-challenges' ? (
            <>
              {/* Progress Bar */}
              <AuraProgressBar current={75} max={100} />

              {/* Incoming Section */}
              <ThemedText style={styles.sectionTitle}>Incoming</ThemedText>
              <ChallengeCard
                type="incoming"
                title={incomingChallenge.title}
                points={incomingChallenge.points}
                timeLeft={incomingChallenge.timeLeft}
                onPress={() => console.log('View Incoming')}
              />

              {/* Completed Section */}
              <ThemedText style={styles.sectionTitle}>Completed</ThemedText>
              {completedChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  type="completed"
                  title={challenge.title}
                  points={challenge.points}
                  dateCompleted={challenge.date}
                  onPress={() => console.log('View Completed', challenge.id)}
                />
              ))}
            </>
          ) : (
            <ThemedView style={styles.feedPlaceholder}>
              <ThemedText>Feed Content Coming Soon...</ThemedText>
            </ThemedView>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // Or use theme color
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  feedPlaceholder: {
    padding: 20,
    alignItems: 'center',
  },
});

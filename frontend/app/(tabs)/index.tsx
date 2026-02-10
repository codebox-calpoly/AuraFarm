import { StyleSheet, ScrollView, Platform } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Header } from '@/components/home/Header';
import { TabSwitcher } from '@/components/home/TabSwitcher';
import { AuraProgressBar } from '@/components/home/AuraProgressBar';
import { ChallengeCard } from '@/components/home/ChallengeCard';
import { ChallengeDetailModal } from '@/components/home/ChallengeDetailModal';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'my-challenges' | 'feed'>('my-challenges');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<{
    title: string;
    points: number;
    timeLeft: string;
    description: string;
  } | null>(null);

  // State for challenges
  const [incomingChallenges, setIncomingChallenges] = useState([
    {
      id: 1,
      title: 'Hike the P',
      points: 300,
      timeLeft: '3 days 2 hrs 3 min',
      description: 'Go to the top of the P and take a smiling picture with a friend.',
    },
  ]);

  const [completedChallenges, setCompletedChallenges] = useState<Array<{
    id: number;
    title: string;
    points: number;
    date: string;
    description: string;
  }>>([]);

  const handleViewChallenge = (challenge: { title: string; points: number; timeLeft: string; description: string }) => {
    setSelectedChallenge(challenge);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedChallenge(null);
  };

  const handleSubmit = () => {
    if (selectedChallenge) {
      // Find the challenge in incoming challenges
      const challengeToComplete = incomingChallenges.find(
        c => c.title === selectedChallenge.title
      );

      if (challengeToComplete) {
        // Remove from incoming
        setIncomingChallenges(prev => prev.filter(c => c.id !== challengeToComplete.id));

        // Add to completed with current date
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).replace(',', 'th,'); // Simple date formatting

        setCompletedChallenges(prev => [
          {
            id: challengeToComplete.id,
            title: challengeToComplete.title,
            points: challengeToComplete.points,
            date: formattedDate,
            description: challengeToComplete.description,
          },
          ...prev,
        ]);
      }
    }
    handleCloseModal();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container} lightColor="#fff">
        <Header />
        
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {activeTab === 'my-challenges' ? (
            <>
              {/* Progress Bar */}
              <AuraProgressBar current={75} max={100} />

              {/* Incoming Section */}
              <ThemedText style={styles.sectionTitle} lightColor="#000">Incoming</ThemedText>
              {incomingChallenges.length > 0 ? (
                incomingChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    type="incoming"
                    title={challenge.title}
                    points={challenge.points}
                    timeLeft={challenge.timeLeft}
                    onPress={() => handleViewChallenge(challenge)}
                  />
                ))
              ) : (
                <ThemedText style={styles.emptyState} lightColor="#999">No incoming challenges </ThemedText>
              )}

              {/* Completed Section */}
              <ThemedText style={styles.sectionTitle} lightColor="#000">Completed</ThemedText>
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
            <ThemedView style={styles.feedPlaceholder} lightColor="#fff">
              <ThemedText lightColor="#000">Feed Content Coming Soon...</ThemedText>
            </ThemedView>
          )}
        </ScrollView>

        {/* Challenge Detail Modal */}
        {selectedChallenge && (
          <ChallengeDetailModal
            visible={modalVisible}
            onClose={handleCloseModal}
            title={selectedChallenge.title}
            description={selectedChallenge.description}
            points={selectedChallenge.points}
            timeLeft={selectedChallenge.timeLeft}
            onSubmit={handleSubmit}
          />
        )}
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
  emptyState: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginVertical: 32,
  },
  feedPlaceholder: {
    padding: 20,
    alignItems: 'center',
  },
});

import { StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Header } from '@/components/home/Header';
import { TabSwitcher } from '@/components/home/TabSwitcher';
import { AuraProgressBar } from '@/components/home/AuraProgressBar';
import { ChallengeCard } from '@/components/home/ChallengeCard';
import { ChallengeDetailModal } from '@/components/home/ChallengeDetailModal';
import { FeedCard } from '@/components/home/FeedCard';
import { ReportPostModal } from '@/components/home/ReportPostModal';
import { tailwindColors } from '@/constants/tailwind-colors';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'my-challenges' | 'feed'>('my-challenges');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<{
    title: string;
    points: number;
    timeLeft: string;
    description: string;
  } | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [reportedPosts, setReportedPosts] = useState<Set<number>>(new Set());

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

  // Mock feed data - in production, this would come from the API
  const [feedPosts] = useState([
    {
      id: 1,
      challengeTitle: 'Hike the P',
      points: 300,
      userName: 'Marc Rober',
      caption: 'I DID IT!!!!!!!',
      date: 'Jan 9th, 2026',
      likes: 123,
      userImage: undefined, // Will use placeholder for now
    },
    {
      id: 2,
      challengeTitle: 'Find a cool rock',
      points: 30,
      userName: 'Marc Rober',
      caption: 'Found this awesome rock on my hike!',
      date: 'Jan 8th, 2026',
      likes: 45,
      userImage: undefined,
    },
  ]);

  // Helper function to format date like "Jan 9th, 2026"
  const formatFeedDate = (date: Date): string => {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    
    // Add ordinal suffix (st, nd, rd, th)
    const getOrdinalSuffix = (n: number): string => {
      if (n > 3 && n < 21) return 'th';
      switch (n % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
  };

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

  const handleOpenReportModal = (postId: number) => {
    setSelectedPostId(postId);
    setReportModalVisible(true);
  };

  const handleCloseReportModal = () => {
    setReportModalVisible(false);
    setSelectedPostId(null);
  };

  const handleSubmitReport = (reason: string) => {
    // In production, this would call the API to report the post
    console.log('Reporting post', selectedPostId, 'with reason:', reason);
    // You could also hide the post from the feed here
    // Note: Don't close the modal here - let it show the confirmation screen
    
    // Mark this post as reported
    if (selectedPostId !== null) {
      setReportedPosts(prev => new Set(prev).add(selectedPostId));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        <Header />
        
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {activeTab === 'my-challenges' ? (
            <>
              {/* Progress Bar */}
              <AuraProgressBar current={75} max={100} />

              {/* Incoming Section */}
              <ThemedText style={styles.sectionTitle}>Incoming</ThemedText>
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
                <ThemedText style={styles.emptyState}>No incoming challenges </ThemedText>
              )}

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
            <>
              {feedPosts.length > 0 ? (
                feedPosts.map((post) => (
                  <FeedCard
                    key={post.id}
                    challengeTitle={post.challengeTitle}
                    points={post.points}
                    userName={post.userName}
                    userImage={post.userImage}
                    caption={post.caption}
                    date={post.date}
                    likes={post.likes}
                    onPress={() => console.log('View post', post.id)}
                    onOptionsPress={() => handleOpenReportModal(post.id)}
                    onLikePress={() => console.log('Like post', post.id)}
                  />
                ))
              ) : (
                <ThemedView style={styles.feedPlaceholder}>
                  <ThemedText>No posts yet</ThemedText>
                </ThemedView>
              )}
            </>
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

        {/* Report Post Modal */}
        <ReportPostModal
          visible={reportModalVisible}
          onClose={handleCloseReportModal}
          onSubmit={handleSubmitReport}
          alreadyReported={selectedPostId !== null && reportedPosts.has(selectedPostId)}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tailwindColors['aura-white'],
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: tailwindColors['aura-white'],
  },
  scrollView: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: tailwindColors['aura-black'],
    marginBottom: 12,
    marginTop: 8,
  },
  emptyState: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: tailwindColors['aura-gray-400'],
    textAlign: 'center',
    marginVertical: 32,
  },
  feedPlaceholder: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: tailwindColors['aura-white'],
  },
});

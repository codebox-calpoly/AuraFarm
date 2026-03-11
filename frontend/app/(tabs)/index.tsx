import { StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Header } from '@/components/home/Header';
import { TabSwitcher } from '@/components/home/TabSwitcher';
import { AuraProgressBar } from '@/components/home/AuraProgressBar';
import { ChallengeCard } from '@/components/home/ChallengeCard';
import { ChallengeDetailModal } from '@/components/home/ChallengeDetailModal';
import { FeedCard } from '@/components/home/FeedCard';
import { ReportPostModal } from '@/components/home/ReportPostModal';
import { tailwindColors, tailwindFonts } from '@/constants/tailwind-colors';
import { useFeed, FeedPost } from '@/hooks/useFeed';
import { useLikeCompletion } from '@/hooks/useCompletion';
import { useFeedCache } from "@/stores/feedCache";
import api from '@/lib/api';

const STATIC_FEED_POSTS: Array<{
  id: number;
  challengeTitle: string;
  points: number;
  userName: string;
  userImage?: string;
  caption: string;
  date: string;
  likes: number;
  postImage?: string;
}> = [
    {
      id: -1, // Use negative IDs for static/cached posts to avoid collision with backend
      challengeTitle: "Hike the P",
      points: 300,
      userName: "Marc Rober",
      caption: "I DID IT!!!!!!!",
      date: "Jan 9th, 2026",
      likes: 123,
      userImage: undefined,
    },
    {
      id: -2,
      challengeTitle: "Find a cool rock",
      points: 30,
      userName: "Marc Rober",
      caption: "Found this awesome rock on my hike!",
      date: "Jan 8th, 2026",
      likes: 45,
      userImage: undefined,
    },
  ];

function FeedCardWithLike({ post, onPress, onOptionsPress }: {
  post: any;
  onPress: () => void;
  onOptionsPress: () => void;
}) {
  const [isLiked, setIsLiked] = useState(false);
  // Only use mutation if we have a real ID (> 0)
  const likeMutation = useLikeCompletion(post.id > 0 ? post.id : 0);
  const likes = post.id > 0 ? (likeMutation.data?.likes ?? post.likes) : post.likes;

  const handleLike = () => {
    if (post.id <= 0) {
      // For static posts, just toggle local state (if we had state for them)
      setIsLiked(!isLiked);
      return;
    }
    const nowLiked = !isLiked;
    setIsLiked(nowLiked);
    likeMutation.mutate(nowLiked);
  };

  return (
    <FeedCard
      challengeTitle={post.challengeTitle}
      points={post.points}
      userName={post.userName}
      postImage={post.imageUri || post.postImage}
      caption={post.caption}
      date={post.date}
      likes={likes}
      isLiked={isLiked}
      onPress={onPress}
      onOptionsPress={onOptionsPress}
      onLikePress={handleLike}
    />
  );
}

export default function HomeScreen() {
  const cachedPosts = useFeedCache((s) => s.cachedPosts);
  const addPostToFeed = useFeedCache((s) => s.addPost);
  const { data: apiPosts = [] } = useFeed();

  // Combine all posts: cached (newly created), API posts, and static fallback
  const feedPosts = [...cachedPosts, ...apiPosts, ...STATIC_FEED_POSTS];

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"my-challenges" | "feed">(
    "my-challenges",
  );
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
      title: "Hike the P",
      points: 300,
      timeLeft: "3 days 2 hrs 3 min",
      description:
        "Go to the top of the P and take a smiling picture with a friend.",
    },
  ]);

  const [completedChallenges, setCompletedChallenges] = useState<
    Array<{
      id: number;
      title: string;
      points: number;
      date: string;
      description: string;
      postImage: string;
      caption: string;
      likes: number;
    }>
  >([]);

  const formatFeedDate = (date: Date): string => {
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();

    const getOrdinalSuffix = (n: number): string => {
      if (n > 3 && n < 21) return "th";
      switch (n % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
  };

  const handleViewChallenge = (challenge: {
    title: string;
    points: number;
    timeLeft: string;
    description: string;
  }) => {
    setSelectedChallenge(challenge);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedChallenge(null);
  };

  const handleSubmit = (imageUri: string, caption: string) => {
    if (selectedChallenge) {
      const challengeToComplete = incomingChallenges.find(
        (c) => c.title === selectedChallenge.title,
      );

      if (challengeToComplete) {
        setIncomingChallenges((prev) =>
          prev.filter((c) => c.id !== challengeToComplete.id),
        );

        const today = new Date();
        const formattedDate = formatFeedDate(today);

        setCompletedChallenges((prev) => [
          {
            id: challengeToComplete.id,
            title: challengeToComplete.title,
            points: challengeToComplete.points,
            date: formattedDate,
            description: challengeToComplete.description,
            postImage: imageUri,
            caption: caption,
            likes: 0,
          },
          ...prev,
        ]);

        addPostToFeed({
          challengeTitle: challengeToComplete.title,
          points: challengeToComplete.points,
          userName: "You",
          caption,
          date: formattedDate,
          likes: 0,
          postImage: imageUri,
        });
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

  const handleSubmitReport = async (reason: string) => {
    if (selectedPostId === null) return;
    try {
      if (selectedPostId > 0) {
        await api.post('/flags', { completionId: selectedPostId, reason });
      } else {
        console.log("Reporting static post", selectedPostId, "with reason:", reason);
      }
      setReportedPosts(prev => new Set(prev).add(selectedPostId));
    } catch (error) {
      console.error('Failed to report post:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <Header />

      <ThemedView style={styles.container}>
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === "my-challenges" ? (
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
                <ThemedText style={styles.emptyState}>
                  No incoming challenges
                </ThemedText>
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
                  onPress={() =>
                    router.push(
                      `/post/${challenge.id}?imageUri=${encodeURIComponent(challenge.postImage)}&caption=${encodeURIComponent(challenge.caption)}&likes=${challenge.likes}&title=${encodeURIComponent(challenge.title)}&points=${challenge.points}&isOwnPost=true`,
                    )
                  }
                />
              ))}
            </>
          ) : (
            <>
              {feedPosts.length > 0 ? (
                feedPosts.map((post: any) => (
                  <FeedCardWithLike
                    key={post.id}
                    post={{
                      ...post,
                      date: typeof post.date === 'string' && post.date.includes(',') ? post.date : formatFeedDate(new Date(post.date || Date.now()))
                    }}
                    onPress={() => router.push(`/post/${post.id}?isOwnPost=${post.userName === 'You'}`)}
                    onOptionsPress={() => handleOpenReportModal(post.id)}
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
          alreadyReported={
            selectedPostId !== null && reportedPosts.has(selectedPostId)
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tailwindColors["aura-white"],
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollView: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: tailwindFonts["bold"],
    color: tailwindColors["aura-black"],
    marginBottom: 12,
    marginTop: 8,
  },
  emptyState: {
    fontSize: 16,
    fontFamily: tailwindFonts["regular"],
    color: tailwindColors["aura-gray-400"],
    textAlign: "center",
    marginVertical: 32,
  },
  feedPlaceholder: {
    padding: 20,
    alignItems: "center",
    backgroundColor: tailwindColors["aura-white"],
  },
});

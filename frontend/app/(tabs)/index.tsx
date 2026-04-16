import { Alert, StyleSheet, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { Header } from "@/components/home/Header";
import { TabSwitcher } from "@/components/home/TabSwitcher";
import { AuraProgressBar } from "@/components/home/AuraProgressBar";
import { ChallengeCard } from "@/components/home/ChallengeCard";
import { ChallengeDetailModal } from "@/components/home/ChallengeDetailModal";
import { FeedCard } from "@/components/home/FeedCard";
import { ReportPostModal } from "@/components/home/ReportPostModal";
import { tailwindColors, tailwindFonts } from "@/constants/tailwind-colors";
import {
  getChallenges,
  submitCompletion,
  getUserProfileFromApi,
  getUserCompletionsFromApi,
  getFeedCompletionsFromApi,
  likeCompletion,
  unlikeCompletion,
  flagCompletion,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { uploadCompletionImage } from "@/lib/storage";

type FeedPost = {
  id: number;
  userId: number;
  challengeTitle: string;
  points: number;
  userName: string;
  userImage?: string;
  caption: string;
  date: string;
  likes: number;
  postImage?: string;
};

export default function HomeScreen() {
  const [remoteFeedPosts, setRemoteFeedPosts] = useState<FeedPost[]>([]);
  const feedPosts = remoteFeedPosts;
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"my-challenges" | "feed">(
    "my-challenges",
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<{
    id: number;
    title: string;
    points: number;
    timeLeft: string;
    description: string;
    photoGuidelines?: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [reportedPosts, setReportedPosts] = useState<Set<number>>(new Set());

  // State for challenges
  const [incomingChallenges, setIncomingChallenges] = useState<
    {
      id: number;
      title: string;
      points: number;
      timeLeft: string;
      description: string;
      photoGuidelines?: string;
      latitude: number;
      longitude: number;
    }[]
  >([]);
  const [challengesLoading, setChallengesLoading] = useState(true);
  const [challengesError, setChallengesError] = useState<string | null>(null);
  const [auraCurrent, setAuraCurrent] = useState(0);

  const formatFeedDate = (date: Date): string => {
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();
    const getOrdinalSuffix = (n: number): string => {
      if (n > 3 && n < 21) return "th";
      switch (n % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };
    return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
  };

  const refetchFeed = async () => {
    const feedRes = await getFeedCompletionsFromApi();
    if (feedRes.success) {
      setRemoteFeedPosts(
        feedRes.data.map((c) => ({
          id: c.id,
          userId: c.userId,
          challengeTitle: c.challenge.title,
          points: c.challenge.pointsReward,
          userName: c.user.name ?? "Auranaut",
          userImage: undefined,
          caption: c.caption ?? "",
          date: formatFeedDate(new Date(c.completedAt)),
          likes: c.likes ?? 0,
          postImage: (c.imageUri?.trim() || c.imageUrl?.trim()) || undefined,
        })),
      );
    }
  };

  useEffect(() => {
    getSession().then((session) => {
      if (session?.userId) setCurrentUserId(session.userId);
    });

    // Fire all requests independently so fast ones render immediately
    getChallenges().then((res) => {
      if (res.success) {
        setChallengesError(null);
        getUserCompletionsFromApi().then((compRes) => {
          const completedIds = new Set(
            compRes.success ? compRes.data.map((c) => c.challenge.id) : []
          );
          setIncomingChallenges(
            res.data
              .filter((c) => !completedIds.has(c.id))
              .map((c) => ({
                id: c.id,
                title: c.title,
                points: c.pointsReward,
                timeLeft: "3 days 2 hrs 3 min",
                description: c.description,
                photoGuidelines: c.photoGuidelines,
                latitude: c.latitude,
                longitude: c.longitude,
              })),
          );
          if (compRes.success) {
            setCompletedChallenges(
              compRes.data.map((c) => ({
                id: c.id,
                title: c.challenge.title,
                points: c.challenge.pointsReward,
                date: formatFeedDate(new Date(c.completedAt)),
                description: c.challenge.description,
                postImage: (c.imageUri?.trim() || c.imageUrl?.trim()) || "",
                caption: c.caption ?? "",
                likes: 0,
              })),
            );
          }
          setChallengesLoading(false);
        });
      } else {
        setIncomingChallenges([]);
        setChallengesError(
          res.error ??
            "Could not load challenges. If this persists, check that the API is running and the database URL uses Supabase Transaction pooler (see backend .env.example).",
        );
        setChallengesLoading(false);
      }
    }).catch(() => {
      setChallengesLoading(false);
      setIncomingChallenges([]);
      setChallengesError(
        "Could not load challenges. Check your network and backend.",
      );
    });

    getUserProfileFromApi().then((res) => {
      if (res.success) setAuraCurrent(res.data.auraPoints);
    });

    refetchFeed();
  }, []);

  // Refetch feed when user switches to feed tab so they see fresh posts
  useEffect(() => {
    if (activeTab === "feed") {
      refetchFeed();
    }
  }, [activeTab]);

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

  const handleViewChallenge = (challenge: {
    id: number;
    title: string;
    points: number;
    timeLeft: string;
    description: string;
    photoGuidelines?: string;
    latitude: number;
    longitude: number;
  }) => {
    setSelectedChallenge(challenge);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedChallenge(null);
  };

  const handleSubmit = async (imageUri: string, caption: string) => {
    if (!selectedChallenge) return false;

    const challengeToComplete = incomingChallenges.find(
      (c) => c.id === selectedChallenge.id,
    );
    if (!challengeToComplete) return false;

    try {
      const imageUrl = await uploadCompletionImage(imageUri);
      if (!imageUrl) {
        Alert.alert(
          "Upload failed",
          "Could not upload your image. Please try again.",
        );
        return false;
      }

      const res = await submitCompletion({
        challengeId: selectedChallenge.id,
        latitude: challengeToComplete.latitude,
        longitude: challengeToComplete.longitude,
        imageUrl,
        caption: caption || undefined,
      });

      if (!res.success) {
        Alert.alert(
          "Submission failed",
          res.error || "Could not submit your completion. Please try again.",
        );
        return false;
      }

      const completionId = res.data?.id;
      setIncomingChallenges((prev) =>
        prev.filter((c) => c.id !== challengeToComplete.id),
      );

      const today = new Date();
      const formattedDate = formatFeedDate(today);

      setCompletedChallenges((prev) => [
        {
          id: completionId ?? challengeToComplete.id,
          title: challengeToComplete.title,
          points: challengeToComplete.points,
          date: formattedDate,
          description: challengeToComplete.description,
          postImage: imageUrl || imageUri,
          caption,
          likes: 0,
        },
        ...prev,
      ]);

      // Refetch feed so the new post appears and persists after reload
      await refetchFeed();

      // Refresh Aura so the progress bar updates without leaving the screen
      const profileRes = await getUserProfileFromApi();
      if (profileRes.success) setAuraCurrent(profileRes.data.auraPoints);

      handleCloseModal();
      return true;
    } catch {
      Alert.alert("Error", "Failed to submit. Please try again.");
      return false;
    }
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
    if (selectedPostId === null || selectedPostId < 0) return; // skip static/cached posts
    setReportedPosts((prev) => new Set(prev).add(selectedPostId));
    const res = await flagCompletion(selectedPostId, reason);
    if (!res.success && !res.error?.includes("already flagged")) {
      // Silently ignore duplicate flags; warn on other errors
      console.warn("Flag failed:", res.error);
    }
  };

  const handleLikePost = async (postId: number, liked: boolean) => {
    if (postId < 0) return;
    if (liked) {
      await likeCompletion(postId);
    } else {
      await unlikeCompletion(postId);
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
              <AuraProgressBar points={auraCurrent} />

              {/* Incoming Section */}
              <ThemedText style={styles.sectionTitle}>Incoming</ThemedText>
              {challengesLoading ? (
                <ThemedText style={styles.emptyState}>
                  Loading challenges…
                </ThemedText>
              ) : challengesError ? (
                <ThemedText style={styles.challengesError}>{challengesError}</ThemedText>
              ) : incomingChallenges.length > 0 ? (
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
                feedPosts.map((post) => {
                  const isOwnPost = currentUserId !== null && post.userId === currentUserId;
                  return (
                    <FeedCard
                      key={post.id}
                      challengeTitle={post.challengeTitle}
                      points={post.points}
                      userName={post.userName}
                      userImage={post.userImage}
                      postImage={post.postImage}
                      caption={post.caption}
                      date={post.date}
                      likes={post.likes}
                      onPress={() =>
                        isOwnPost
                          ? router.push(
                              `/post/${post.id}?imageUri=${encodeURIComponent(post.postImage ?? "")}&caption=${encodeURIComponent(post.caption)}&likes=${post.likes}&title=${encodeURIComponent(post.challengeTitle)}&points=${post.points}&isOwnPost=true`
                            )
                          : router.push(
                              `/post/${post.id}?imageUri=${encodeURIComponent(post.postImage ?? "")}&title=${encodeURIComponent(post.challengeTitle)}&points=${post.points}&caption=${encodeURIComponent(post.caption)}&likes=${post.likes}&isOwnPost=false`,
                            )
                      }
                      onOptionsPress={() => handleOpenReportModal(post.id)}
                      onLikePress={(liked) => handleLikePost(post.id, liked)}
                    />
                  );
                })
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
            photoGuidelines={selectedChallenge.photoGuidelines}
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
    backgroundColor: tailwindColors["aura-page"],
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollView: {
    paddingBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: tailwindFonts["bold"],
    color: tailwindColors["aura-gray-500"],
    marginBottom: 14,
    marginTop: 4,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  emptyState: {
    fontSize: 15,
    fontFamily: tailwindFonts["regular"],
    color: tailwindColors["aura-gray-400"],
    textAlign: "center",
    marginVertical: 36,
    lineHeight: 22,
  },
  challengesError: {
    fontSize: 14,
    fontFamily: tailwindFonts["regular"],
    color: tailwindColors["aura-red"],
    textAlign: "center",
    marginVertical: 24,
    marginHorizontal: 8,
    lineHeight: 22,
  },
  feedPlaceholder: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: tailwindColors["aura-surface-muted"],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tailwindColors["aura-border"],
    borderStyle: "dashed",
  },
});

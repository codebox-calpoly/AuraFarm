import { Alert, StyleSheet, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
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
import { useFeedCache } from "@/stores/feedCache";
import {
  getChallenges,
  submitCompletion,
  getUserProfileFromApi,
  getUserCompletionsFromApi,
  getFeedCompletionsFromApi,
} from "@/lib/api";
import { uploadCompletionImage } from "@/lib/storage";

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
    id: 1,
    challengeTitle: "Hike the P",
    points: 300,
    userName: "Marc Rober",
    caption: "I DID IT!!!!!!!",
    date: "Jan 9th, 2026",
    likes: 123,
    userImage: undefined,
  },
  {
    id: 2,
    challengeTitle: "Find a cool rock",
    points: 30,
    userName: "Marc Rober",
    caption: "Found this awesome rock on my hike!",
    date: "Jan 8th, 2026",
    likes: 45,
    userImage: undefined,
  },
];

export default function HomeScreen() {
  const cachedPosts = useFeedCache((s) => s.cachedPosts);
  const addPostToFeed = useFeedCache((s) => s.addPost);
  const [remoteFeedPosts, setRemoteFeedPosts] = useState<typeof STATIC_FEED_POSTS>([]);
  const feedPosts =
    remoteFeedPosts.length > 0
      ? [...cachedPosts, ...remoteFeedPosts]
      : [...cachedPosts, ...STATIC_FEED_POSTS];
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
  } | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [reportedPosts, setReportedPosts] = useState<Set<number>>(new Set());

  // State for challenges
  const [incomingChallenges, setIncomingChallenges] = useState<
    Array<{
      id: number;
      title: string;
      points: number;
      timeLeft: string;
      description: string;
    }>
  >([]);
  const [challengesLoading, setChallengesLoading] = useState(true);
  const [auraCurrent, setAuraCurrent] = useState(0);
  const AURA_MAX = 100;

  useEffect(() => {
    async function load() {
      try {
        const [challengesRes, profileRes, myCompletionsRes, feedRes] =
          await Promise.all([
            getChallenges(),
            getUserProfileFromApi(),
            getUserCompletionsFromApi(),
            getFeedCompletionsFromApi(),
          ]);

        if (challengesRes.success) {
          setIncomingChallenges(
            challengesRes.data.map((c) => ({
              id: c.id,
              title: c.title,
              points: c.pointsReward,
              // TODO: add a real deadline in the DB; for now keep static display
              timeLeft: "3 days 2 hrs 3 min",
              description: c.description,
            })),
          );
        } else {
          // Fallback (dev/offline)
          setIncomingChallenges([
            {
              id: 1,
              title: "Hike the P",
              points: 300,
              timeLeft: "3 days 2 hrs 3 min",
              description:
                "Go to the top of the P and take a smiling picture with a friend.",
            },
          ]);
        }

        if (profileRes.success) {
          setAuraCurrent(profileRes.data.auraPoints);
        }

        if (myCompletionsRes.success) {
          setCompletedChallenges(
            myCompletionsRes.data.map((c) => ({
              id: c.id,
              title: c.challenge.title,
              points: c.challenge.pointsReward,
              date: formatFeedDate(new Date(c.completedAt)),
              description: c.challenge.description,
              postImage: c.imageUrl ?? "",
              caption: c.caption ?? "",
              likes: 0,
            })),
          );
        }

        if (feedRes.success) {
          setRemoteFeedPosts(
            feedRes.data.map((c) => ({
              id: c.id,
              challengeTitle: c.challenge.title,
              points: c.challenge.pointsReward,
              userName: c.user.name ?? "Auranaut",
              userImage: undefined,
              caption: c.caption ?? "",
              date: formatFeedDate(new Date(c.completedAt)),
              likes: 0,
              postImage: c.imageUrl ?? undefined,
            })),
          );
        }
      } catch {
        // Ignore; fallbacks already handled above
      } finally {
        setChallengesLoading(false);
      }
    }

    load();
  }, []);

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

  // Helper function to format date like "Jan 9th, 2026"
  const formatFeedDate = (date: Date): string => {
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();

    // Add ordinal suffix (st, nd, rd, th)
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
    id: number;
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

  const handleSubmit = async (imageUri: string, caption: string) => {
    if (!selectedChallenge) return false;

    const challengeToComplete = incomingChallenges.find(
      (c) => c.id === selectedChallenge.id,
    );
    if (!challengeToComplete) return false;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location required",
          "We verify challenge completion using your location. Please enable location access.",
        );
        return false;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = loc.coords;

      // Upload image first → get a URL to store in DB
      const imageUrl = await uploadCompletionImage(imageUri);
      if (!imageUrl) {
        Alert.alert(
          "Upload failed",
          "Could not upload your image. Make sure you're logged in and try again.",
        );
        return false;
      }

      const res = await submitCompletion({
        challengeId: selectedChallenge.id,
        latitude,
        longitude,
        imageUrl,
        caption: caption || undefined,
      });

      if (!res.success) {
        Alert.alert(
          "Submission failed",
          res.error ||
            "Could not submit. Make sure you are near the challenge location (~100m).",
        );
        return false;
      }

      setIncomingChallenges((prev) =>
        prev.filter((c) => c.id !== challengeToComplete.id),
      );

      const today = new Date();
      const formattedDate = today
        .toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        .replace(",", "th,");

      setCompletedChallenges((prev) => [
        {
          id: challengeToComplete.id,
          title: challengeToComplete.title,
          points: challengeToComplete.points,
          date: formattedDate,
          description: challengeToComplete.description,
          postImage: imageUri,
          caption,
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

  const handleSubmitReport = (reason: string) => {
    // In production, this would call the API to report the post
    console.log("Reporting post", selectedPostId, "with reason:", reason);
    // You could also hide the post from the feed here
    // Note: Don't close the modal here - let it show the confirmation screen

    // Mark this post as reported
    if (selectedPostId !== null) {
      setReportedPosts((prev) => new Set(prev).add(selectedPostId));
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
          {activeTab === "my-challenges" ?
            <>
              {/* Progress Bar */}
              <AuraProgressBar
                current={Math.min(auraCurrent, AURA_MAX)}
                max={AURA_MAX}
              />

              {/* Incoming Section */}
              <ThemedText style={styles.sectionTitle}>Incoming</ThemedText>
              {challengesLoading ? (
                <ThemedText style={styles.emptyState}>
                  Loading challenges…
                </ThemedText>
              ) : incomingChallenges.length > 0 ?
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
              : <ThemedText style={styles.emptyState}>
                  No incoming challenges
                </ThemedText>
              }

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
          : <>
              {feedPosts.length > 0 ?
                feedPosts.map((post) => {
                  const isOwnPost = post.postImage != null;
                  return (
                    <FeedCard
                      key={post.id}
                      challengeTitle={post.challengeTitle}
                      points={post.points}
                      userName={post.userName}
                      userImage={post.userImage}
                      caption={post.caption}
                      date={post.date}
                      likes={post.likes}
                      onPress={() =>
                        isOwnPost
                          ? router.push(
                              `/post/${post.id}?imageUri=${encodeURIComponent(post.postImage!)}&caption=${encodeURIComponent(post.caption)}&likes=${post.likes}&title=${encodeURIComponent(post.challengeTitle)}&points=${post.points}&isOwnPost=true`,
                            )
                          : router.push(
                              `/post/${post.id}?title=${encodeURIComponent(post.challengeTitle)}&points=${post.points}&caption=${encodeURIComponent(post.caption)}&likes=${post.likes}&isOwnPost=false`,
                            )
                      }
                      onOptionsPress={() => handleOpenReportModal(post.id)}
                      onLikePress={() => console.log("Like post", post.id)}
                    />
                  );
                })
              : <ThemedView style={styles.feedPlaceholder}>
                  <ThemedText>No posts yet</ThemedText>
                </ThemedView>
              }
            </>
          }
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

import { Alert, StyleSheet, ScrollView, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { Header } from "@/components/home/Header";
import { TabSwitcher } from "@/components/home/TabSwitcher";
import {
  FeedScopeSwitcher,
  type FeedScope,
} from "@/components/home/FeedScopeSwitcher";
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
  type Challenge,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { uploadCompletionMedia } from "@/lib/storage";
import {
  CHALLENGE_CATEGORY_LABEL,
  CHALLENGE_FILTER_CHIPS,
  type ChallengeCategory,
  type ChallengeFilterId,
} from "@/constants/challengeCategories";
import { CHALLENGE_TAGS_BY_TITLE } from "@/constants/challengeTagsByTitle";

/**
 * Tags for UI + client-side filtering.
 * Prefer the title map first: the DB often still has only `["campus"]` from migration backfill,
 * which would otherwise look like every challenge is Campus-only.
 */
function tagsFromChallengePayload(c: Challenge): ChallengeCategory[] {
  const byTitle = CHALLENGE_TAGS_BY_TITLE[c.title];
  if (byTitle?.length) return byTitle;
  if (Array.isArray(c.tags) && c.tags.length > 0) return c.tags;
  if (c.category) return [c.category];
  return ["campus"];
}

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
  const [feedScope, setFeedScope] = useState<FeedScope>("global");
  const [feedError, setFeedError] = useState<string | null>(null);
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
    tags: ChallengeCategory[];
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
      tags: ChallengeCategory[];
    }[]
  >([]);
  const [challengesLoading, setChallengesLoading] = useState(true);
  const [challengesError, setChallengesError] = useState<string | null>(null);
  const [challengeFilter, setChallengeFilter] = useState<ChallengeFilterId>("all");
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

  const refetchFeed = async (scope: FeedScope = feedScope) => {
    setFeedError(null);
    const feedRes = await getFeedCompletionsFromApi(scope);
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
    } else {
      setRemoteFeedPosts([]);
      setFeedError(feedRes.error ?? "Could not load feed");
    }
  };

  useEffect(() => {
    getSession().then((session) => {
      if (session?.userId) setCurrentUserId(session.userId);
    });

    getUserProfileFromApi().then((res) => {
      if (res.success) setAuraCurrent(res.data.auraPoints);
    });

    refetchFeed();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadChallenges = async () => {
      try {
        setChallengesLoading(true);
        // Always fetch full list: server `?category=` filters on DB tags, which may still be
        // legacy `["campus"]` only — then Sports/Outdoors would return zero rows. We filter
        // client-side using `tagsFromChallengePayload` (title map + API tags).
        const [res, compResSettled] = await Promise.all([
          Promise.race([
            getChallenges({ limit: 100 }),
            new Promise<Awaited<ReturnType<typeof getChallenges>>>((_, reject) =>
              setTimeout(() => reject(new Error("challenges-timeout")), 20_000),
            ),
          ]).catch(() => ({ success: false as const, error: "Could not load challenges" })),
          Promise.race([
            getUserCompletionsFromApi(),
            new Promise<Awaited<ReturnType<typeof getUserCompletionsFromApi>>>(
              (_, reject) =>
                setTimeout(() => reject(new Error("completions-timeout")), 15_000),
            ),
          ]).catch(() => ({ success: false as const, error: "Could not load completions" }))
        ]);
        if (cancelled) return;

        if (!res.success) {
          setIncomingChallenges([]);
          setChallengesError(
            res.error ??
              "Could not load challenges. If this persists, check that the API is running and the database URL uses Supabase Transaction pooler (see backend .env.example).",
          );
          return;
        }

        setChallengesError(null);
        let compRes = compResSettled;
        if (cancelled) return;

        const completedIds = new Set(
          compRes.success ? compRes.data.map((c) => c.challenge.id) : [],
        );

        const open = res.data.filter((c) => !completedIds.has(c.id));
        const withTags = open.map((c) => {
          const ch = c as Challenge;
          const tags = tagsFromChallengePayload(ch);
          return {
            id: c.id,
            title: c.title,
            points: c.pointsReward,
            timeLeft: "3 days 2 hrs 3 min",
            description: c.description,
            photoGuidelines: c.photoGuidelines,
            latitude: c.latitude,
            longitude: c.longitude,
            tags,
          };
        });
        const filtered =
          challengeFilter === "all"
            ? withTags
            : withTags.filter((row) => row.tags.includes(challengeFilter));

        setIncomingChallenges(filtered);
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
      } catch {
        if (!cancelled) {
          setIncomingChallenges([]);
          setChallengesError(
            "Could not load challenges. Check your network and backend.",
          );
        }
      } finally {
        if (!cancelled) setChallengesLoading(false);
      }
    };

    loadChallenges();

    return () => {
      cancelled = true;
    };
  }, [challengeFilter]);

  // Refetch feed when user switches to feed tab or changes Global / Friends
  useEffect(() => {
    if (activeTab === "feed") {
      refetchFeed(feedScope);
    }
  }, [activeTab, feedScope]);

  const [completedChallenges, setCompletedChallenges] = useState<
    {
      id: number;
      title: string;
      points: number;
      date: string;
      description: string;
      postImage: string;
      caption: string;
      likes: number;
    }[]
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
    tags: ChallengeCategory[];
  }) => {
    setSelectedChallenge(challenge);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedChallenge(null);
  };

  const handleSubmit = async (
    mediaUri: string,
    caption: string,
    meta?: { mimeType?: string },
  ) => {
    if (!selectedChallenge) return false;

    const challengeToComplete = incomingChallenges.find(
      (c) => c.id === selectedChallenge.id,
    );
    if (!challengeToComplete) return false;

    try {
      const imageUrl = await uploadCompletionMedia(mediaUri, {
        mimeType: meta?.mimeType,
      });
      if (!imageUrl) {
        Alert.alert(
          "Upload failed",
          "Could not upload your photo or video. Please try again.",
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

      Alert.alert(
        "Challenge Submitted!",
        res.message || "Your post is under review. It will appear on the feed once approved by an admin.",
      );

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
          postImage: imageUrl || mediaUri,
          caption,
          likes: 0,
        },
        ...prev,
      ]);

      // We don't need to refetch the feed immediately since the post is pending review
      // and won't appear until an admin approves it.

      // Aura is granted on the server only after admin approval — do not bump the bar here
      // (avoid implying points landed immediately). Bar refreshes on next screen focus / pull.

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

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterChipsContent}
                style={styles.filterChipsScroll}
              >
                {CHALLENGE_FILTER_CHIPS.map((chip) => {
                  const selected = challengeFilter === chip.id;
                  return (
                    <Pressable
                      key={chip.id}
                      onPress={() => setChallengeFilter(chip.id)}
                      style={[
                        styles.filterChip,
                        selected && styles.filterChipSelected,
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.filterChipText,
                          selected && styles.filterChipTextSelected,
                        ]}
                      >
                        {chip.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>

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
                    categoryLabels={challenge.tags.map(
                      (t) => CHALLENGE_CATEGORY_LABEL[t],
                    )}
                    onPress={() => handleViewChallenge(challenge)}
                  />
                ))
              ) : (
                <ThemedText style={styles.emptyState}>
                  {challengeFilter === "all"
                    ? "No incoming challenges"
                    : "No challenges in this category — try All or another filter"}
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
              <FeedScopeSwitcher
                scope={feedScope}
                onScopeChange={setFeedScope}
              />
              {feedError ? (
                <ThemedText style={styles.challengesError}>{feedError}</ThemedText>
              ) : null}
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
                              `/post/${post.id}?imageUri=${encodeURIComponent(post.postImage ?? "")}&caption=${encodeURIComponent(post.caption)}&likes=${post.likes}&title=${encodeURIComponent(post.challengeTitle)}&points=${post.points}&userName=${encodeURIComponent(post.userName)}&isOwnPost=true`
                            )
                          : router.push(
                              `/post/${post.id}?imageUri=${encodeURIComponent(post.postImage ?? "")}&title=${encodeURIComponent(post.challengeTitle)}&points=${post.points}&caption=${encodeURIComponent(post.caption)}&likes=${post.likes}&userName=${encodeURIComponent(post.userName)}&isOwnPost=false`,
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
  filterChipsScroll: {
    marginBottom: 8,
    flexGrow: 0,
  },
  filterChipsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
    paddingRight: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: tailwindColors["aura-surface"],
    borderWidth: 1,
    borderColor: tailwindColors["aura-border"],
  },
  filterChipSelected: {
    backgroundColor: tailwindColors["aura-green"],
    borderColor: tailwindColors["aura-green"],
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: tailwindFonts["semibold"],
    color: tailwindColors["aura-gray-600"],
  },
  filterChipTextSelected: {
    color: tailwindColors["aura-white"],
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

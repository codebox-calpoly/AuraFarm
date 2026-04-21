import { Header } from "@/components/home/Header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { cardShadow, layout, radius, spacing } from "@/constants/design";
import { tailwindColors, tailwindFonts } from "@/constants/tailwind-colors";
import {
  acceptFriendRequestFromApi,
  cancelOutgoingFriendRequest,
  declineFriendRequestFromApi,
  getFriendsFromApi,
  getIncomingFriendRequestsFromApi,
  getOutgoingFriendRequestsFromApi,
  removeFriendFromApi,
  searchUsersFromApi,
  sendFriendRequestToUser,
  type FriendSummary,
  type UserSearchHit,
} from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Segment = "friends" | "requests";

export default function FriendsScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [segment, setSegment] = useState<Segment>("friends");
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [incoming, setIncoming] = useState<
    { id: number; requester: UserSearchHit; createdAt: string }[]
  >([]);
  const [outgoing, setOutgoing] = useState<
    { id: number; addressee: UserSearchHit; createdAt: string }[]
  >([]);
  const [searchQ, setSearchQ] = useState("");
  const [searchHits, setSearchHits] = useState<UserSearchHit[]>([]);
  const [searching, setSearching] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [f, inc, out] = await Promise.all([
        getFriendsFromApi(),
        getIncomingFriendRequestsFromApi(),
        getOutgoingFriendRequestsFromApi(),
      ]);
      if (f.success) setFriends(f.data);
      else setFriends([]);
      if (inc.success) setIncoming(inc.data);
      else setIncoming([]);
      if (out.success) setOutgoing(out.data);
      else setOutgoing([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const q = searchQ.trim();
    if (q.length < 2) {
      setSearchHits([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setSearching(true);
      const res = await searchUsersFromApi(q);
      if (cancelled) return;
      setSearching(false);
      if (res.success) setSearchHits(res.data);
      else setSearchHits([]);
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [searchQ]);

  const friendIds = new Set(friends.map((x) => x.id));
  const incomingIds = new Set(incoming.map((x) => x.requester.id));
  const outgoingIds = new Set(outgoing.map((x) => x.addressee.id));

  const handleAddFriend = async (id: number) => {
    const res = await sendFriendRequestToUser(id);
    if (res.success) {
      await loadAll();
      Alert.alert("Sent", "Friend request sent.");
    } else {
      Alert.alert("Could not send", res.error ?? "Try again.");
    }
  };

  const handleAccept = async (requesterId: number) => {
    const res = await acceptFriendRequestFromApi(requesterId);
    if (res.success) await loadAll();
    else Alert.alert("Error", res.error ?? "Try again.");
  };

  const handleDecline = async (requesterId: number) => {
    const res = await declineFriendRequestFromApi(requesterId);
    if (res.success) await loadAll();
    else Alert.alert("Error", res.error ?? "Try again.");
  };

  const handleCancelOutgoing = async (targetUserId: number) => {
    const res = await cancelOutgoingFriendRequest(targetUserId);
    if (res.success) await loadAll();
    else Alert.alert("Error", res.error ?? "Try again.");
  };

  const handleRemove = (id: number, name: string) => {
    Alert.alert(
      "Remove friend",
      `Remove ${name} from your friends?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const res = await removeFriendFromApi(id);
            if (res.success) await loadAll();
            else Alert.alert("Error", res.error ?? "Try again.");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Header />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.title}>Friends</ThemedText>
        <ThemedText style={styles.subtitle}>
          Search by name, manage requests, and see people you follow challenges with.
        </ThemedText>

        <View style={styles.segmentTrack}>
          {(["friends", "requests"] as const).map((s) => (
            <Pressable
              key={s}
              onPress={() => setSegment(s)}
              style={[styles.segment, segment === s && styles.segmentOn]}
            >
              <ThemedText
                style={[styles.segmentLabel, segment === s && styles.segmentLabelOn]}
              >
                {s === "friends" ? "Friends" : "Requests"}
                {s === "requests" && incoming.length > 0 ? (
                  <ThemedText style={styles.badge}> {incoming.length}</ThemedText>
                ) : null}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedView style={[styles.card, cardShadow(2)]}>
          <ThemedText style={styles.cardTitle}>Find people</ThemedText>
          <View style={styles.searchRow}>
            <Ionicons
              name="search"
              size={20}
              color={tailwindColors["aura-gray-400"]}
            />
            <TextInput
              value={searchQ}
              onChangeText={setSearchQ}
              placeholder="Search by name (2+ characters)"
              placeholderTextColor={tailwindColors["aura-gray-400"]}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searching ? (
              <ActivityIndicator size="small" color={tailwindColors["aura-green"]} />
            ) : null}
          </View>
          {searchHits.length > 0 ? (
            <View style={styles.hitList}>
              {searchHits.map((u) => {
                const status =
                  friendIds.has(u.id)
                    ? "friends"
                    : incomingIds.has(u.id)
                      ? "accept"
                      : outgoingIds.has(u.id)
                        ? "outgoing"
                        : "add";
                return (
                  <View key={u.id} style={styles.hitRow}>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.hitName}>{u.name}</ThemedText>
                      <ThemedText style={styles.hitMeta}>{u.auraPoints} aura</ThemedText>
                    </View>
                    {status === "friends" ? (
                      <ThemedText style={styles.pillMuted}>Friends</ThemedText>
                    ) : status === "accept" ? (
                      <ThemedText style={styles.pillMuted}>Respond below</ThemedText>
                    ) : status === "outgoing" ? (
                      <ThemedText style={styles.pillMuted}>Pending</ThemedText>
                    ) : (
                      <Pressable
                        style={styles.addBtn}
                        onPress={() => handleAddFriend(u.id)}
                      >
                        <ThemedText style={styles.addBtnText}>Add</ThemedText>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>
          ) : searchQ.trim().length >= 2 && !searching ? (
            <ThemedText style={styles.hint}>No matches</ThemedText>
          ) : null}
        </ThemedView>

        {loading ? (
          <ActivityIndicator
            style={{ marginTop: spacing.lg }}
            color={tailwindColors["aura-green"]}
          />
        ) : segment === "friends" ? (
          <View style={{ marginTop: spacing.md }}>
            {friends.length === 0 ? (
              <ThemedText style={styles.empty}>
                No friends yet — use search above or accept requests.
              </ThemedText>
            ) : (
              friends.map((f) => (
                <ThemedView key={f.id} style={[styles.rowCard, cardShadow(1)]}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.hitName}>{f.name}</ThemedText>
                    <ThemedText style={styles.hitMeta}>{f.auraPoints} aura</ThemedText>
                  </View>
                  <Pressable
                    onPress={() => handleRemove(f.id, f.name)}
                    hitSlop={8}
                  >
                    <ThemedText style={styles.remove}>Remove</ThemedText>
                  </Pressable>
                </ThemedView>
              ))
            )}
          </View>
        ) : (
          <View style={{ marginTop: spacing.md }}>
            <ThemedText style={styles.sectionLabel}>Incoming</ThemedText>
            {incoming.length === 0 ? (
              <ThemedText style={styles.emptySmall}>No incoming requests</ThemedText>
            ) : (
              incoming.map((r) => (
                <ThemedView key={r.id} style={[styles.rowCard, cardShadow(1)]}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.hitName}>{r.requester.name}</ThemedText>
                    <ThemedText style={styles.hitMeta}>
                      {r.requester.auraPoints} aura
                    </ThemedText>
                  </View>
                  <View style={styles.reqActions}>
                    <Pressable
                      style={styles.acceptBtn}
                      onPress={() => handleAccept(r.requester.id)}
                    >
                      <ThemedText style={styles.acceptBtnText}>Accept</ThemedText>
                    </Pressable>
                    <Pressable onPress={() => handleDecline(r.requester.id)}>
                      <ThemedText style={styles.decline}>Decline</ThemedText>
                    </Pressable>
                  </View>
                </ThemedView>
              ))
            )}

            <ThemedText style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
              Outgoing
            </ThemedText>
            {outgoing.length === 0 ? (
              <ThemedText style={styles.emptySmall}>No outgoing requests</ThemedText>
            ) : (
              outgoing.map((r) => (
                <ThemedView key={r.id} style={[styles.rowCard, cardShadow(1)]}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.hitName}>{r.addressee.name}</ThemedText>
                    <ThemedText style={styles.hitMeta}>
                      {r.addressee.auraPoints} aura
                    </ThemedText>
                  </View>
                  <Pressable onPress={() => handleCancelOutgoing(r.addressee.id)}>
                    <ThemedText style={styles.decline}>Cancel</ThemedText>
                  </Pressable>
                </ThemedView>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tailwindColors["aura-page"] },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.sm,
  },
  title: {
    fontFamily: tailwindFonts["bold"],
    fontSize: 28,
    color: tailwindColors["aura-black"],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: tailwindFonts["regular"],
    fontSize: 15,
    color: tailwindColors["aura-gray-500"],
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  segmentTrack: {
    flexDirection: "row",
    backgroundColor: tailwindColors["aura-gray-100"],
    borderRadius: radius.lg,
    padding: 4,
    gap: 4,
    marginBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tailwindColors["aura-border"],
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: radius.md,
  },
  segmentOn: {
    backgroundColor: tailwindColors["aura-surface"],
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  segmentLabel: {
    fontFamily: tailwindFonts["semibold"],
    fontSize: 14,
    color: tailwindColors["aura-gray-500"],
  },
  segmentLabelOn: {
    fontFamily: tailwindFonts["bold"],
    color: tailwindColors["aura-black"],
  },
  badge: {
    fontFamily: tailwindFonts["bold"],
    fontSize: 14,
    color: tailwindColors["aura-green"],
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tailwindColors["aura-border"],
  },
  cardTitle: {
    fontFamily: tailwindFonts["semibold"],
    fontSize: 13,
    color: tailwindColors["aura-gray-600"],
    marginBottom: spacing.sm,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: tailwindColors["aura-gray-100"],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    fontFamily: tailwindFonts["regular"],
    fontSize: 16,
    color: tailwindColors["aura-black"],
    paddingVertical: 10,
  },
  hitList: { marginTop: spacing.md, gap: 0 },
  hitRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: tailwindColors["aura-border"],
  },
  hitName: {
    fontFamily: tailwindFonts["semibold"],
    fontSize: 16,
    color: tailwindColors["aura-black"],
  },
  hitMeta: {
    fontFamily: tailwindFonts["regular"],
    fontSize: 13,
    color: tailwindColors["aura-gray-500"],
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: tailwindColors["aura-green"],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  addBtnText: {
    color: "#fff",
    fontFamily: tailwindFonts["semibold"],
    fontSize: 14,
  },
  pillMuted: {
    fontFamily: tailwindFonts["regular"],
    fontSize: 13,
    color: tailwindColors["aura-gray-400"],
  },
  hint: {
    marginTop: spacing.sm,
    fontFamily: tailwindFonts["regular"],
    fontSize: 13,
    color: tailwindColors["aura-gray-400"],
  },
  empty: {
    textAlign: "center",
    fontFamily: tailwindFonts["regular"],
    fontSize: 15,
    color: tailwindColors["aura-gray-500"],
    marginTop: spacing.md,
    lineHeight: 22,
  },
  emptySmall: {
    fontFamily: tailwindFonts["regular"],
    fontSize: 14,
    color: tailwindColors["aura-gray-400"],
    marginBottom: spacing.sm,
  },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tailwindColors["aura-border"],
    backgroundColor: tailwindColors["aura-surface"],
  },
  remove: {
    fontFamily: tailwindFonts["semibold"],
    fontSize: 14,
    color: tailwindColors["aura-red"],
  },
  sectionLabel: {
    fontFamily: tailwindFonts["bold"],
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: tailwindColors["aura-gray-500"],
    marginBottom: spacing.sm,
  },
  reqActions: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  acceptBtn: {
    backgroundColor: tailwindColors["aura-green"],
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  acceptBtnText: {
    color: "#fff",
    fontFamily: tailwindFonts["semibold"],
    fontSize: 14,
  },
  decline: {
    fontFamily: tailwindFonts["semibold"],
    fontSize: 14,
    color: tailwindColors["aura-gray-500"],
  },
});

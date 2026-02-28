import { create } from "zustand";

export type CachedFeedPost = {
  id: number;
  challengeTitle: string;
  points: number;
  userName: string;
  userImage?: string;
  caption: string;
  date: string;
  likes: number;
  /** Used for navigation to post detail (own post) */
  postImage?: string;
};

type FeedCacheState = {
  cachedPosts: CachedFeedPost[];
  addPost: (post: Omit<CachedFeedPost, "id">) => void;
};

let nextId = 1e6; // Avoid clashing with API ids

export const useFeedCache = create<FeedCacheState>((set) => ({
  cachedPosts: [],
  addPost: (post) =>
    set((state) => ({
      cachedPosts: [
        { ...post, id: nextId++ },
        ...state.cachedPosts,
      ],
    })),
}));

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface FeedPost {
  id: number;
  challengeTitle: string;
  points: number;
  userName: string;
  caption?: string;
  date: string;
  likes: number;
  imageUri: string;
  userImage: undefined;
}

export function useFeed() {
  return useQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const { data } = await api.get('/completions');
      return data.data.map((item: any): FeedPost => ({
        id: item.id,
        challengeTitle: item.challenge.title,
        points: item.challenge.pointsReward,
        userName: item.user.name,
        caption: item.caption ?? undefined,
        date: item.completedAt,
        likes: item.likes,
        imageUri: item.imageUri ?? item.imageUrl ?? "",
        userImage: undefined,
      }));
    },
  });
}
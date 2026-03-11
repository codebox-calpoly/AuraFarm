import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface CompletionDetail {
  id: number;
  userId: number;
  challengeId: number;
  caption: string | null;
  imageUri: string;
  likes: number;
  completedAt: string;
  user: { id: number; name: string; auraPoints: number };
  challenge: { id: number; title: string; description: string; pointsReward: number; latitude: number; longitude: number; difficulty: string; createdAt: string };
}

export function useCompletion(id: number) {
  return useQuery({
    queryKey: ['completion', id],
    queryFn: async (): Promise<CompletionDetail> => {
      const { data } = await api.get(`/completions/${id}`);
      return data.data;
    },
    enabled: !isNaN(id) && id > 0,
  });
}

export function useUpdateCaption(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (caption: string) => {
      const { data } = await api.patch(`/completions/${id}`, { caption });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completion', id] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useLikeCompletion(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (liked: boolean) => {
      if (liked) {
        const { data } = await api.post(`/completions/${id}/like`);
        return data.data;
      } else {
        const { data } = await api.delete(`/completions/${id}/like`);
        return data.data;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['completion', id], (old: CompletionDetail | undefined) => {
        if (!old) return old;
        return { ...old, likes: data.likes };
      });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

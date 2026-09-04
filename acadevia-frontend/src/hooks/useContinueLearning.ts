import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { learningProgressService, type ContinueLearningItem } from '@/services/learningProgress.service';

export function useContinueLearning(limit: number = 6) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const query = useQuery<ContinueLearningItem[]>({
    queryKey: ['continue-learning', user?.id, limit],
    queryFn: async () => {
      if (!user) {
        console.log('[CONTINUE LEARNING DEBUG] queryFn skipped: user is null/undefined');
        return [];
      }
      console.log('[CONTINUE LEARNING DEBUG] queryFn called for user:', { id: user.id, email: user.email });
      const items = await learningProgressService.getRecentProgress(String(user.id), limit);
      console.log('[CONTINUE LEARNING DEBUG] queryFn result items:', items);
      return items;
    },
    enabled: Boolean(user),
    staleTime: 5000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  console.log('[CONTINUE LEARNING DEBUG hook render]', {
    authenticatedUser: user,
    userId: user?.id,
    queryData: query.data,
    queryError: query.error,
    isLoading: query.isLoading,
  });

  useEffect(() => {
    const handleUpdate = () => {
      console.log('[CONTINUE LEARNING DEBUG] acadevia_progress_updated event caught! Invalidating queries.');
      queryClient.invalidateQueries({ queryKey: ['continue-learning', user?.id] });
      queryClient.refetchQueries({ queryKey: ['continue-learning', user?.id] });
    };

    window.addEventListener('acadevia_progress_updated', handleUpdate);
    return () => {
      window.removeEventListener('acadevia_progress_updated', handleUpdate);
    };
  }, [queryClient, user?.id]);

  return query;
}

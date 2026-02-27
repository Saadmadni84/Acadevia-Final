import { useQuery } from '@tanstack/react-query';
import { leaderboardService } from '@/services/leaderboard.service';
import type { LeaderboardScope } from '@/types/leaderboard.types';
import { APP_CONFIG } from '@/config/app.config';

export function useLeaderboard(scope: LeaderboardScope, classLevel?: string) {
  return useQuery({
    queryKey: ['leaderboard', scope, classLevel],
    queryFn: async () => {
      const { data } = await leaderboardService.get(scope, { classLevel });
      return data.data;
    },
    staleTime: APP_CONFIG.STALE_TIME.LEADERBOARD,
    refetchInterval: APP_CONFIG.STALE_TIME.LEADERBOARD,
  });
}

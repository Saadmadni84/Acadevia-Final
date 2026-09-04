import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { gamificationService } from '@/services/gamification.service';
import { useGamificationStore } from '@/stores/useGamificationStore';

export function useGamificationProfile() {
  const setProfile = useGamificationStore((s) => s.setProfile);

  const query = useQuery({
    queryKey: ['gamification-profile'],
    queryFn: async () => {
      const { data } = await gamificationService.getProfile();
      return data.data;
    },
  });

  useEffect(() => {
    if (query.data) {
      setProfile({
        xp: query.data.xp,
        level: query.data.level,
        streak: query.data.streak,
        badges: query.data.badges,
        dailyGoal: query.data.dailyGoal,
        dailyProgress: query.data.dailyProgress,
      });
    }
  }, [query.data, setProfile]);

  return query;
}

export function useGamification() {
  const store = (useGamificationStore as any)();
  return {
    ...store,
    addXP: async (amount: number, reason?: string) => {
      store.addXP?.(amount);
      store.queueAnimation?.({ type: 'xp', value: amount, reason });
    },
    unlockBadge: async (badgeId: string) => {
      store.unlockBadge?.(badgeId);
      store.queueAnimation?.({ type: 'badge', badgeId });
    },
    dequeueAnimation: () => store.dequeueAnimation?.(),
  };
}


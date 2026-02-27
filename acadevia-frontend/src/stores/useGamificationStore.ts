import { create } from 'zustand';
import type { Badge, GamificationEvent } from '@/types/gamification.types';

interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  badges: Badge[];
  animationQueue: GamificationEvent[];
  dailyGoal: number;
  dailyProgress: number;
  setProfile: (data: { xp: number; level: number; streak: number; badges: Badge[]; dailyGoal: number; dailyProgress: number }) => void;
  addXP: (amount: number, source: string) => void;
  incrementStreak: () => void;
  unlockBadge: (badge: Badge) => void;
  queueAnimation: (event: GamificationEvent) => void;
  dequeueAnimation: () => GamificationEvent | undefined;
  setDailyProgress: (progress: number) => void;
}

export const useGamificationStore = create<GamificationState>()((set, get) => ({
  xp: 0,
  level: 1,
  streak: 0,
  badges: [],
  animationQueue: [],
  dailyGoal: 5,
  dailyProgress: 0,
  setProfile: (data) => set(data),
  addXP: (amount, source) => {
    set((s) => ({ xp: s.xp + amount }));
    get().queueAnimation({ type: 'XP_GAINED', data: { amount, source } });
  },
  incrementStreak: () => set((s) => ({ streak: s.streak + 1 })),
  unlockBadge: (badge) => {
    set((s) => ({ badges: [...s.badges, badge] }));
    get().queueAnimation({ type: 'BADGE_UNLOCKED', data: { badge } });
  },
  queueAnimation: (event) => set((s) => ({ animationQueue: [...s.animationQueue, event] })),
  dequeueAnimation: () => {
    const queue = get().animationQueue;
    if (queue.length === 0) return undefined;
    const [first, ...rest] = queue;
    set({ animationQueue: rest });
    return first;
  },
  setDailyProgress: (dailyProgress) => set({ dailyProgress }),
}));

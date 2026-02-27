export interface GamificationProfile { userId: string; xp: number; level: number; streak: number; longestStreak: number; badges: Badge[]; dailyGoal: number; dailyProgress: number; rank: number; }
export interface Badge { id: string; name: string; description: string; iconUrl: string; earnedAt?: string; isEarned: boolean; criteria: string; category: string; }
export interface XPEvent { id: string; amount: number; source: string; description: string; earnedAt: string; }
export type GamificationEventType = 'XP_GAINED' | 'BADGE_UNLOCKED' | 'LEVEL_UP' | 'STREAK_UPDATE' | 'DAILY_REWARD';
export interface GamificationEvent { type: GamificationEventType; data: Record<string, unknown>; }

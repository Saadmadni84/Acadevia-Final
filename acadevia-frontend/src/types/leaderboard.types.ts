export type LeaderboardScope = 'SCHOOL' | 'CITY' | 'STATE' | 'NATIONAL';
export interface LeaderboardEntry { rank: number; userId: string; fullName: string; avatarUrl?: string; schoolName: string; xp: number; level: number; change: number; }
export interface LeaderboardData { scope: LeaderboardScope; entries: LeaderboardEntry[]; userRank?: LeaderboardEntry; lastUpdated: string; }

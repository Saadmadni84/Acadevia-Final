export interface Game { id: string; title: string; description: string; type: string; subject: string; thumbnailUrl?: string; xpReward: number; duration?: number; }
export interface GameScore { gameId: string; userId: string; score: number; xpEarned: number; timeTaken: number; completedAt: string; }

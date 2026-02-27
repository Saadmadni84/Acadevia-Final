export interface Notification { id: string; type: string; title: string; message: string; data?: Record<string, unknown>; isRead: boolean; createdAt: string; }
export interface NotificationPreferences { quizReminders: boolean; streakReminders: boolean; badgeAlerts: boolean; courseUpdates: boolean; leaderboardChanges: boolean; }

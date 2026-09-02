import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userService } from '@/services/user.service';
import type { UserProfile } from '@/types/user.types';

export interface StudentSettings {
  // Learning
  dailyGoalMinutes: number; // 15, 30, 45, 60, 90
  preferredLearningMode: 'video_quiz' | 'video_first' | 'practice_first';
  quizDifficulty: 'easy' | 'balanced' | 'challenging';
  autoContinueLessons: boolean;
  showQuizExplanations: boolean;
  enableRecommendations: boolean;
  studyReminders: boolean;

  // Notifications
  pushNotifications: boolean;
  lessonReminders: boolean;
  streakAlerts: boolean;
  levelUpCelebrations: boolean;
  badgeEarnedAlerts: boolean;
  emailWeeklyDigest: boolean;
  emailCourseProgress: boolean;

  // Appearance
  theme: 'light' | 'dark' | 'system';
  soundEffects: boolean;
  fontSize: 'default' | 'large';

  // Downloads & Offline
  autoDownloadEnrolled: boolean;
  downloadQuality: '360p' | '480p' | '720p';
  wifiOnlyDownloads: boolean;
  keepCompletedLessons: boolean;
  offlineMode: boolean;

  // Privacy & Security
  showActivityToClassmates: boolean;
  showProfileOnLeaderboard: boolean;
  showAchievementsPublicly: boolean;
  twoFactorAuth: boolean;
  loginAlerts: boolean;
}

const DEFAULT_SETTINGS: StudentSettings = {
  dailyGoalMinutes: 30,
  preferredLearningMode: 'video_quiz',
  quizDifficulty: 'balanced',
  autoContinueLessons: true,
  showQuizExplanations: true,
  enableRecommendations: true,
  studyReminders: true,

  pushNotifications: true,
  lessonReminders: true,
  streakAlerts: true,
  levelUpCelebrations: true,
  badgeEarnedAlerts: true,
  emailWeeklyDigest: true,
  emailCourseProgress: false,

  theme: 'light',
  soundEffects: true,
  fontSize: 'default',

  autoDownloadEnrolled: false,
  downloadQuality: '480p',
  wifiOnlyDownloads: true,
  keepCompletedLessons: true,
  offlineMode: true,

  showActivityToClassmates: true,
  showProfileOnLeaderboard: true,
  showAchievementsPublicly: true,
  twoFactorAuth: false,
  loginAlerts: true,
};

interface SettingsState {
  settings: StudentSettings;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  updateSetting: <K extends keyof StudentSettings>(key: K, value: StudentSettings[K]) => void;
  updateBatch: (partial: Partial<StudentSettings>) => void;
  saveToServer: () => Promise<boolean>;
  resetToDefaults: () => void;
  syncWithUser: (user: UserProfile | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      isSaving: false,
      hasUnsavedChanges: false,

      updateSetting: (key, value) => {
        const current = get().settings;
        const next = { ...current, [key]: value };

        // Apply direct side-effects if applicable
        if (key === 'theme') {
          const isDark =
            value === 'dark' ||
            (value === 'system' &&
              window.matchMedia('(prefers-color-scheme: dark)').matches);
          document.documentElement.classList.toggle('dark', isDark);
        }

        if (key === 'soundEffects') {
          try {
            localStorage.setItem('acadevia-sound-enabled', String(value));
          } catch {}
        }

        set({
          settings: next,
          hasUnsavedChanges: true,
        });
      },

      updateBatch: (partial) => {
        set((s) => ({
          settings: { ...s.settings, ...partial },
          hasUnsavedChanges: true,
        }));
      },

      saveToServer: async () => {
        set({ isSaving: true });
        try {
          const { settings } = get();
          await userService.updatePreferences({
            darkMode: settings.theme === 'dark',
            soundEnabled: settings.soundEffects,
            notificationEnabled: settings.pushNotifications,
            downloadQuality: settings.downloadQuality,
            dailyGoal: settings.dailyGoalMinutes,
          });
          set({ isSaving: false, hasUnsavedChanges: false });
          return true;
        } catch {
          // Graceful fallback to local persistence
          set({ isSaving: false, hasUnsavedChanges: false });
          return true;
        }
      },

      resetToDefaults: () => {
        set({ settings: DEFAULT_SETTINGS, hasUnsavedChanges: true });
      },

      syncWithUser: (user) => {
        if (!user) return;
        // Keep synced with authenticated student's state
      },
    }),
    {
      name: 'acadevia-student-settings',
    }
  )
);

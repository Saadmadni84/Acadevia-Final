import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';
import type { NotificationPreferences } from '@/types/notification.types';

const defaultPrefs: NotificationPreferences = {
  quizReminders: true,
  streakReminders: true,
  badgeAlerts: true,
  courseUpdates: true,
  leaderboardChanges: false,
};

const prefKeys: { key: keyof NotificationPreferences; labelKey: string; fallback: string }[] = [
  { key: 'quizReminders', labelKey: 'notifications.prefs.quizReminders', fallback: 'Quiz Reminders' },
  { key: 'streakReminders', labelKey: 'notifications.prefs.streakReminders', fallback: 'Streak Reminders' },
  { key: 'badgeAlerts', labelKey: 'notifications.prefs.badgeAlerts', fallback: 'Badge Alerts' },
  { key: 'courseUpdates', labelKey: 'notifications.prefs.courseUpdates', fallback: 'Course Updates' },
  { key: 'leaderboardChanges', labelKey: 'notifications.prefs.leaderboardChanges', fallback: 'Leaderboard Changes' },
];

const NotificationPrefs: React.FC = () => {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState<NotificationPreferences>(defaultPrefs);

  const toggle = (key: keyof NotificationPreferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 p-4 border-b border-gray-100 dark:border-gray-800">
        <Settings className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {t('notifications.preferences', 'Notification Preferences')}
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {prefKeys.map(({ key, labelKey, fallback }) => (
          <label key={key} className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              {t(labelKey, fallback)}
            </span>
            <button
              role="switch"
              aria-checked={prefs[key]}
              onClick={() => toggle(key)}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                prefs[key] ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                  prefs[key] ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </label>
        ))}
      </div>
    </div>
  );
};

export { NotificationPrefs };

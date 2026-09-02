import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Bell,
  Trophy,
  FileText,
  Flame,
  Settings,
  Megaphone,
  Mail,
  Moon,
  BellRing,
} from 'lucide-react';

interface NotificationPreference {
  key: string;
  enabled: boolean;
}

interface QuietHours {
  enabled: boolean;
  start: string; // "HH:mm"
  end: string;
}

interface NotificationPrefsProps {
  preferences: NotificationPreference[];
  emailNotifications: boolean;
  quietHours: QuietHours;
  pushPermission: 'granted' | 'denied' | 'default';
  onToggle: (key: string, value: boolean) => void;
  onEmailToggle: (value: boolean) => void;
  onQuietHoursChange: (quietHours: QuietHours) => void;
  onRequestPushPermission: () => void;
}

const prefConfig: Record<string, { icon: React.ElementType; label: string; description: string }> = {
  achievements: {
    icon: Trophy,
    label: 'Achievements',
    description: 'Badge and level-up notifications',
  },
  quiz_reminders: {
    icon: FileText,
    label: 'Quiz Reminders',
    description: 'Upcoming quiz and deadline alerts',
  },
  streak_warnings: {
    icon: Flame,
    label: 'Streak Warnings',
    description: 'Alerts when your streak is at risk',
  },
  system_updates: {
    icon: Settings,
    label: 'System Updates',
    description: 'Platform maintenance and updates',
  },
  announcements: {
    icon: Megaphone,
    label: 'Announcements',
    description: 'School and teacher announcements',
  },
};

interface ToggleRowProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  id: string;
}

function ToggleRow({ icon: Icon, label, description, checked, onChange, id }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500" aria-hidden="true" />
        <div>
          <label htmlFor={id} className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </label>
          {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
          checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function NotificationPrefs({
  preferences,
  emailNotifications,
  quietHours,
  pushPermission,
  onToggle,
  onEmailToggle,
  onQuietHoursChange,
  onRequestPushPermission,
}: NotificationPrefsProps) {
  const { t } = useTranslation();
  const [localQuiet, setLocalQuiet] = useState(quietHours);

  const handleQuietToggle = (enabled: boolean) => {
    const updated = { ...localQuiet, enabled };
    setLocalQuiet(updated);
    onQuietHoursChange(updated);
  };

  const handleQuietTime = (field: 'start' | 'end', value: string) => {
    const updated = { ...localQuiet, [field]: value };
    setLocalQuiet(updated);
    onQuietHoursChange(updated);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-primary" aria-hidden="true" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('notificationPrefs.title', 'Notification Preferences')}
        </h1>
      </div>

      {/* Push Permission */}
      {pushPermission !== 'granted' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/10 p-4 dark:border-primary/30 dark:bg-primary/20"
        >
          <div className="flex items-center gap-3">
            <BellRing className="h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {t('notificationPrefs.enablePush', 'Enable Push Notifications')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {pushPermission === 'denied'
                  ? t('notificationPrefs.pushDenied', 'Push notifications were blocked. Enable in browser settings.')
                  : t('notificationPrefs.pushDesc', 'Get real-time notifications on this device')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRequestPushPermission}
            disabled={pushPermission === 'denied'}
            className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition hover:bg-primary-dark disabled:opacity-50 cursor-pointer"
          >
            {t('notificationPrefs.allow', 'Allow')}
          </button>
        </motion.div>
      )}

      {/* Notification Type Toggles */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white px-5 shadow-sm dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800"
        aria-label={t('notificationPrefs.types', 'Notification types')}
      >
        {preferences.map((pref) => {
          const cfg = prefConfig[pref.key];
          if (!cfg) return null;
          return (
            <ToggleRow
              key={pref.key}
              id={`notif-${pref.key}`}
              icon={cfg.icon}
              label={t(`notificationPrefs.${pref.key}`, cfg.label)}
              description={t(`notificationPrefs.${pref.key}Desc`, cfg.description)}
              checked={pref.enabled}
              onChange={(v) => onToggle(pref.key, v)}
            />
          );
        })}
      </motion.section>

      {/* Email Notifications */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border border-gray-200 bg-white px-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <ToggleRow
          id="notif-email"
          icon={Mail}
          label={t('notificationPrefs.email', 'Email Notifications')}
          description={t('notificationPrefs.emailDesc', 'Receive weekly digest and important alerts via email')}
          checked={emailNotifications}
          onChange={onEmailToggle}
        />
      </motion.section>

      {/* Quiet Hours */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        aria-label={t('notificationPrefs.quietHours', 'Quiet Hours')}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {t('notificationPrefs.quietHours', 'Quiet Hours')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('notificationPrefs.quietDesc', 'Mute notifications during specific hours')}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={localQuiet.enabled}
            onClick={() => handleQuietToggle(!localQuiet.enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
              localQuiet.enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                localQuiet.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {localQuiet.enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-4 flex items-center gap-3"
          >
            <div>
              <label htmlFor="quiet-start" className="text-xs text-gray-500 dark:text-gray-400">
                {t('notificationPrefs.from', 'From')}
              </label>
              <input
                id="quiet-start"
                type="time"
                value={localQuiet.start}
                onChange={(e) => handleQuietTime('start', e.target.value)}
                className="mt-1 block rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <span className="mt-5 text-gray-400">—</span>
            <div>
              <label htmlFor="quiet-end" className="text-xs text-gray-500 dark:text-gray-400">
                {t('notificationPrefs.to', 'To')}
              </label>
              <input
                id="quiet-end"
                type="time"
                value={localQuiet.end}
                onChange={(e) => handleQuietTime('end', e.target.value)}
                className="mt-1 block rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </motion.div>
        )}
      </motion.section>
    </div>
  );
}

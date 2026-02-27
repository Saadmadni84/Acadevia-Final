import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Bell,
  Download,
  Wifi,
  Moon,
  Volume2,
  RefreshCw,
  Trash2,
  Lock,
  LogOut,
  AlertTriangle,
} from 'lucide-react';

interface SettingsPageProps {
  settings: {
    language: string;
    notificationsEnabled: boolean;
    downloadQuality: 'low' | 'medium' | 'high';
    dataSaver: boolean;
    darkMode: boolean;
    soundEffects: boolean;
    autoSync: boolean;
  };
  availableLanguages?: { code: string; label: string }[];
  onSettingChange: (key: string, value: unknown) => void;
  onClearCache: () => void | Promise<void>;
  onChangePassword: () => void;
  onLogout: () => void;
}

const defaultLanguages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ur', label: 'اردو' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
];

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
          <label htmlFor={id} className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
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

export default function SettingsPage({
  settings,
  availableLanguages = defaultLanguages,
  onSettingChange,
  onClearCache,
  onChangePassword,
  onLogout,
}: SettingsPageProps) {
  const { t } = useTranslation();
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        {t('settings.title', 'Settings')}
      </h1>

      {/* Language Preference */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <label
          htmlFor="settings-lang"
          className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"
        >
          <Globe className="h-5 w-5 text-indigo-500" aria-hidden="true" />
          {t('settings.language', 'Language')}
        </label>
        <select
          id="settings-lang"
          value={settings.language}
          onChange={(e) => onSettingChange('language', e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          {availableLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </motion.section>

      {/* Toggles */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white px-5 shadow-sm dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800"
      >
        <ToggleRow
          id="toggle-notifications"
          icon={Bell}
          label={t('settings.notifications', 'Notifications')}
          description={t('settings.notificationsDesc', 'Receive push notifications')}
          checked={settings.notificationsEnabled}
          onChange={(v) => onSettingChange('notificationsEnabled', v)}
        />
        <ToggleRow
          id="toggle-datasaver"
          icon={Wifi}
          label={t('settings.dataSaver', 'Data Saver')}
          description={t('settings.dataSaverDesc', 'Reduce data usage on mobile networks')}
          checked={settings.dataSaver}
          onChange={(v) => onSettingChange('dataSaver', v)}
        />
        <ToggleRow
          id="toggle-darkmode"
          icon={Moon}
          label={t('settings.darkMode', 'Dark Mode')}
          checked={settings.darkMode}
          onChange={(v) => onSettingChange('darkMode', v)}
        />
        <ToggleRow
          id="toggle-sound"
          icon={Volume2}
          label={t('settings.soundEffects', 'Sound Effects')}
          checked={settings.soundEffects}
          onChange={(v) => onSettingChange('soundEffects', v)}
        />
        <ToggleRow
          id="toggle-autosync"
          icon={RefreshCw}
          label={t('settings.autoSync', 'Auto-Sync')}
          description={t('settings.autoSyncDesc', 'Automatically sync progress when online')}
          checked={settings.autoSync}
          onChange={(v) => onSettingChange('autoSync', v)}
        />
      </motion.section>

      {/* Download Quality */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <label
          htmlFor="settings-quality"
          className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"
        >
          <Download className="h-5 w-5 text-indigo-500" aria-hidden="true" />
          {t('settings.downloadQuality', 'Download Quality')}
        </label>
        <select
          id="settings-quality"
          value={settings.downloadQuality}
          onChange={(e) => onSettingChange('downloadQuality', e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="low">{t('settings.qualityLow', 'Low (saves data)')}</option>
          <option value="medium">{t('settings.qualityMedium', 'Medium')}</option>
          <option value="high">{t('settings.qualityHigh', 'High (best quality)')}</option>
        </select>
      </motion.section>

      {/* Cache */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-gray-400" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {t('settings.clearCache', 'Clear Cached Data')}
            </span>
          </div>
          <AnimatePresence mode="wait">
            {confirmClear ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClearCache();
                    setConfirmClear(false);
                  }}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                >
                  {t('common.confirm', 'Confirm')}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                type="button"
                onClick={() => setConfirmClear(true)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {t('settings.clear', 'Clear')}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Account Security */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        aria-label={t('settings.security', 'Account Security')}
      >
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
          <Lock className="h-5 w-5 text-indigo-500" aria-hidden="true" />
          {t('settings.security', 'Account Security')}
        </h2>
        <button
          type="button"
          onClick={onChangePassword}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {t('settings.changePassword', 'Change Password')}
        </button>
      </motion.section>

      {/* Logout */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-xl border border-red-200 bg-white p-5 shadow-sm dark:border-red-900 dark:bg-gray-800"
      >
        <AnimatePresence mode="wait">
          {confirmLogout ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                {t('settings.logoutConfirm', 'Are you sure you want to log out?')}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {t('settings.logout', 'Log Out')}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmLogout(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type="button"
              onClick={() => setConfirmLogout(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {t('settings.logout', 'Log Out')}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.section>
    </div>
  );
}

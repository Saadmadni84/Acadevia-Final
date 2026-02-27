import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Save,
  Zap,
  Award,
  Flame,
  TrendingUp,
  Star,
  Trophy,
  Target,
} from 'lucide-react';

interface XPAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  value: number;
}

interface BadgeCriteria {
  id: string;
  name: string;
  description: string;
  threshold: number;
  metric: string;
}

interface LevelThreshold {
  level: number;
  xpRequired: number;
  title: string;
}

const GamificationConfig: React.FC = () => {
  const { t } = useTranslation();
  const [saved, setSaved] = useState(false);

  const [xpActions, setXpActions] = useState<XPAction[]>([
    { key: 'quizComplete', label: 'Quiz Complete', icon: <Target className="h-4 w-4" />, value: 50 },
    { key: 'lessonComplete', label: 'Lesson Complete', icon: <Star className="h-4 w-4" />, value: 30 },
    { key: 'gameWin', label: 'Game Win', icon: <Trophy className="h-4 w-4" />, value: 75 },
    { key: 'streakBonus', label: 'Streak Bonus (per day)', icon: <Flame className="h-4 w-4" />, value: 10 },
    { key: 'perfectQuiz', label: 'Perfect Quiz Score', icon: <Award className="h-4 w-4" />, value: 100 },
    { key: 'dailyLogin', label: 'Daily Login', icon: <Zap className="h-4 w-4" />, value: 5 },
  ]);

  const [badges, setBadges] = useState<BadgeCriteria[]>([
    { id: '1', name: 'Quiz Master', description: 'Complete N quizzes', threshold: 50, metric: 'quizzes_completed' },
    { id: '2', name: 'Streak Champion', description: 'Maintain N day streak', threshold: 30, metric: 'streak_days' },
    { id: '3', name: 'XP Legend', description: 'Earn N total XP', threshold: 10000, metric: 'total_xp' },
    { id: '4', name: 'Perfect Scorer', description: 'Get N perfect quiz scores', threshold: 10, metric: 'perfect_scores' },
    { id: '5', name: 'Lesson Finisher', description: 'Complete N lessons', threshold: 100, metric: 'lessons_completed' },
  ]);

  const [streakDays, setStreakDays] = useState(7);
  const [streakMultiplier, setStreakMultiplier] = useState(1.5);

  const [levels, setLevels] = useState<LevelThreshold[]>([
    { level: 1, xpRequired: 0, title: 'Beginner' },
    { level: 2, xpRequired: 100, title: 'Learner' },
    { level: 3, xpRequired: 300, title: 'Explorer' },
    { level: 4, xpRequired: 600, title: 'Achiever' },
    { level: 5, xpRequired: 1000, title: 'Scholar' },
    { level: 6, xpRequired: 1500, title: 'Expert' },
    { level: 7, xpRequired: 2500, title: 'Master' },
    { level: 8, xpRequired: 4000, title: 'Grandmaster' },
    { level: 9, xpRequired: 6000, title: 'Legend' },
    { level: 10, xpRequired: 10000, title: 'Champion' },
  ]);

  const updateXP = (key: string, value: number) => {
    setXpActions((prev) =>
      prev.map((a) => (a.key === key ? { ...a, value: Math.max(0, value) } : a))
    );
  };

  const updateBadgeThreshold = (id: string, threshold: number) => {
    setBadges((prev) =>
      prev.map((b) => (b.id === id ? { ...b, threshold: Math.max(1, threshold) } : b))
    );
  };

  const updateLevel = (level: number, field: 'xpRequired' | 'title', value: number | string) => {
    setLevels((prev) =>
      prev.map((l) => (l.level === level ? { ...l, [field]: value } : l))
    );
  };

  const handleSave = () => {
    console.log('Config saved:', { xpActions, badges, streakDays, streakMultiplier, levels });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const cardDelay = (i: number) => ({ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.1 } } });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.gamification.title', 'Gamification Configuration')}
        </h2>
        <button
          type="button"
          onClick={handleSave}
          className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors shadow-sm ${
            saved ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          <Save className="h-4 w-4" />
          {saved
            ? t('admin.gamification.saved', 'Saved!')
            : t('admin.gamification.save', 'Save Changes')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* XP Values */}
        <motion.div
          variants={cardDelay(0)}
          initial="hidden"
          animate="visible"
          className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Zap className="h-5 w-5 text-yellow-500" />
            {t('admin.gamification.xpValues', 'XP Values per Action')}
          </h3>
          <div className="space-y-3">
            {xpActions.map((action) => (
              <div key={action.key} className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-indigo-500">{action.icon}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={action.value}
                    onChange={(e) => updateXP(action.key, parseInt(e.target.value) || 0)}
                    className="w-20 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-center text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    aria-label={`XP for ${action.label}`}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">XP</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Badge Criteria */}
        <motion.div
          variants={cardDelay(1)}
          initial="hidden"
          animate="visible"
          className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Award className="h-5 w-5 text-purple-500" />
            {t('admin.gamification.badges', 'Badge Criteria')}
          </h3>
          <div className="space-y-3">
            {badges.map((badge) => (
              <div key={badge.id} className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{badge.name}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={badge.threshold}
                      onChange={(e) => updateBadgeThreshold(badge.id, parseInt(e.target.value) || 1)}
                      className="w-20 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-center text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      aria-label={`Threshold for ${badge.name}`}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{badge.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Streak Rules */}
        <motion.div
          variants={cardDelay(2)}
          initial="hidden"
          animate="visible"
          className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Flame className="h-5 w-5 text-orange-500" />
            {t('admin.gamification.streakRules', 'Streak Rules')}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('admin.gamification.streakDays', 'Streak Milestone (days)')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Bonus awarded at every N consecutive days
                </p>
              </div>
              <input
                type="number"
                min={1}
                value={streakDays}
                onChange={(e) => setStreakDays(parseInt(e.target.value) || 1)}
                className="w-20 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-center text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                aria-label="Streak days"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('admin.gamification.multiplier', 'Bonus Multiplier')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  XP multiplier applied at streak milestone
                </p>
              </div>
              <input
                type="number"
                min={1}
                max={5}
                step={0.1}
                value={streakMultiplier}
                onChange={(e) => setStreakMultiplier(parseFloat(e.target.value) || 1)}
                className="w-20 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-center text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                aria-label="Streak multiplier"
              />
            </div>
          </div>
        </motion.div>

        {/* Level Thresholds */}
        <motion.div
          variants={cardDelay(3)}
          initial="hidden"
          animate="visible"
          className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <TrendingUp className="h-5 w-5 text-green-500" />
            {t('admin.gamification.levels', 'Level Thresholds')}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 text-left font-medium text-gray-600 dark:text-gray-400">Lvl</th>
                  <th className="pb-2 text-left font-medium text-gray-600 dark:text-gray-400">Title</th>
                  <th className="pb-2 text-right font-medium text-gray-600 dark:text-gray-400">XP Required</th>
                </tr>
              </thead>
              <tbody>
                {levels.map((level) => (
                  <tr key={level.level} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                        {level.level}
                      </span>
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        value={level.title}
                        onChange={(e) => updateLevel(level.level, 'title', e.target.value)}
                        className="rounded border border-transparent bg-transparent px-2 py-1 text-sm text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                        aria-label={`Level ${level.level} title`}
                      />
                    </td>
                    <td className="py-2 text-right">
                      <input
                        type="number"
                        min={0}
                        value={level.xpRequired}
                        onChange={(e) => updateLevel(level.level, 'xpRequired', parseInt(e.target.value) || 0)}
                        className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1 text-right text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        aria-label={`Level ${level.level} XP`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GamificationConfig;
